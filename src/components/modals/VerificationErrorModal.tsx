"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

interface VerificationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  descriptions?: string[];
  verificationType?: "BVN" | "NIN";
}

const VerificationErrorModal: React.FC<VerificationErrorModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  title = "Verification Failed",
  descriptions = ["An error occurred during verification. Please try again."],
  verificationType,
}) => {
  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh] p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
      </div>

      {/* Modal Content - Dark Theme */}
      <div className="relative mx-auto bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-2xl transform transition-all overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <CgClose className="text-xl text-white/70 hover:text-white" />
        </button>

        {/* Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/20 flex items-center justify-center border-4 border-red-500/30">
              <FiAlertCircle className="text-4xl sm:text-5xl text-red-400" />
            </div>
          </div>

          {/* Title - White text */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            {title}
          </h2>

          {/* Verification Type Badge */}
          {verificationType && (
            <div className="flex justify-center mb-4">
              <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs sm:text-sm font-medium">
                {verificationType} Verification
              </span>
            </div>
          )}

          {/* Error Descriptions */}
          <div className="space-y-3 mb-8">
            {descriptions.map((description, index) => (
              <p 
                key={index}
                className="text-white/80 text-center text-sm sm:text-base leading-relaxed"
              >
                {description}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <CustomButton
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white py-3.5 sm:py-4 rounded-xl font-medium text-sm sm:text-base transition-colors"
            >
              Close
            </CustomButton>
            {onRetry && (
              <CustomButton
                type="button"
                onClick={onRetry}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <FiRefreshCw className="text-lg" />
                Try Again
              </CustomButton>
            )}
          </div>

          {/* Additional Help Text */}
          <p className="text-center text-xs text-white/50 mt-6">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationErrorModal;

