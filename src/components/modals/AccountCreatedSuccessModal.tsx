"use client";

import React, { useEffect, useState, useRef } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { FiCheckCircle, FiLogIn } from "react-icons/fi";
import useNavigate from "@/hooks/useNavigate";

interface AccountCreatedSuccessModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin?: () => void;
  autoRedirectDelay?: number; // in seconds
}

const AccountCreatedSuccessModal: React.FC<AccountCreatedSuccessModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  autoRedirectDelay = 10,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(autoRedirectDelay);
  const hasRedirectedRef = useRef(false);

  const handleLogin = () => {
    // Prevent multiple calls
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;

    // Use setTimeout to ensure state updates happen after render cycle
    setTimeout(() => {
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
    }, 0);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      hasRedirectedRef.current = false;
      return;
    }

    // Reset countdown when modal opens
    setCountdown(autoRedirectDelay);
    hasRedirectedRef.current = false;

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Use setTimeout to avoid updating during render
          setTimeout(() => {
            handleLogin();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isOpen, autoRedirectDelay]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

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
          onClick={handleClose}
        />
      </div>

      {/* Modal Content - Dark Theme */}
      <div className="relative mx-auto bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-2xl transform transition-all overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4B139]/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <CgClose className="text-xl text-white/70 hover:text-white" />
          </button>
        )}

        {/* Content */}
        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30">
              <FiCheckCircle className="text-4xl sm:text-5xl text-green-400" />
            </div>
          </div>

          {/* Title - White text like the image */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Account Successfully Created!
          </h2>

          {/* Description */}
          <div className="space-y-3 mb-8">
            <p className="text-white/80 text-center text-sm sm:text-base leading-relaxed">
              Your account has been successfully created and verified. Now please login and set up your account to continue.
            </p>
            <div className="text-center">
              <p className="text-white/60 text-xs sm:text-sm">
                Redirecting to login page in{" "}
                <span className="font-semibold text-[#D4B139]">
                  {countdown}
                </span>{" "}
                {countdown === 1 ? "second" : "seconds"}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-3">
            <CustomButton
              type="button"
              onClick={handleLogin}
              className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <FiLogIn className="text-lg" />
              Login Now
            </CustomButton>
            {onClose && (
              <CustomButton
                type="button"
                onClick={handleClose}
                className="w-full bg-transparent border border-white/20 hover:bg-white/10 text-white py-3 sm:py-3.5 rounded-xl font-medium text-sm sm:text-base transition-colors"
              >
                Close
              </CustomButton>
            )}
          </div>

          {/* Additional Help Text */}
          <p className="text-center text-xs text-white/50 mt-6">
            Welcome to NattyPay! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountCreatedSuccessModal;

