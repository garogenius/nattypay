/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";

import useAuthEmailStore from "@/store/authEmail.store";
import useTimerStore from "@/store/timer.store";
import { useRouter } from "next/navigation";
import SpinnerLoader from "../Loader/SpinnerLoader";
import icons from "../../../public/icons";
import images from "../../../public/images";

import {
  useVerifyContact,
  useResendVerifyContact,
} from "@/api/auth/auth.queries";

const VerifyPhoneNumberContent = () => {
  const navigate = useNavigate();
  const router = useRouter();

  const { authEmail, authPhoneNumber } = useAuthEmailStore();
  const [token, setToken] = useState("");

  const isValid = token.length === 6; // Changed to 6 digits to match verify-contact API

  const onVerificationSuccess = () => {
    SuccessToast({
      title: "Phone verified",
      description: "Your phone number verification successful",
    });
    // Navigate to open account page for BVN/NIN verification
    navigate("/open-account", "replace");
    setToken("");
  };

  const onVerificationError = (error: any) => {
    const errorMessage = error.response.data.message;

    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
  };

  const {
    mutate: verifyContact,
    isPending: verificationPending,
    isError: verificationError,
    reset: resetVerification,
  } = useVerifyContact(onVerificationError, onVerificationSuccess);

  const onResendVerificationCodeSuccess = (data: any) => {
    useTimerStore.getState().setTimer(120);
    SuccessToast({
      title: "Sent Successfully!",
      description: data.data.message,
    });
  };

  const onResendVerificationCodeError = (error: any) => {
    const errorMessage = error.response.data.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Sending Failed",
      descriptions,
    });
  };

  const {
    mutate: resendVerificationCode,
    isPending: resendVerificationCodePending,
    isError: resendVerificationCodeError,
  } = useResendVerifyContact(
    onResendVerificationCodeError,
    onResendVerificationCodeSuccess
  );

  const handleVerify = async () => {
    const identifier = authPhoneNumber || authEmail;
    if (identifier) {
      resetVerification();
      verifyContact({
        identifier: identifier,
        otpCode: token,
      });
    }
  };

  const handleResendClick = async () => {
    if (resendTimer === 0) {
      const identifier = authPhoneNumber || authEmail;
      if (identifier) {
        resendVerificationCode({
          identifier: identifier,
        });
      }
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
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePaste: React.ClipboardEventHandler = (event) => {
    const data = event.clipboardData.getData("text").slice(0, 6); // Get first 6 characters
    setToken(data);
  };

  useEffect(() => {
    const identifier = authPhoneNumber || authEmail;
    if (!identifier) {
      ErrorToast({
        title: "Error",
        descriptions: ["No contact information found. Please try again."],
      });
      router.back();
    }
  }, [authEmail, authPhoneNumber, router, navigate]);

  const loadingStatus = verificationPending && !verificationError;
  const resendLoadingStatus =
    resendVerificationCodePending && !resendVerificationCodeError;

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Padlock Icon */}
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-48 h-48 flex items-center justify-center">
              <svg
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Ultimate Security</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Secure your future with simple, flexible investment plans and opportunities
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone Number</h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter the code sent to {authPhoneNumber || "+234000000000"}
            </p>

            {/* OTP Input */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center justify-center gap-2">
                <OtpInput
                  value={token}
                  onChange={(props) => setToken(props)}
                  onPaste={handlePaste}
                  numInputs={6}
                  renderSeparator={<span className="w-2"></span>}
                  containerStyle={{}}
                  skipDefaultStyles
                  inputType="number"
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139]"
                    />
                  )}
                />
              </div>

              {/* Resend Text */}
              <p className="text-center text-sm text-gray-600">
                {resendTimer && resendTimer > 0 ? (
                  <>
                    Didn't receive the code?{" "}
                    <span className="text-blue-500">Resend</span> in{" "}
                    <span className="text-blue-500">{formatTimer(resendTimer)}</span>
                  </>
                ) : (
                  <>
                    Didn't receive the code?{" "}
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={handleResendClick}
                    >
                      {resendLoadingStatus ? (
                        "Resending..."
                      ) : (
                        "Resend"
                      )}
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
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Back
              </CustomButton>
              <CustomButton
                type="button"
                disabled={loadingStatus || !isValid}
                isLoading={loadingStatus}
                onClick={handleVerify}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Proceed
              </CustomButton>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p>
                Licenced by CBN a{" "}
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>{" "}
                Deposits Insured by{" "}
                <span className="text-blue-600 underline">INDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhoneNumberContent;
