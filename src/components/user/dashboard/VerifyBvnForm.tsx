/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";

import useTimerStore from "@/store/timer.store";
import {
  useInitiateBvnVerification,
  useValidateBvnVerification,
} from "@/api/wallet/wallet.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import { User } from "@/constants/types";

const VerifyBvnForm = ({
  bvnDetails,
  handleComplete,
  user,
}: {
  bvnDetails: { bvn: string; verificationId: string };
  handleComplete: (step: number) => void;
user:User
}) => {
  const [token, setToken] = useState("");

  const isValid = token.length === 6;

  const onVerificationSuccess = () => {
    SuccessToast({
      title: "BVN verified",
      description: "Your BVN verification successful",
    });
    setToken("");
    handleComplete(2);
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
    mutate: validateBvnVerification,
    isPending: verificationPending,
    isError: verificationError,
  } = useValidateBvnVerification(onVerificationError, onVerificationSuccess);

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
  } = useInitiateBvnVerification(
    onResendVerificationCodeError,
    onResendVerificationCodeSuccess
  );

  const handleVerify = async () => {
    if (bvnDetails.bvn && bvnDetails.verificationId) {
      validateBvnVerification({
        bvn: bvnDetails.bvn,
        verificationId: bvnDetails.verificationId,
        otpCode: token,
        isBusiness: user?.isBusiness || false,
      });
    }
  };

  const handleResendClick = async () => {
    if (resendTimer === 0) {
      resendVerificationCode({ bvn: bvnDetails.bvn });
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

  const loadingStatus = verificationPending && !verificationError;
  const resendLoadingStatus =
    resendVerificationCodePending && !resendVerificationCodeError;

  return (
    <motion.div
      whileInView={{ opacity: [0, 1] }}
      transition={{ duration: 0.5, type: "tween" }}
      className="flex flex-col justify-center items-center w-full gap-4"
    >
      <div className="flex items-center justify-center  w-full ">
        <OtpInput
          value={token}
          onChange={(props) => setToken(props)}
          onPaste={handlePaste}
          numInputs={6}
          renderSeparator={<span className="w-2 2xs:w-3 xs:w-4"></span>}
          containerStyle={{}}
          skipDefaultStyles
          inputType="number"
          renderInput={(props) => (
            <input
              {...props}
              className="w-10 h-10 2xs:w-12 2xs:h-12 bg-transparent border-[1.03px] border-border-700  rounded-md text-base 2xs:text-lg text-text-700 dark:text-text-400 text-center font-medium outline-none"
            />
          )}
        />
      </div>
      <p className=" my-1 sm:my-2.5 text-centertext-sm 2xs:text-base text-text-1000  font-medium">
        {resendTimer && resendTimer > 0 ? (
          <>
            Didn’t get the code? <span className="text-secondary">Resend</span>{" "}
            in{" "}
            <span className="text-secondary">{formatTimer(resendTimer)}</span>
          </>
        ) : (
          <div className="flex items-center justify-center ">
            Didn’t receive any code?
            <span
              className="cursor-pointer text-secondary ml-1"
              onClick={handleResendClick}
            >
              {resendLoadingStatus ? (
                <SpinnerLoader width={20} height={20} color="#D4B139" />
              ) : (
                "Resend"
              )}
            </span>
          </div>
        )}
      </p>
      <CustomButton
        type="button"
        disabled={loadingStatus || !isValid}
        isLoading={loadingStatus}
        onClick={handleVerify}
        className="w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4 mt-2 2xs:mt-4 xs:mt-6 sm:mt-8 mb-2"
      >
        Verify Bvn
      </CustomButton>
    </motion.div>
  );
};

export default VerifyBvnForm;
