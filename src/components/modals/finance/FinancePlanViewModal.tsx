"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { FiCopy, FiExternalLink } from "react-icons/fi";

export interface FinancePlanData {
  name: string;
  amount: number;
  earned: number;
  startDate: string;
  endDate: string;
  interestRate: string;
  duration: string;
  type: "investment" | "fixed_deposit";
}

interface FinancePlanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancePlanData | null;
}

const FinancePlanViewModal: React.FC<FinancePlanViewModalProps> = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = () => {
    const isCompleted = new Date(plan.endDate) < new Date();
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        isCompleted 
          ? 'bg-emerald-500/10 text-emerald-400' 
          : 'bg-[#D4B139]/10 text-[#D4B139]'
      }`}>
        {isCompleted ? 'Completed' : 'Active'}
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-6 z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              <span className="text-xs text-white/50">
                {plan.type === 'investment' ? 'Investment' : 'Fixed Deposit'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <CgClose className="text-xl text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/70">Total Value</span>
              <span className="text-white font-medium text-lg">{formatCurrency(plan.amount + plan.earned)}</span>
            </div>
            
            <div className="h-px bg-white/10 my-3" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Principal</p>
                <p className="text-white font-medium">{formatCurrency(plan.amount)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Earnings</p>
                <p className="text-emerald-400 font-medium">+{formatCurrency(plan.earned)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Interest Rate</p>
                <p className="text-white font-medium">{plan.interestRate}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Duration</p>
                <p className="text-white font-medium">{plan.duration}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-white font-medium">Plan Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Plan ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">INV-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  <button 
                    onClick={() => copyToClipboard(`INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}`)}
                    className="text-white/50 hover:text-[#D4B139] transition-colors"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Start Date</span>
                <span className="text-white text-sm">{plan.startDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Maturity Date</span>
                <span className="text-white text-sm">{plan.endDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Payment Method</span>
                <span className="text-white text-sm">Wallet</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium transition-colors mb-3">
              {plan.type === 'investment' ? 'Add Funds' : 'Renew Fixed Deposit'}
            </button>
            
            <button className="w-full bg-transparent hover:bg-white/5 text-white py-3 rounded-lg font-medium border border-white/10 transition-colors flex items-center justify-center gap-2">
              <span>View Transaction History</span>
              <FiExternalLink className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePlanViewModal;
