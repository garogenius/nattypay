"use client";

import React from "react";

interface FinancePlanCardProps {
  name: string;
  amount: number;
  earned?: number;
  startDate: string;
  endDate: string;
  interestRate?: string;
  status?: "active" | "completed";
  onView?: () => void;
}

const FinancePlanCard: React.FC<FinancePlanCardProps> = ({ 
  name, 
  amount, 
  earned = 0, 
  startDate, 
  endDate, 
  interestRate = "", 
  status = "active", 
  onView 
}) => {
  // Completed state layout
  if (status === "completed") {
    return (
      <div className="rounded-xl border border-white/10 bg-transparent p-3 sm:p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-medium text-xs sm:text-sm">{name}</p>
          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-white text-sm sm:text-base font-medium">₦{amount.toLocaleString()}</p>
            {earned > 0 && <p className="text-emerald-400 text-[10px] sm:text-xs mt-0.5">₦{earned.toLocaleString()} earned</p>}
          </div>
        </div>

        {/* Details row - 3 columns for completed */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Start Date</span>
            <span className="text-white text-[11px] sm:text-xs">{startDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">End Date</span>
            <span className="text-white text-[11px] sm:text-xs">{endDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Interest Rate</span>
            <span className="text-white text-[11px] sm:text-xs">{interestRate}</span>
          </div>
        </div>

        {/* Single View Details button */}
        <button 
          onClick={onView} 
          className="w-full rounded-lg border border-[#D4B139] text-white py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D4B139]/10 transition-colors"
        >
          View Details
        </button>
      </div>
    );
  }

  // Active state layout
  return (
    <div className="rounded-xl border border-white/10 bg-transparent p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white font-medium text-xs sm:text-sm">{name}</p>
        <div className="text-right flex flex-col items-end shrink-0">
          <p className="text-white text-sm sm:text-base font-medium">₦{amount.toLocaleString()}</p>
          {earned > 0 && <p className="text-emerald-400 text-[10px] sm:text-xs mt-0.5">₦{earned.toLocaleString()} earned</p>}
        </div>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">Start Date</span>
          <span className="text-white text-[11px] sm:text-xs">{startDate}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">End Date</span>
          <span className="text-white text-[11px] sm:text-xs">{endDate}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">Interest Rate</span>
          <span className="text-white text-[11px] sm:text-xs">{interestRate}</span>
        </div>
      </div>

      {/* Single View Details button */}
      <button 
        onClick={onView} 
        className="w-full rounded-lg border border-[#D4B139] text-white py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D4B139]/10 transition-colors"
      >
        View Details
      </button>
    </div>
  );
};

export default FinancePlanCard;
