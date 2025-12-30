"use client";

import React from "react";

interface SavingsPlanCardProps {
  name: string;
  amount: number;
  earned?: number;
  startDate: string;
  maturityDate: string;
  interestRate?: string; // e.g., "17% per annum"
  status?: "active" | "completed" | "broken";
  penaltyFee?: number;
  brokenDate?: string;
  breakReason?: string;
  goalAmount?: number; // Goal amount for progress display
  planType?: "FLEX_SAVE" | "NATTY_AUTO_SAVE"; // Plan type from API
  currency?: string; // Currency from API
  daysLeft?: number; // Days left until maturity
  onView?: () => void;
  onBreak?: () => void;
}

const SavingsPlanCard: React.FC<SavingsPlanCardProps> = ({ name, amount, earned = 0, startDate, maturityDate, interestRate = "", status = "active", penaltyFee = 0, brokenDate = "", breakReason = "", goalAmount, planType, currency = "NGN", daysLeft, onView, onBreak }) => {
  // Broken state layout
  if (status === "broken") {
    return (
      <div className="rounded-xl border border-white/10 bg-transparent p-3 sm:p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-white font-medium text-xs sm:text-sm">{name}</p>
          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-white/50 text-[10px] sm:text-xs">Penalty Fee</p>
            <p className="text-[#ff6b6b] text-sm sm:text-base font-medium">₦{penaltyFee.toLocaleString()}</p>
          </div>
        </div>

        {/* Details row - 3 columns for broken */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Start Date</span>
            <span className="text-white text-[11px] sm:text-xs">{startDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Broken Date</span>
            <span className="text-white text-[11px] sm:text-xs">{brokenDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Reason for Breaking</span>
            <span className="text-white text-[11px] sm:text-xs">{breakReason}</span>
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

  // Completed state layout
  if (status === "completed") {
    return (
      <div className="rounded-xl border border-white/10 bg-transparent p-3 sm:p-4 flex flex-col gap-3">
        {/* Header with Plan Type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-medium text-xs sm:text-sm">{name}</p>
              {planType && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  planType === "FLEX_SAVE" 
                    ? "bg-blue-500/20 text-blue-400" 
                    : "bg-purple-500/20 text-purple-400"
                }`}>
                  {planType === "FLEX_SAVE" ? "Flex" : "Auto"}
                </span>
              )}
            </div>
            {goalAmount && (
              <div className="mt-1.5">
                <div className="flex items-center justify-between text-[9px] text-white/40 mb-0.5">
                  <span>Goal: {currency === "NGN" ? "₦" : currency} {goalAmount.toLocaleString()}</span>
                  <span className="text-emerald-400">100%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div className="bg-emerald-400 h-1 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end shrink-0">
            <p className="text-white text-sm sm:text-base font-medium">{currency === "NGN" ? "₦" : currency} {amount.toLocaleString()}</p>
            {earned > 0 && <p className="text-emerald-400 text-[10px] sm:text-xs mt-0.5">{currency === "NGN" ? "₦" : currency} {earned.toLocaleString()} earned</p>}
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
            <span className="text-white text-[11px] sm:text-xs">{maturityDate}</span>
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

  // Active state layout (original)
  const progressPercentage = goalAmount ? Math.min(100, (amount / goalAmount) * 100) : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-transparent p-3 sm:p-4 flex flex-col gap-3">
      {/* Header with Plan Type */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white font-medium text-xs sm:text-sm">{name}</p>
            {planType && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                planType === "FLEX_SAVE" 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "bg-purple-500/20 text-purple-400"
              }`}>
                {planType === "FLEX_SAVE" ? "Flex" : "Auto"}
              </span>
            )}
          </div>
          {goalAmount && (
            <div className="mt-1.5">
              <div className="flex items-center justify-between text-[9px] text-white/40 mb-0.5">
                <span>Goal: {currency === "NGN" ? "₦" : currency} {goalAmount.toLocaleString()}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1">
                <div 
                  className="bg-[#D4B139] h-1 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="text-right flex flex-col items-end shrink-0">
          <p className="text-white text-sm sm:text-base font-medium">{currency === "NGN" ? "₦" : currency} {amount.toLocaleString()}</p>
          {earned > 0 && <p className="text-emerald-400 text-[10px] sm:text-xs mt-0.5">{currency === "NGN" ? "₦" : currency} {earned.toLocaleString()} earned</p>}
        </div>
      </div>

      {/* Details row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">Start Date</span>
          <span className="text-white text-[11px] sm:text-xs">{startDate}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">Maturity Date</span>
          <span className="text-white text-[11px] sm:text-xs">{maturityDate}</span>
        </div>
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <span className="text-white/50 text-[10px] sm:text-[11px]">Interest Rate</span>
          <span className="text-white text-[11px] sm:text-xs">{interestRate}</span>
        </div>
        {daysLeft !== undefined && daysLeft > 0 && (
          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
            <span className="text-white/50 text-[10px] sm:text-[11px]">Days Left</span>
            <span className="text-white text-[11px] sm:text-xs">{daysLeft} Days</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3 mt-1">
        <button onClick={onView} className="flex-1 rounded-lg border border-[#D4B139] text-white py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-[#D4B139]/10 transition-colors">View Details</button>
        {onBreak && (
          <button onClick={onBreak} className="flex-1 rounded-lg border border-[#ff6b6b] text-[#ff6b6b] py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-[#ff6b6b]/5 transition-colors">Break Plan</button>
        )}
      </div>
    </div>
  );
};

export default SavingsPlanCard;
