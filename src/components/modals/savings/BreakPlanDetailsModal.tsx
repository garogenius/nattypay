"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface BreakPlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  reason: string;
  breakDate: string;
}

const BreakPlanDetailsModal: React.FC<BreakPlanDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  planName, 
  reason,
  breakDate 
}) => {
  if (!isOpen) return null;

  // Sample data
  const transactions = [
    { type: "Deposit", date: "12-05-2025", amount: 5000.00 },
    { type: "Withdrawal", date: "10-05-2025", amount: 5000.00 },
    { type: "Deposit", date: "12-05-2025", amount: 5000.00 },
    { type: "Deposit", date: "12-05-2025", amount: 5000.00 },
  ];

  return (
    <div className="z-[999999] fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative mx-3 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-sm rounded-2xl p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 cursor-pointer hover:bg-white/5 rounded-full transition-colors">
          <CgClose className="text-lg text-white" />
        </button>

        <div className="flex flex-col gap-4">
          {/* Title */}
          <h3 className="text-white text-sm font-medium">{planName}</h3>

          {/* Break Info */}
          <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#ff6b6b] text-xs">Break Reason</span>
              <span className="text-white text-xs">{reason}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#ff6b6b] text-xs">Broken on</span>
              <span className="text-white text-xs">{breakDate}</span>
            </div>
          </div>

          {/* Payout */}
          <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3">
            <p className="text-[#ff6b6b] text-xs mb-1">Total Payout</p>
            <p className="text-[#ff6b6b] text-xl font-semibold">₦5,000.00</p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-white/50">Principal Amount</span>
              <span className="text-white">₦5,000.00</span>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <span className="text-white/50">Penalty Fee</span>
              <span className="text-[#ff6b6b]">₦5,000.00</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pb-3 border-b border-white/10 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-white/50">Start Date</span>
              <span className="text-white">12-05-2025</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-white/50">Interest Maturity Date</span>
              <span className="text-white">12-05-2025</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-white/50">Interest Rate</span>
              <span className="text-white">17% per annum</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-white/50">Duration</span>
              <span className="text-white">6 Months</span>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="text-white text-xs font-medium mb-2.5">Transaction History</h4>
            <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden">
              {transactions.map((txn, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 border-b border-white/10 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-white text-xs">{txn.type}</span>
                    <span className="text-white/40 text-[10px]">{txn.date}</span>
                  </div>
                  <span className="text-white text-xs">+₦{txn.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakPlanDetailsModal;
