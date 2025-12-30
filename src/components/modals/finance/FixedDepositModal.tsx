"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";

interface FixedDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FixedDepositModal: React.FC<FixedDepositModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<number>(50000);
  const [duration, setDuration] = useState<number>(3);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
    setAmount(value);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const calculateInterest = (): number => {
    // Fixed deposit rates (example)
    const rates: Record<number, number> = {
      1: 0.10,  // 10% for 1 month
      3: 0.12,  // 12% for 3 months
      6: 0.15,  // 15% for 6 months
      12: 0.18, // 18% for 12 months
    };
    
    // Get the closest lower duration if exact match not found
    const rate = rates[duration] || rates[12];
    return amount * (rate / 12) * duration;
  };

  const totalPayout = amount + calculateInterest();
  const interestRate = (() => {
    if (duration === 1) return "10% per annum";
    if (duration === 3) return "12% per annum";
    if (duration === 6) return "15% per annum";
    return "18% per annum";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-6 z-10">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        {step === 1 ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-6">Start Fixed Deposit</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Amount to Deposit (Minimum ₦50,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">₦</span>
                  <input
                    type="text"
                    value={formatCurrency(amount)}
                    onChange={handleAmountChange}
                    className="w-full bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  {[50000, 100000, 200000, 500000].map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(value)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        amount === value
                          ? 'bg-[#D4B139] text-black'
                          : 'bg-bg-500 dark:bg-bg-900 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {formatCurrency(value)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setDuration(months)}
                      className={`py-2 text-sm rounded-lg ${
                        duration === months
                          ? 'bg-[#D4B139] text-black font-medium'
                          : 'bg-bg-500 dark:bg-bg-900 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {months} {months === 1 ? 'Month' : 'Months'}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Interest Rate: <span className="text-[#D4B139]">{interestRate}</span>
                </div>
              </div>

              <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Principal Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Interest ({duration} months):</span>
                  <span className="text-[#D4B139] font-medium">+{formatCurrency(calculateInterest())}</span>
                </div>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex justify-between">
                  <span className="text-white/70">Maturity Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(totalPayout)}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={amount < 50000}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  amount >= 50000
                    ? 'bg-[#D4B139] hover:bg-[#c7a42f] text-black'
                    : 'bg-gray-500 cursor-not-allowed text-gray-300'
                }`}
              >
                Continue <FiArrowRight />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4B139]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B139" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Fixed Deposit Created!</h2>
            <p className="text-white/70 mb-6">Your fixed deposit of {formatCurrency(amount)} has been successfully created.</p>
            
            <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Principal:</span>
                <span className="text-white">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Duration:</span>
                <span className="text-white">{duration} {duration === 1 ? 'Month' : 'Months'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Interest Rate:</span>
                <span className="text-[#D4B139]">{interestRate}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white/70">Maturity Date:</span>
                <span className="text-white">
                  {new Date(new Date().setMonth(new Date().getMonth() + duration)).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/70">Maturity Amount:</span>
                <span className="text-white font-medium">{formatCurrency(totalPayout)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onClose}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium transition-colors"
              >
                View Fixed Deposit
              </button>
              <button
                onClick={onClose}
                className="w-full bg-transparent hover:bg-white/5 text-white py-3 rounded-lg font-medium border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedDepositModal;
