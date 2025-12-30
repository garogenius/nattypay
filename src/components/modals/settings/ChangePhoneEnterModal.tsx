"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useValidatePhoneNumber } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";

interface ChangePhoneEnterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhone?: string;
  onValidateSuccess?: (newPhone: string) => void;
}

const ChangePhoneEnterModal: React.FC<ChangePhoneEnterModalProps> = ({ isOpen, onClose, currentPhone, onValidateSuccess }) => {
  const { user } = useUserStore();
  const [phone, setPhone] = React.useState("");
  const [validating, setValidating] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhone("");
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to validate phone number"];

    ErrorToast({
      title: "Validation Failed",
      descriptions,
    });
    setValidating(false);
  };

  const onSuccess = () => {
    SuccessToast({
      title: "OTP Sent",
      description: "Please check your phone for the verification code",
    });
    if (onValidateSuccess) {
      onValidateSuccess(phone.trim());
    }
    onClose();
  };

  const { mutate: validatePhone } = useValidatePhoneNumber(onError, onSuccess);

  if (!isOpen) return null;

  const valid = /^\+?\d{7,15}$/.test(phone.trim());

  const handleNext = () => {
    if (!valid || validating) return;

    if (!user?.email) {
      ErrorToast({
        title: "Error",
        descriptions: ["User email not found"],
      });
      return;
    }

    setValidating(true);
    validatePhone({
      email: user.email,
      phoneNumber: phone.trim(),
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
          <h2 className="text-white text-base sm:text-lg font-semibold">Change Phone Number</h2>
          <p className="text-white/60 text-sm">You are changing {currentPhone || "your number"} to a new number</p>
        </div>

        <div className="px-5 sm:px-6 pb-2">
          <label className="block text-sm text-white/80 mb-1.5">New Phone Number</label>
          <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
            <input
              type="tel"
              inputMode="tel"
              placeholder="Enter your new phone number"
              className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-2 flex gap-3">
          <CustomButton
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleNext}
            disabled={!valid || validating}
            isLoading={validating}
            className="flex-1 rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Next
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default ChangePhoneEnterModal;
