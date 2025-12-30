"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { RiFingerprintLine } from "react-icons/ri";
import CustomButton from "@/components/shared/Button";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import { verifyPinWithBiometric, isFingerprintPaymentAvailable } from "@/services/fingerprintPayment.service";
import ErrorToast from "@/components/toast/ErrorToast";

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  bankName: string;
  accountNumber: string;
  amount: number; // raw amount in Naira
  onConfirm: (pin: string) => void;
}

const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  bankName,
  accountNumber,
  amount,
  onConfirm,
}) => {
  const [pin, setPin] = useState("");
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const { fingerprintPaymentEnabled } = usePaymentSettingsStore();

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setIsVerifyingBiometric(false);
      // Check if fingerprint payment is available
      isFingerprintPaymentAvailable().then(setIsFingerprintAvailable);
    }
  }, [isOpen]);

  const handleFingerprintClick = async () => {
    if (!fingerprintPaymentEnabled || !isFingerprintAvailable) {
      ErrorToast({
        title: "Fingerprint Payment Not Enabled",
        descriptions: ["Please enable fingerprint payment in settings first"],
      });
      return;
    }

    setIsVerifyingBiometric(true);
    try {
      // Verify PIN using biometric
      const result = await verifyPinWithBiometric();
      
      // Biometric verification successful - use the result as PIN
      // The backend should accept this as equivalent to PIN verification
      // Format: "BIOMETRIC_VERIFIED:credentialId:signature"
      setIsVerifyingBiometric(false);
      onConfirm(result);
    } catch (error: any) {
      setIsVerifyingBiometric(false);
      ErrorToast({
        title: "Biometric Authentication Failed",
        descriptions: [error.message || "Please try again or use PIN"],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>

      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-xl max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Confirm Transaction</h2>
        </div>

        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white text-sm">
            <div className="flex items-center justify-between py-1.5">
              <p className="text-white/60">Recipient</p>
              <p className="font-medium text-right truncate max-w-[60%]">{recipientName}</p>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <p className="text-white/60">Bank</p>
              <p className="font-medium text-right truncate max-w-[60%]">{bankName}</p>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <p className="text-white/60">Account Number</p>
              <p className="font-medium text-right">{accountNumber}</p>
            </div>
            <div className="my-2 border-t border-dashed border-white/20" />
            <div className="flex items-center justify-between py-1.5">
              <p className="text-white/60">Amount</p>
              <p className="font-medium text-right">₦{Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-4">
            <label className="text-white text-sm">Enter Transaction PIN</label>
            <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-2.5 pl-3 pr-2">
              <input
                className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50"
                placeholder="••••"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e)=> setPin(e.target.value.replace(/\D/g, ""))}
                disabled={isVerifyingBiometric}
              />
              {fingerprintPaymentEnabled && isFingerprintAvailable && (
                <button
                  type="button"
                  onClick={handleFingerprintClick}
                  disabled={isVerifyingBiometric}
                  className={`ml-2 w-10 h-10 rounded-lg grid place-items-center transition-colors ${
                    isVerifyingBiometric
                      ? "bg-white/50 text-black/50 cursor-not-allowed"
                      : "bg-white text-black hover:bg-[#D4B139] hover:text-black"
                  }`}
                  title="Use Fingerprint/Face ID"
                >
                  <RiFingerprintLine className="text-lg" />
                </button>
              )}
            </div>
            {isVerifyingBiometric && (
              <p className="text-xs text-white/60 mt-1">Verifying with biometric...</p>
            )}
          </div>

          <div className="w-full grid grid-cols-2 gap-4 items-stretch mt-4">
            <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={onClose} disabled={isVerifyingBiometric}>
              Back
            </CustomButton>
            <CustomButton
              type="button"
              disabled={!pin || pin.length !== 4 || isVerifyingBiometric}
              isLoading={isVerifyingBiometric}
              className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl"
              onClick={() => onConfirm(pin)}
            >
              Pay
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmModal;
