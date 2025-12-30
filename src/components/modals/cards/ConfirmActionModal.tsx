"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  confirmTone?: "danger" | "primary";
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  confirmTone = "primary",
}) => {
  if (!isOpen) return null;

  const confirmClasses =
    confirmTone === "danger"
      ? "bg-red-500 hover:bg-red-600 text-white"
      : "bg-[#D4B139] hover:bg-[#c7a42f] text-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full">
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-2">{title}</h2>
        {description && (
          <p className="text-white/70 text-sm mb-4">{description}</p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 text-sm font-medium">Back</button>
          <button onClick={onConfirm} className={`px-5 py-2 rounded-lg text-sm font-medium ${confirmClasses}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
