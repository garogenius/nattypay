"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { FiAlertCircle } from "react-icons/fi";

interface ChangePhoneInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
}

const ChangePhoneInfoModal: React.FC<ChangePhoneInfoModalProps> = ({ isOpen, onClose, onNext }) => {
  if (!isOpen) return null;

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
          <h2 className="text-white text-base sm:text-lg font-semibold">Change Mobile Number</h2>
          <p className="text-white/60 text-sm">Updating your phone number will affect how you log in and receive notifications</p>
        </div>

        <div className="px-5 sm:px-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-start gap-2 text-red-400">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <p className="text-sm">Once you change your phone number:</p>
            </div>
            <ul className="mt-2 list-disc list-inside text-white/80 text-sm space-y-1">
              <li>You’ll use the new number to log in</li>
              <li>Your old number will no longer receive alerts or OTPs</li>
              <li>Some linked services maybe be reverified</li>
              <li>You may lose access to transaction alerts sent to your old number</li>
            </ul>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-4">
          <button
            onClick={onNext}
            className="w-full rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePhoneInfoModal;
