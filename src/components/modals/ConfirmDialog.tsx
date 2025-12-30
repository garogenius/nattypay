"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onCancel}></div>
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-white text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>
        <div className="px-4 pb-4">
          <p className="text-white/70 text-sm mb-6">{description}</p>
          <div className="flex gap-3 justify-end">
            <CustomButton
              onClick={onCancel}
              className="bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg transition-colors"
            >
              {cancelText}
            </CustomButton>
            <CustomButton
              onClick={onConfirm}
              isLoading={isLoading}
              className="bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              {confirmText}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
