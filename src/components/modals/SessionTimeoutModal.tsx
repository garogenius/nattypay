"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { FiClock } from "react-icons/fi";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingMinutes: number;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingMinutes,
  onExtend,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/90 dark:bg-black/80" />
      </div>

      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-5 sm:px-6 py-6 w-full max-w-md rounded-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500">
            <FiClock className="text-3xl text-yellow-500" />
          </div>

          <div>
            <h2 className="text-white text-lg sm:text-xl font-semibold mb-2">
              Session Timeout Warning
            </h2>
            <p className="text-white/70 text-sm">
              Your session will expire in {remainingMinutes} minute{remainingMinutes !== 1 ? "s" : ""} due to inactivity.
            </p>
            <p className="text-white/60 text-xs mt-2">
              For your security, please extend your session or you will be logged out automatically.
            </p>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <CustomButton
              type="button"
              className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-xl font-medium"
              onClick={onExtend}
            >
              Extend Session
            </CustomButton>
            <CustomButton
              type="button"
              className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white py-3 rounded-xl font-medium"
              onClick={onLogout}
            >
              Logout
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;


























