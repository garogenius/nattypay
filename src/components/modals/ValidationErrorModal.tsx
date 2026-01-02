"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  descriptions: string[];
}

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  descriptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="z-[999999] fixed inset-0 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <CgClose className="text-xl text-white" />
          </button>
        </div>

        <div className="mb-6">
          {descriptions.map((description, index) => (
            <p
              key={index}
              className="text-white/70 text-sm mb-2 last:mb-0"
            >
              {description}
            </p>
          ))}
        </div>

        <CustomButton
          onClick={onClose}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3 font-medium transition-colors"
        >
          OK
        </CustomButton>
      </div>
    </div>
  );
};

export default ValidationErrorModal;


