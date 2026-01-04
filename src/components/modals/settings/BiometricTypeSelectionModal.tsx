"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";

interface BiometricTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: "fingerprint" | "faceid") => void;
  detectedType: "fingerprint" | "faceid";
  isLoading?: boolean;
}

const BiometricTypeSelectionModal: React.FC<BiometricTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  detectedType,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={!isLoading ? onClose : undefined} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-6 z-10">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-2">Select Biometric Type</h2>
        <p className="text-white/70 text-sm mb-6">
          Choose the biometric authentication method you want to use. Your device will prompt you to use the available biometric when enrolling.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => !isLoading && onSelect("fingerprint")}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : detectedType === "fingerprint"
                ? "border-[#D4B139] bg-[#D4B139]/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 103 0m-3-6V9m0 0a1.5 1.5 0 103 0m-3-3a1.5 1.5 0 103 0m0 3v6m0-6a1.5 1.5 0 103 0m0 0v3m0-3a1.5 1.5 0 103 0"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">Fingerprint</p>
              <p className="text-white/60 text-xs">Use your fingerprint to authenticate</p>
            </div>
            {detectedType === "fingerprint" && (
              <span className="text-[#D4B139] text-xs font-medium">Detected</span>
            )}
          </button>

          <button
            onClick={() => !isLoading && onSelect("faceid")}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : detectedType === "faceid"
                ? "border-[#D4B139] bg-[#D4B139]/10"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium">Face ID</p>
              <p className="text-white/60 text-xs">Use facial recognition to authenticate</p>
            </div>
            {detectedType === "faceid" && (
              <span className="text-[#D4B139] text-xs font-medium">Detected</span>
            )}
          </button>
        </div>

        <div className="flex gap-3">
          <CustomButton
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/5 rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={() => !isLoading && onSelect(detectedType)}
            disabled={isLoading}
            className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : `Continue with ${detectedType === "faceid" ? "Face ID" : "Fingerprint"}`}
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default BiometricTypeSelectionModal;

