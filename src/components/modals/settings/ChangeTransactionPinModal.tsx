"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useResetOtp, useResetPin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

interface ChangeTransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeTransactionPinModal: React.FC<ChangeTransactionPinModalProps> = ({ isOpen, onClose }) => {
  const { setFingerprintPaymentEnabled } = usePaymentSettingsStore();
  const [step, setStep] = React.useState<"request" | "reset">("request");
  const [otpCode, setOtpCode] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("request");
      setOtpCode("");
      setNewPin("");
      setConfirmPin("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to send OTP"];

    ErrorToast({
      title: "Request Failed",
      descriptions,
    });
  };

  const handleOtpSuccess = (data: any) => {
    SuccessToast({
      title: "OTP Sent",
      description: data?.data?.message || "OTP sent to your registered phone number",
    });
    setStep("reset");
  };

  const handleResetError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to reset PIN"];

    ErrorToast({
      title: "Reset Failed",
      descriptions,
    });
  };

  const handleResetSuccess = (data: any) => {
    // Disable fingerprint payment when PIN changes (security measure)
    setFingerprintPaymentEnabled(false);
    SuccessToast({
      title: "PIN Reset Successful",
      description: data?.data?.message || "Your wallet PIN has been reset successfully.",
    });
    onClose();
  };

  const { mutate: requestOtp, isPending: requestingOtp } = useResetOtp(handleOtpError, handleOtpSuccess);
  const { mutate: resetPin, isPending: resettingPin } = useResetPin(handleResetError, handleResetSuccess);

  const validReset =
    /^\d{6}$/.test(otpCode) &&
    /^\d{4}$/.test(newPin) &&
    newPin === confirmPin;

  const handleSubmit = async () => {
    if (step !== "reset" || resettingPin) return;

    if (!/^\d{6}$/.test(otpCode)) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["OTP code must be exactly 6 digits"],
      });
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["New PIN must be exactly 4 digits"],
      });
      return;
    }

    if (newPin !== confirmPin) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["PIN and confirm PIN do not match"],
      });
      return;
    }

    resetPin({
      otpCode,
      pin: newPin,
      confirmPin,
    });
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3">
          <h2 className="text-white text-base sm:text-lg font-semibold">Forget Transaction PIN</h2>
          <p className="text-white/60 text-sm">
            Reset your transaction PIN using an OTP sent to your registered phone number
          </p>
        </div>

        {step === "request" ? (
          <div className="px-5 sm:px-6 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-white text-sm font-medium">Send OTP</p>
              <p className="text-white/60 text-sm mt-1">
                We will send a one-time code (OTP) to your registered phone number to reset your PIN.
              </p>
            </div>
            <CustomButton
              onClick={() => {
                if (requestingOtp) return;
                requestOtp();
              }}
              disabled={requestingOtp}
              isLoading={requestingOtp}
              className="w-full rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
            >
              Send OTP
            </CustomButton>
          </div>
        ) : (
          <>
            <div className="px-5 sm:px-6 space-y-3">
              <div>
                <label className="block text-sm text-white/80 mb-1.5">OTP Code</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpCode(value);
                    }}
                    maxLength={6}
                  />
                </div>
              </div>

              {[
                { label: "New PIN", value: newPin, set: setNewPin, placeholder: "Enter new PIN" },
                { label: "Confirm New PIN", value: confirmPin, set: setConfirmPin, placeholder: "Confirm new PIN" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-sm text-white/80 mb-1.5">{f.label}</label>
                  <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder={f.placeholder}
                      className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                      value={f.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        f.set(value);
                      }}
                      maxLength={4}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 sm:px-6 pt-3 space-y-2">
              <CustomButton
                onClick={handleSubmit}
                disabled={!validReset || resettingPin}
                isLoading={resettingPin}
                className="w-full rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
              >
                Reset PIN
              </CustomButton>

              <button
                type="button"
                disabled={requestingOtp || resettingPin}
                onClick={() => requestOtp()}
                className="w-full text-sm text-[#D4B139] hover:underline disabled:opacity-60"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangeTransactionPinModal;
