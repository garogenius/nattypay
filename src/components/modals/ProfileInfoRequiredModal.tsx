"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { FiSettings, FiMail, FiPhone } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";

interface ProfileInfoRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingInfo: "phone" | "email" | "both";
}

const ProfileInfoRequiredModal: React.FC<ProfileInfoRequiredModalProps> = ({
  isOpen,
  onClose,
  missingInfo,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToSettings = () => {
    onClose();
    navigate("/user/settings");
  };

  const getTitle = () => {
    if (missingInfo === "phone") return "Phone Number Required";
    if (missingInfo === "email") return "Email Address Required";
    return "Contact Information Required";
  };

  const getDescription = () => {
    if (missingInfo === "phone") {
      return "To create a multi-currency account (USD, EUR, or GBP), you need to add a phone number to your profile.";
    }
    if (missingInfo === "email") {
      return "To create a multi-currency account (USD, EUR, or GBP), you need to add an email address to your profile.";
    }
    return "To create a multi-currency account (USD, EUR, or GBP), you need to add either a phone number or email address to your profile.";
  };

  const getIcon = () => {
    if (missingInfo === "phone") return <FiPhone className="text-4xl" />;
    if (missingInfo === "email") return <FiMail className="text-4xl" />;
    return (
      <div className="flex items-center gap-2">
        <FiPhone className="text-3xl" />
        <FiMail className="text-3xl" />
      </div>
    );
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-6 pb-6 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-6 pt-2 pb-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#D4B139]/10 flex items-center justify-center text-[#D4B139]">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-white text-xl sm:text-2xl font-semibold text-center mb-3">
            {getTitle()}
          </h2>

          {/* Description */}
          <p className="text-white/70 text-sm sm:text-base text-center mb-6 leading-relaxed">
            {getDescription()}
          </p>

          {/* Info Box */}
          <div className="bg-bg-500 dark:bg-bg-900 border border-border-700 dark:border-border-600 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <FiSettings className="text-[#D4B139] text-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">What you need to do:</h3>
                <ol className="text-white/70 text-xs sm:text-sm space-y-1.5 list-decimal list-inside">
                  <li>Go to your Profile Settings</li>
                  <li>
                    {missingInfo === "phone" && "Add your phone number"}
                    {missingInfo === "email" && "Add your email address"}
                    {missingInfo === "both" && "Add your phone number or email address"}
                  </li>
                  <li>Return here to create your multi-currency account</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <CustomButton
              onClick={handleGoToSettings}
              className="w-full rounded-xl py-3.5 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black flex items-center justify-center gap-2"
            >
              <FiSettings className="text-lg" />
              <span>Go to Profile Settings</span>
            </CustomButton>
            <CustomButton
              onClick={onClose}
              className="w-full bg-transparent border border-white/15 text-white hover:bg-white/5 rounded-xl py-3"
            >
              Maybe Later
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoRequiredModal;

