"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useVerifyWalletPin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";

interface VerifyWalletPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const VerifyWalletPinModal: React.FC<VerifyWalletPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = React.useState("");

  useEffect(() => {
    if (isOpen) {
      setPin("");
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Invalid PIN"];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
  };

  const onVerifySuccess = () => {
    SuccessToast({
      title: "PIN Verified",
      description: "Wallet PIN verified successfully",
    });
    if (onSuccess) onSuccess();
    onClose();
  };

  const { mutate: verifyPin, isPending: verifying } = useVerifyWalletPin(onError, onVerifySuccess);

  if (!isOpen) return null;

  const valid = /^\d{4}$/.test(pin);

  const handleSubmit = async () => {
    if (!valid || verifying) return;

    verifyPin({ pin });
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
          <h2 className="text-white text-base sm:text-lg font-semibold">Verify Wallet PIN</h2>
          <p className="text-white/60 text-sm">Enter your 4-digit wallet PIN to continue</p>
        </div>

        <div className="px-5 sm:px-6 space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Wallet PIN</label>
            <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-3 flex gap-3">
          <CustomButton
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
            disabled={!valid || verifying}
            isLoading={verifying}
            className="flex-1 rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Verify
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default VerifyWalletPinModal;

