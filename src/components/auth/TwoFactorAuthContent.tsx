/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import OtpInput from "react-otp-input";
import useAuthEmailStore from "@/store/authEmail.store";
import useTimerStore from "@/store/timer.store";
import { useResend2faCode, useVerify2faCode } from "@/api/auth/auth.queries";
import useUserStore from "@/store/user.store";
import Cookies from "js-cookie";
import { initializeFCM } from "@/services/fcm.service";
import { User } from "@/constants/types";
import images from "../../../public/images";
import { useQueryClient } from "@tanstack/react-query";

const TwoFactorAuthContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { authEmail } = useAuthEmailStore();
  const [token, setToken] = useState("");
  const { setUser, setIsLoggedIn } = useUserStore();
  const hasAutoVerifiedRef = useRef(false);

  const isValid = token.length === 6;

  const onVerificationSuccess = async (data: any) => {
    const user: User = data?.data?.user;
    
    // Set cookie with proper options to ensure it's accessible
    const accessToken = data?.data?.accessToken;
    if (accessToken) {
      Cookies.set("accessToken", accessToken, {
        expires: 7, // 7 days
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
    
    setUser(user);
    setIsLoggedIn(true);
    SuccessToast({
      title: "Two-Factor Authentication Verified",
      description: "Your account has been successfully verified!",
    });
    
    // Initialize FCM token registration
    initializeFCM().catch((err) => {
      console.error("FCM initialization failed:", err);
    });
    
    // Wait a bit to ensure cookie is set, then refetch user profile
    setTimeout(async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      await queryClient.refetchQueries({ queryKey: ["user"] });
    }, 100);
    
    // After 2FA verification, check BVN/NIN verification status
    setTimeout(() => {
      // Step 1: Check if BVN or NIN is verified
      // User cannot go to dashboard until BVN or NIN is verified
      const isBvnOrNinVerified = user?.isBvnVerified || user?.isNinVerified;
      if (!isBvnOrNinVerified) {
        // Both BVN and NIN are false - navigate to open account page to verify
        navigate("/open-account", "replace");
        return;
      }
      
      // Step 2: Check if wallet PIN is set
      if (!user?.isWalletPinSet) {
        // Wallet PIN is not set - navigate to transaction pin page
        navigate("/transaction-pin", "replace");
        return;
      }
      
      // Step 3: All verifications complete - go to dashboard
      const returnTo = sessionStorage.getItem("returnTo");
      // Only use returnTo if it's a valid user route (not home page)
      const redirectPath = 
        returnTo && returnTo !== "/" && returnTo.startsWith("/user")
          ? returnTo
          : "/user/dashboard";
      // Clear returnTo from sessionStorage after using it
      sessionStorage.removeItem("returnTo");
      navigate(redirectPath, "replace");
    }, 200);
    
    setToken("");
    hasAutoVerifiedRef.current = false; // Reset ref after successful verification
  };

  const onVerificationError = (error: any) => {
    const errorMessage = error.response?.data?.message;

    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
    
    // Clear the token to stop auto-verification from retrying
    setToken("");
    
    // Reset the ref on error so user can retry
    hasAutoVerifiedRef.current = false;
  };

  const {
    mutate: verify2faCode,
    isPending: verificationPending,
    isError: verificationError,
    reset: resetVerification,
  } = useVerify2faCode(onVerificationError, onVerificationSuccess);

  const onResendVerificationCodeSuccess = (data: any) => {
    useTimerStore.getState().setTimer(50); // Set timer to 50 seconds as per screenshot
    SuccessToast({
      title: "Sent Successfully!",
      description: data.data?.message || "Verification code has been resent to your email.",
    });
  };

  const onResendVerificationCodeError = (error: any) => {
    const errorMessage = error.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Sending Failed",
      descriptions,
    });
  };

  const {
    mutate: resend2faCode,
    isPending: resend2faCodePending,
    isError: resend2faCodeError,
  } = useResend2faCode(
    onResendVerificationCodeError,
    onResendVerificationCodeSuccess
  );

  const handleVerify = async () => {
    if (token.length === 6) {
      // Reset any previous error state
      resetVerification();
      
      // Get email from store - required for 2FA verification
      // Fallback: try to get email from user store if authEmail is not set
      let emailToUse = authEmail;
      if (!emailToUse) {
        const user = useUserStore.getState().user;
        emailToUse = user?.email || "";
      }
      
      if (!emailToUse) {
        ErrorToast({
          title: "Email Required",
          descriptions: ["Email address is required for verification. Please try logging in again."],
        });
        hasAutoVerifiedRef.current = false; // Reset ref on error
        return;
      }
      
      // Verify 2FA code - requires both email and OTP code
      verify2faCode({
        email: emailToUse,
        otpCode: token,
      });
    }
  };

  const handleResendClick = async () => {
    if (resendTimer === 0 && !resend2faCodePending) {
      // Get email from store - required for resending 2FA code
      // Fallback: try to get email from user store if authEmail is not set
      let emailToUse = authEmail;
      if (!emailToUse) {
        const user = useUserStore.getState().user;
        emailToUse = user?.email || "";
      }
      
      if (!emailToUse) {
        ErrorToast({
          title: "Email Required",
          descriptions: ["Email address is required to resend verification code. Please try logging in again."],
        });
        return;
      }
      
      // Resend 2FA email - requires email parameter
      resend2faCode({ email: emailToUse });
    }
  };

  const timerStore = useTimerStore();
  const resendTimer = timerStore.resendTimer;
  const decrementTimer = timerStore.decrementTimer;
  const expireAt = timerStore.expireAt;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (resendTimer > 0) {
      interval = setInterval(() => {
        if (decrementTimer) decrementTimer();
      }, 1000);
    } else {
      // When timer reaches 0, clear the interval
      if (interval) clearInterval(interval);
      timerStore.clearTimer(); // Clear state to prevent reset
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, decrementTimer, timerStore]);

  useEffect(() => {
    if (expireAt && Date.now() >= expireAt) {
      timerStore.clearTimer();
    }
  }, [expireAt, timerStore]);

  const formatTimer = (seconds: number) => {
    // Format as "50seconds" (no space, lowercase)
    return `${seconds}seconds`;
  };

  const handlePaste: React.ClipboardEventHandler = (event) => {
    const data = event.clipboardData.getData("text").slice(0, 6);
    setToken(data);
  };

  const loadingStatus = verificationPending && !verificationError;

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    // Reset the ref when token changes (user is typing)
    if (token.length < 6) {
      hasAutoVerifiedRef.current = false;
      return;
    }

    // Auto-verify when 6 digits are entered and not already verifying
    if (token.length === 6 && !verificationPending && !loadingStatus && !hasAutoVerifiedRef.current) {
      hasAutoVerifiedRef.current = true;
      // Small delay to ensure token state is fully updated
      const timeoutId = setTimeout(() => {
        handleVerify();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verificationPending, loadingStatus]);

  // REMOVED: Auto-send 2FA code on mount
  // Code should only be sent when user clicks "Resend" button
  // The login API should send the code automatically, not this component
  const resendLoadingStatus = resend2faCodePending && !resend2faCodeError;

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Padlock Icon */}
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-48 h-48 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Two-Factor Authentication
          </h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Verify your identity with a code sent to your email. This adds an extra layer of security to protect your account from unauthorized access.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Two Factor Authentication
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter the code sent to {authEmail || "your email"}
            </p>

            <div className="space-y-6">
              {/* OTP Input */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center w-full">
                  <OtpInput
                    value={token}
                    onChange={setToken}
                    onPaste={handlePaste}
                    numInputs={6}
                    renderSeparator={<span className="w-2"></span>}
                    containerStyle={{}}
                    skipDefaultStyles
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139] text-[#141414] dark:text-white"
                      />
                    )}
                  />
                </div>

                {/* Resend Text */}
                <p className="text-center text-sm text-gray-600">
                  {resendTimer && resendTimer > 0 ? (
                    <>
                      Didn't receive the code?{" "}
                      <span className="text-[#D4B139]">Resend</span> in{" "}
                      <span className="text-[#D4B139]">{formatTimer(resendTimer)}</span>
                    </>
                  ) : (
                    <>
                      Didn't receive the code?{" "}
                      <span
                        className="text-[#D4B139] cursor-pointer hover:underline"
                        onClick={handleResendClick}
                      >
                        {resendLoadingStatus ? "Resending..." : "Resend"}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <CustomButton
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-[#D4B139]/20 hover:bg-[#D4B139]/30 text-gray-800 font-medium py-3 rounded-lg"
                >
                  Back
                </CustomButton>
                <CustomButton
                  type="button"
                  disabled={!isValid || loadingStatus}
                  isLoading={loadingStatus}
                  onClick={handleVerify}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Proceed
                </CustomButton>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] xs:text-xs text-gray-500 mt-8 px-2">
              <p className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 flex-nowrap whitespace-nowrap">
                <span>Licenced by CBN</span>
                <Image
                  src={images.cbnLogo}
                  alt="CBN Logo"
                  width={40}
                  height={20}
                  className="h-3 xs:h-4 sm:h-5 w-auto object-contain"
                />
                <span>Deposits Insured by</span>
                <span className="text-blue-600 underline">NDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthContent;
