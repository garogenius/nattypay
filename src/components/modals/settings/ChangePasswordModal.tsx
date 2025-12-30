"use client";

import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import OtpInput from "react-otp-input";
import { useRequestChangePassword, useChangePasswordWithOtp } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const { setFingerprintPaymentEnabled } = usePaymentSettingsStore();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("request");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  const onRequestError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to request password change"];

    ErrorToast({
      title: "Request Failed",
      descriptions,
    });
  };

  const onRequestSuccess = () => {
    SuccessToast({
      title: "OTP Sent",
      description: "Please check your email for the verification code",
    });
    setStep("verify");
  };

  const onChangeError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to change password"];

    ErrorToast({
      title: "Change Failed",
      descriptions,
    });
  };

  const onChangeSuccess = () => {
    // Disable fingerprint payment when password changes (security measure)
    setFingerprintPaymentEnabled(false);
    SuccessToast({
      title: "Password Changed",
      description: "Your password has been changed successfully. Fingerprint payment has been disabled for security.",
    });
    onClose();
  };

  const { mutate: requestChange } = useRequestChangePassword(onRequestError, onRequestSuccess);
  const { mutate: changePassword } = useChangePasswordWithOtp(onChangeError, onChangeSuccess);

  const handleRequest = () => {
    if (!user?.email) {
      ErrorToast({
        title: "Error",
        descriptions: ["User email not found"],
      });
      return;
    }

    setRequesting(true);
    requestChange({ email: user.email });
    setRequesting(false);
  };

  const handleChange = () => {
    if (!otp || otp.length !== 6) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid 6-digit OTP"],
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Password must be at least 6 characters"],
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Passwords do not match"],
      });
      return;
    }

    if (!user?.email) {
      ErrorToast({
        title: "Error",
        descriptions: ["User email not found"],
      });
      return;
    }

    setChanging(true);
    changePassword({
      email: user.email,
      otp,
      newPassword,
    });
    setChanging(false);
  };

  if (!isOpen) return null;

  const valid = step === "verify" 
    ? otp.length === 6 && newPassword.length >= 6 && newPassword === confirmPassword
    : true;

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
          <h2 className="text-white text-base sm:text-lg font-semibold">Change Password</h2>
          <p className="text-white/60 text-sm">
            {step === "request" 
              ? "We'll send a verification code to your email"
              : "Enter the code sent to your email and your new password"}
          </p>
        </div>

        <div className="px-5 sm:px-6 space-y-3">
          {step === "request" ? (
            <div className="py-4">
              <p className="text-white/80 text-sm text-center mb-4">
                Click the button below to receive a verification code via email
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Verification Code</label>
                <div className="flex items-center justify-center">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2"></span>}
                    containerStyle={{}}
                    skipDefaultStyles
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-md text-base sm:text-lg text-white text-center font-medium outline-none focus:border-[#D4B139]"
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-1.5">New Password</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-1.5">Confirm New Password</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 sm:px-6 pt-3 flex gap-3">
          {step === "verify" && (
            <CustomButton
              onClick={() => setStep("request")}
              className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
            >
              Back
            </CustomButton>
          )}
          <CustomButton
            onClick={step === "request" ? handleRequest : handleChange}
            disabled={!valid || requesting || changing}
            isLoading={requesting || changing}
            className={`flex-1 rounded-xl py-3 font-semibold ${!valid || requesting || changing ? "bg-[#D4B139]/60 text-black/70" : "bg-[#D4B139] hover:bg-[#c7a42f] text-black"}`}
          >
            {step === "request" 
              ? (requesting ? "Requesting..." : "Request Code")
              : (changing ? "Changing..." : "Change Password")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
