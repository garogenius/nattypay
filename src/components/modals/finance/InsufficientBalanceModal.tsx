"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount?: number;
  currentBalance?: number;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFundAccount = () => {
    onClose();
    navigate("/user/dashboard");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 sm:p-6 z-10">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <FiAlertCircle className="text-red-500 text-3xl" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Insufficient Wallet Balance</h2>
          <p className="text-white/70 text-sm">
            You don't have enough funds in your wallet to complete this investment.
          </p>
        </div>

        {/* Balance Information */}
        {(requiredAmount || currentBalance !== undefined) && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 space-y-2">
            {requiredAmount && (
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Required Amount:</span>
                <span className="text-white font-medium">
                  ₦{requiredAmount.toLocaleString()}
                </span>
              </div>
            )}
            {currentBalance !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">Current Balance:</span>
                <span className="text-white font-medium">
                  ₦{currentBalance.toLocaleString()}
                </span>
              </div>
            )}
            {requiredAmount && currentBalance !== undefined && (
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-white/70 text-sm">Shortfall:</span>
                <span className="text-red-400 font-medium">
                  ₦{Math.max(0, requiredAmount - currentBalance).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Information Card */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium mb-1">Fund Your Account</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Please fund your account with sufficient balance before applying for investment. 
                You can add funds through bank transfer, card payment, or other available payment methods.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <CustomButton
            onClick={handleFundAccount}
            className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
          >
            <span className="flex items-center justify-center gap-2">
              Fund Account
              <FiArrowRight className="text-base" />
            </span>
          </CustomButton>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientBalanceModal;


