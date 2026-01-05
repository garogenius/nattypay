"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { FiAlertCircle, FiLogIn } from "react-icons/fi";
import useNavigate from "@/hooks/useNavigate";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin?: () => void;
  title?: string;
  description?: string;
  additionalInfo?: string;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  title = "Session Expired",
  description = "Your session has expired. Please refresh the page or complete the verification steps again.",
  additionalInfo = "If the issue persists, try logging in again.",
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      // Clear any session data
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      navigate("/login", "replace");
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh] p-4"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div 
          className="absolute inset-0 bg-black/80 dark:bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />
      </div>

      {/* Modal Content */}
      <div className="relative mx-auto bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl transform transition-all">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-2xl opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4B139] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <CgClose className="text-xl text-gray-600 dark:text-gray-400" />
          </button>
        )}

        {/* Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-4 border-red-100 dark:border-red-900/30">
              <FiAlertCircle className="text-4xl sm:text-5xl text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            {title}
          </h2>

          {/* Description */}
          <div className="space-y-3 mb-8">
            <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base leading-relaxed">
              {description}
            </p>
            {additionalInfo && (
              <p className="text-gray-500 dark:text-gray-400 text-center text-xs sm:text-sm">
                {additionalInfo}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {onClose && (
              <CustomButton
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3.5 sm:py-4 rounded-xl font-medium text-sm sm:text-base transition-colors"
              >
                Close
              </CustomButton>
            )}
            <CustomButton
              type="button"
              onClick={handleLogin}
              className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FiLogIn className="text-lg" />
              Login Now
            </CustomButton>
          </div>

          {/* Additional Help Text */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;



