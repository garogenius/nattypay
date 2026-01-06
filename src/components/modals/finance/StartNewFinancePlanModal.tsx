"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { FiArrowRight } from "react-icons/fi";

interface StartNewFinancePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: "investment") => void;
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

        <div className="space-y-4">
          <button 
            onClick={() => onSelectType("investment")}
            className="w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer p-4 group relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-primary transition-colors">Investment</p>
                <p className="text-white/60 text-sm mt-1 group-hover:text-white/80 transition-colors">Invest ₦25,000,000 and above to access premium opportunities with high returns</p>
              </div>
              <FiArrowRight className="text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" size={20} />
            </div>
          </button>

          {/* Investment Rules Tags - Separate Cards */}
          <div className="space-y-2">
            <p className="text-white/70 text-xs font-medium">Investment Conditions:</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Minimum Investment</p>
                  <p className="text-white/60 text-xs">₦25,000,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Return on Investment</p>
                  <p className="text-white/60 text-xs">10% ROI</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Lock Period</p>
                  <p className="text-white/60 text-xs">12 Months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartNewFinancePlanModal;
