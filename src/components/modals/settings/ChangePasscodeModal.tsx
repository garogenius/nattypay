"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useChangePasscode } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

interface ChangePasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasscodeModal: React.FC<ChangePasscodeModalProps> = ({ isOpen, onClose }) => {
  const { setFingerprintPaymentEnabled } = usePaymentSettingsStore();
  const [currentPasscode, setCurrentPasscode] = React.useState("");
  const [newPasscode, setNewPasscode] = React.useState("");
  const [confirmPasscode, setConfirmPasscode] = React.useState("");

  useEffect(() => {
    if (isOpen) {
      setCurrentPasscode("");
      setNewPasscode("");
      setConfirmPasscode("");
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to change passcode"];

    ErrorToast({
      title: "Change Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    // Disable fingerprint payment when passcode changes (security measure)
    setFingerprintPaymentEnabled(false);
    SuccessToast({
      title: "Passcode Changed",
      description: "Your login passcode has been changed successfully. Fingerprint payment has been disabled for security.",
    });
    onClose();
  };

  const { mutate: changePasscode, isPending: changing } = useChangePasscode(onError, onSuccess);

  if (!isOpen) return null;

  const valid = /^\d{6}$/.test(currentPasscode) && /^\d{6}$/.test(newPasscode) && newPasscode === confirmPasscode;

  const handleSubmit = async () => {
    if (!valid || changing) return;

    if (newPasscode !== confirmPasscode) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Passcodes do not match"],
      });
      return;
    }

    changePasscode({
      currentPasscode,
      newPasscode,
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
          <h2 className="text-white text-base sm:text-lg font-semibold">Change Login Passcode</h2>
          <p className="text-white/60 text-sm">Update your 6-digit login passcode</p>
        </div>

        <div className="px-5 sm:px-6 space-y-3">
          {[
            { label: "Current Passcode", value: currentPasscode, set: setCurrentPasscode, placeholder: "Enter current 6-digit passcode" },
            { label: "New Passcode", value: newPasscode, set: setNewPasscode, placeholder: "Enter new 6-digit passcode" },
            { label: "Confirm New Passcode", value: confirmPasscode, set: setConfirmPasscode, placeholder: "Confirm new 6-digit passcode" },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-sm text-white/80 mb-1.5">{f.label}</label>
              <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={f.placeholder}
                  className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                  value={f.value}
                  onChange={(e) => f.set(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 sm:px-6 pt-3">
          <CustomButton
            onClick={handleSubmit}
            disabled={!valid || changing}
            isLoading={changing}
            className="w-full rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Update Passcode
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ChangePasscodeModal;

