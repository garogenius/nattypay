"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface StartNewFinancePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: "investment" | "fixed_deposit") => void;
}

const StartNewFinancePlanModal: React.FC<StartNewFinancePlanModalProps> = ({ isOpen, onClose, onSelectType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-6 z-10">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">Start New Plan</h2>
          <p className="text-white/70 text-sm mt-1">Select Plan Type</p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={() => onSelectType("investment")}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
          >
            <p className="text-white font-medium">Investment</p>
            <p className="text-white/60 text-sm mt-1">Invest ₦1,000,000 and above to access premium opportunities with high returns</p>
          </button>

          <button 
            onClick={() => onSelectType("fixed_deposit")}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4"
          >
            <p className="text-white font-medium">Fixed Deposit</p>
            <p className="text-white/60 text-sm mt-1">Lock your funds for a specific period and earn higher interest rates on maturity</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartNewFinancePlanModal;
