"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import useNavigate from "@/hooks/useNavigate";
import OtpInput from "react-otp-input";
import useAuthEmailStore from "@/store/authEmail.store";
import useTimerStore from "@/store/timer.store";
import { useResendVerificationCode, useVerifyResetEmail } from "@/api/auth/auth.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import SpinnerLoader from "../Loader/SpinnerLoader";
import images from "../../../public/images";

const EnterCodeContent = () => {
  const navigate = useNavigate();
  const { authEmail, setAuthCode, setAuthEmail } = useAuthEmailStore();
  const [token, setToken] = useState("");

  const isValid = token.length === 4;

  const onVerificationSuccess = () => {
    setAuthCode(token);
    setAuthEmail(authEmail);
    SuccessToast({
      title: "Code verified",
      description: "Code verification successful",
    });
    navigate("/new-passcode", "replace");
    setToken("");
  };

  const onVerificationError = (error: any) => {
    const errorMessage = error.response.data.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
  };

  const {
    mutate: verifyEmail,
    isPending: verificationPending,
    isError: verificationError,
    reset: resetVerification,
  } = useVerifyResetEmail(onVerificationError, onVerificationSuccess);

  const onResendVerificationCodeSuccess = (data: any) => {
    useTimerStore.getState().setTimer(50);
    SuccessToast({
      title: "Sent Successfully!",
      description: data.data.message,
    });
  };

  const onResendVerificationCodeError = (error: any) => {
    const errorMessage = error.response.data.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Sending Failed",
      descriptions,
    });
  };

  const {
    mutate: resendVerificationCode,
    isPending: resendVerificationCodePending,
    isError: resendVerificationCodeError,
  } = useResendVerificationCode(
    onResendVerificationCodeError,
    onResendVerificationCodeSuccess
  );

  const handleVerify = async () => {
    if (authEmail) {
      // Reset any previous error state
      resetVerification();
      verifyEmail({
        email: authEmail,
        otpCode: token,
      });
    }
  };

  const handleResendClick = async () => {
    if (resendTimer === 0 && authEmail) {
      resendVerificationCode({ email: authEmail });
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
      if (interval) clearInterval(interval);
      timerStore.clearTimer();
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
    return `${seconds}seconds`;
  };

  const handlePaste: React.ClipboardEventHandler = (event) => {
    const data = event.clipboardData.getData("text").slice(0, 4);
    setToken(data);
  };

  const loadingStatus = verificationPending && !verificationError;
  const resendLoadingStatus =
    resendVerificationCodePending && !resendVerificationCodeError;

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Illustration placeholder */}
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Transfers</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Send and receive money locally or globally with ease and speed.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Code</h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter the code we sent to{" "}
              <span className="text-[#D4B139]">{authEmail || "0800000000"}</span>
            </p>

            {/* OTP Input */}
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex items-center justify-center gap-2">
                <OtpInput
                  value={token}
                  onChange={setToken}
                  onPaste={handlePaste}
                  numInputs={4}
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
                <span className="text-red-500 ml-2">*</span>
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

            {/* Verify Button */}
            <CustomButton
              type="button"
              disabled={loadingStatus || !isValid}
              isLoading={loadingStatus}
              onClick={handleVerify}
              className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg mb-6"
            >
              Verify
            </CustomButton>

            {/* Account Options */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Switch account</p>
              <Link href="/login" className="text-sm text-gray-600 text-center block">
                Login with Finger Print or Face ID
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p>
                <span className="flex items-center justify-center gap-2 flex-wrap">
                  <span>Licenced by CBN</span>
                  <Image
                    src={images.cbnLogo}
                    alt="CBN Logo"
                    width={40}
                    height={20}
                    className="h-5 w-auto object-contain"
                  />
                  <span>Deposits Insured by</span>
                  <span className="text-blue-600">NDIC</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterCodeContent;


