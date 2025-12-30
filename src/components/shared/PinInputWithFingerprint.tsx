"use client";

import React, { useState, useEffect } from "react";
import { RiFingerprintLine } from "react-icons/ri";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import { verifyPinWithBiometric, isFingerprintPaymentAvailable } from "@/services/fingerprintPayment.service";
import ErrorToast from "@/components/toast/ErrorToast";

interface PinInputWithFingerprintProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onBiometricSuccess?: (pin: string) => void;
  className?: string;
  inputClassName?: string;
}

const PinInputWithFingerprint: React.FC<PinInputWithFingerprintProps> = ({
  value,
  onChange,
  placeholder = "••••",
  disabled = false,
  onBiometricSuccess,
  className = "",
  inputClassName = "",
}) => {
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const { fingerprintPaymentEnabled } = usePaymentSettingsStore();

  useEffect(() => {
    isFingerprintPaymentAvailable().then(setIsFingerprintAvailable);
  }, []);

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
      const result = await verifyPinWithBiometric();
      setIsVerifyingBiometric(false);
      
      if (onBiometricSuccess) {
        onBiometricSuccess(result);
      } else {
        onChange(result);
      }
    } catch (error: any) {
      setIsVerifyingBiometric(false);
      ErrorToast({
        title: "Biometric Authentication Failed",
        descriptions: [error.message || "Please try again or use PIN"],
      });
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-2.5 pl-3 pr-2">
        <input
          className={`w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50 ${inputClassName}`}
          placeholder={placeholder}
          type="password"
          maxLength={4}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          disabled={disabled || isVerifyingBiometric}
        />
        {fingerprintPaymentEnabled && isFingerprintAvailable && (
          <button
            type="button"
            onClick={handleFingerprintClick}
            disabled={disabled || isVerifyingBiometric}
            className={`ml-2 w-10 h-10 rounded-lg grid place-items-center transition-colors ${
              disabled || isVerifyingBiometric
                ? "bg-white/20 text-white/50 cursor-not-allowed"
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
  );
};

export default PinInputWithFingerprint;

