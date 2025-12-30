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
import images from "../../../public/images";
import useAuthEmailStore from "@/store/authEmail.store";
import useTimerStore from "@/store/timer.store";
import SpinnerLoader from "../Loader/SpinnerLoader";
import icons from "../../../public/icons";
import { useVerifyPhoneNumber, useValidatePhoneNumber } from "@/api/user/user.queries";

const PreRegisterVerifyPhoneContent = () => {
  const navigate = useNavigate();
  const { authPhoneNumber, authEmail } = useAuthEmailStore();
  const [token, setToken] = useState("");
  const { timer, setTimer } = useTimerStore();

  const isValid = token.length === 4;

  useEffect(() => {
    setTimer(120);
  }, [setTimer]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, setTimer]);

  const onVerificationSuccess = () => {
    SuccessToast({
      title: "Phone verified",
      description: "Your phone number has been verified successfully",
    });
    navigate("/pre-register-currency");
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
  };

  const {
    mutate: verifyPhone,
    isPending: verificationPending,
    isError: verificationError,
    reset: resetVerification,
  } = useVerifyPhoneNumber(onVerificationError, onVerificationSuccess);

  const onResendSuccess = (data: any) => {
    setTimer(120);
    SuccessToast({
      title: "Sent Successfully!",
      description: data?.data?.message || "Verification code resent",
    });
  };

  const onResendError = (error: any) => {
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
    mutate: resendCode,
    isPending: resendPending,
  } = useValidatePhoneNumber(onResendError, onResendSuccess);

  const handleVerify = async () => {
    if (authEmail && authPhoneNumber) {
      // Reset any previous error state
      resetVerification();
      verifyPhone({
        email: authEmail,
        otp: token,
      });
    }
  };

  const handleResendClick = async () => {
    if (authEmail && authPhoneNumber && timer === 0) {
      resendCode({
        email: authEmail,
        phoneNumber: authPhoneNumber,
      });
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
              <Image
                src={icons.padlock}
                alt="Padlock"
                width={120}
                height={120}
                className="w-32 h-32"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Verify Your Phone</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            We've sent a verification code to your phone number. Please enter it below to continue.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone</h2>
            <p className="text-sm text-gray-600 mb-6">
              Enter the 4-digit code sent to <span className="font-medium">{authPhoneNumber || "your phone"}</span>
            </p>

            <div className="space-y-6">
              <div className="flex justify-center">
                <OtpInput
                  value={token}
                  onChange={setToken}
                  numInputs={4}
                  renderInput={(props) => (
                    <input
                      {...props}
                      className="w-12 h-12 mx-1 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-[#D4B139]"
                    />
                  )}
                />
              </div>

              <CustomButton
                onClick={handleVerify}
                disabled={!isValid || verificationPending}
                isLoading={verificationPending && !verificationError}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3.5 rounded-lg text-base"
              >
                Verify
              </CustomButton>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend code in <span className="font-medium text-[#D4B139]">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendClick}
                    disabled={resendPending}
                    className="text-sm text-[#D4B139] font-medium hover:underline disabled:opacity-50"
                  >
                    {resendPending ? "Resending..." : "Resend Code"}
                  </button>
                )}
              </div>

              <button
                onClick={() => navigate("/signup/personal")}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreRegisterVerifyPhoneContent;

