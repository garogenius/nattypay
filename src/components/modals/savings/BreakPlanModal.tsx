"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import BreakPlanDetailsModal from "./BreakPlanDetailsModal";
import { useWithdrawSavingsPlan, useGetSavingsPlanById } from "@/api/savings/savings.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface BreakPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planId?: string;
  onConfirm: () => void;
}

const BreakPlanModal: React.FC<BreakPlanModalProps> = ({ isOpen, onClose, planName, planId, onConfirm }) => {
  const [reason, setReason] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [walletPin, setWalletPin] = React.useState("");
  const [showPinStep, setShowPinStep] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { plan } = useGetSavingsPlanById(planId || null);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to break savings plan"];

    ErrorToast({
      title: "Breaking Plan Failed",
      descriptions,
    });
    setShowPinStep(false);
    setWalletPin("");
  };

  const onSuccess = (data: any) => {
    const response = data?.data?.data;
    const penalty = response?.penaltyApplied || 0;
    const total = response?.totalReceived || 0;

    SuccessToast({
      title: "Plan Broken Successfully!",
      description: `₦${total.toLocaleString()} has been withdrawn. Penalty of ₦${penalty.toLocaleString()} applied.`,
    });
    setShowSuccess(true);
    setShowPinStep(false);
    setWalletPin("");
    onConfirm();
  };

  const { mutate: withdrawPlan, isPending: breaking } = useWithdrawSavingsPlan(onError, onSuccess);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setWalletPin("");
      setShowPinStep(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (!reason) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select a reason for breaking the plan"],
      });
      return;
    }

    if (!planId) {
      ErrorToast({
        title: "Error",
        descriptions: ["Plan ID is missing"],
      });
      return;
    }

    setShowPinStep(true);
  };

  const handleConfirm = () => {
    if (!walletPin || walletPin.length !== 4) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid 4-digit PIN"],
      });
      return;
    }

    if (!planId) {
      ErrorToast({
        title: "Error",
        descriptions: ["Plan ID is missing"],
      });
      return;
    }

    withdrawPlan({
      planId,
      formdata: {
        walletPin,
        reason: reasons.find(r => r.value === reason)?.label || reason,
      },
    });
  };

  if (!isOpen) return null;

  const currentAmount = plan?.currentAmount || 0;
  const interestEarned = plan?.interestEarned || 0;
  const penaltyRate = plan?.penaltyRate || 10;
  const estimatedPenalty = (currentAmount * penaltyRate) / 100;
  const estimatedTotal = currentAmount - estimatedPenalty;

  const reasons = [
    { value: "emergency", label: "Emergency Expenses" },
    { value: "better_opportunity", label: "Better Investment Opportunity" },
    { value: "financial_difficulty", label: "Financial Difficulty" },
    { value: "change_of_plans", label: "Change of Plans" },
    { value: "need_funds", label: "Need Funds Urgently" },
    { value: "other", label: "Other" },
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
          <h3 className="text-[#ff6b6b] text-sm font-medium">Breaking Savings Plan?</h3>

          {/* Warning Box */}
          <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3 flex gap-2">
            <div className="shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="flex flex-col gap-1.5 text-[11px] text-[#ff6b6b]">
              <p>Breaking this savings plan early will result in:</p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Loss of all accrued interest (₦5,000.00)</li>
                <li>Early termination penalty of 2.5% (₦5,000)</li>
                <li>Funds will be available within 24 hours</li>
              </ul>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Original Amount</span>
              <span className="text-white">₦{currentAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Interest Forfeited</span>
              <span className="text-white">₦{interestEarned.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Early Termination Penalty ({penaltyRate}%)</span>
              <span className="text-white">₦{estimatedPenalty.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex items-center justify-between font-medium">
              <span className="text-white">You'll Receive</span>
              <span className="text-white">₦{estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Select Reason */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs">Select Reason</label>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-2.5 px-3 text-white text-sm outline-none flex items-center justify-between"
              >
                <span className={reason ? "text-white" : "text-white/50"}>
                  {reason ? reasons.find(r => r.value === reason)?.label : "Choose a reason..."}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d29] border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
                  {reasons.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setReason(r.value);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-white text-sm hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!showPinStep ? (
            <>
              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/15 text-white py-2.5 text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!reason}
                  className="rounded-lg bg-[#ff6b6b] hover:bg-[#ff5252] text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 mt-2">
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
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setShowPinStep(false)}
                  className="rounded-lg border border-white/15 text-white py-2.5 text-sm hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={walletPin.length !== 4 || breaking}
                  className="rounded-lg bg-[#ff6b6b] hover:bg-[#ff5252] text-white py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {breaking ? "Breaking..." : "Confirm Break"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <BreakPlanDetailsModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        planName={planName}
        reason={reasons.find(r => r.value === reason)?.label || ""}
        breakDate={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
      />
    </div>
  );
};

export default BreakPlanModal;
