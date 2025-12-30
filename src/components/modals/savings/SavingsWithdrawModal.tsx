"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useWithdrawSavingsPlan, useGetSavingsPlanById } from "@/api/savings/savings.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface SavingsWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planId?: string;
}

const SavingsWithdrawModal: React.FC<SavingsWithdrawModalProps> = ({ isOpen, onClose, planName, planId }) => {
  const [walletPin, setWalletPin] = React.useState("");
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [reason, setReason] = React.useState("");

  const { plan } = useGetSavingsPlanById(planId || null);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to withdraw from savings plan"];

    ErrorToast({
      title: "Withdrawal Failed",
      descriptions,
    });
    setShowConfirm(false);
    setWalletPin("");
  };

  const onSuccess = (data: any) => {
    const response = data?.data?.data;
    const isEarly = response?.isEarlyWithdrawal;
    const penalty = response?.penaltyApplied || 0;
    const interest = response?.interestPaid || 0;
    const total = response?.totalReceived || 0;

    SuccessToast({
      title: "Withdrawal Successful!",
      description: isEarly
        ? `₦${total.toLocaleString()} has been withdrawn. Penalty of ₦${penalty.toLocaleString()} applied.`
        : `₦${total.toLocaleString()} has been withdrawn. Interest earned: ₦${interest.toLocaleString()}.`,
    });
    setShowConfirm(false);
    setWalletPin("");
    setReason("");
    onClose();
  };

  const { mutate: withdrawPlan, isPending: withdrawing } = useWithdrawSavingsPlan(onError, onSuccess);

  React.useEffect(()=>{ 
    if (isOpen){ 
      setWalletPin("");
      setShowConfirm(false);
      setReason("");
    }
  },[isOpen]);

  const handleWithdraw = () => {
    if (!planId) {
      ErrorToast({
        title: "Error",
        descriptions: ["Plan ID is missing"],
      });
      return;
    }

    if (!walletPin || walletPin.length !== 4) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid 4-digit PIN"],
      });
      return;
    }

    const today = new Date();
    const maturity = new Date(plan?.maturityDate || "");
    const isEarly = maturity > today;

    if (isEarly && !reason.trim()) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please provide a reason for early withdrawal"],
      });
      return;
    }

    withdrawPlan({
      planId,
      formdata: {
        walletPin,
        reason: reason.trim() || undefined,
      },
    });
  };

  const today = new Date();
  const maturity = plan ? new Date(plan.maturityDate) : new Date();
  const isEarly = maturity > today;
  const penaltyRate = plan?.penaltyRate || 10;
  const currentAmount = plan?.currentAmount || 0;
  const interestEarned = plan?.interestEarned || 0;
  const estimatedPenalty = isEarly ? (currentAmount * penaltyRate) / 100 : 0;
  const estimatedTotal = isEarly 
    ? currentAmount - estimatedPenalty 
    : currentAmount + interestEarned;

  if (!isOpen) return null;
  return (
    <div className="z-[999999] fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative mx-3 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>
        <h3 className="text-white text-base font-semibold mb-4">Withdraw from {planName}</h3>

        {!showConfirm ? (
          <>
            {isEarly && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3 mb-4">
                <p className="text-[#ff6b6b] text-xs mb-2">⚠️ Early Withdrawal Penalty</p>
                <p className="text-white/80 text-xs">
                  Withdrawing before maturity will result in a {penaltyRate}% penalty (₦{estimatedPenalty.toLocaleString()}) and loss of accrued interest.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Current Amount</span>
                <span className="text-white text-sm font-medium">₦{currentAmount.toLocaleString()}</span>
              </div>
              {!isEarly && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Interest Earned</span>
                  <span className="text-emerald-400 text-sm font-medium">+₦{interestEarned.toLocaleString()}</span>
                </div>
              )}
              {isEarly && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Penalty ({penaltyRate}%)</span>
                    <span className="text-[#ff6b6b] text-sm font-medium">-₦{estimatedPenalty.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Interest Forfeited</span>
                    <span className="text-[#ff6b6b] text-sm font-medium">-₦{interestEarned.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">You'll Receive</span>
                <span className="text-white text-base font-semibold">₦{estimatedTotal.toLocaleString()}</span>
              </div>
            </div>

            {isEarly && (
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-white/70 text-xs">Reason for Early Withdrawal</label>
                <textarea
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none resize-none"
                  placeholder="Enter reason..."
                  rows={3}
                  value={reason}
                  onChange={(e)=> setReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-white/70 text-xs">Enter Transaction PIN</label>
              <input
                type="password"
                maxLength={4}
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                placeholder="••••"
                value={walletPin}
                onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <CustomButton type="button" className="bg-transparent border border-white/15 text-white rounded-lg py-2.5" onClick={onClose}>Cancel</CustomButton>
              <CustomButton 
                type="button" 
                disabled={walletPin.length !== 4 || (isEarly && !reason.trim()) || withdrawing} 
                isLoading={withdrawing}
                className="bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5" 
                onClick={handleWithdraw}
              >
                Confirm Withdrawal
              </CustomButton>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SavingsWithdrawModal;
