"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useWithdrawSavingsPlan, useGetSavingsPlanById } from "@/api/savings/savings.queries";
import { useGetEasyLifePlanById, useWithdrawEasyLifePlan } from "@/api/easylife-savings/easylife-savings.queries";
import { useVerifyWalletPin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import type { SavingsPlan } from "@/api/savings/savings.types";
import type { EasyLifePlan } from "@/api/easylife-savings/easylife-savings.types";

interface SavingsWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planId?: string;
  planType?: "target" | "easylife";
}

const SavingsWithdrawModal: React.FC<SavingsWithdrawModalProps> = ({
  isOpen,
  onClose,
  planName,
  planId,
  planType = "target",
}) => {
  const [walletPin, setWalletPin] = React.useState("");
  const [reason, setReason] = React.useState("");

  const { plan: savingsPlan } = useGetSavingsPlanById(
    planType === "target" ? planId || null : null
  );
  const { plan: easyLifePlan } = useGetEasyLifePlanById(
    planType === "easylife" ? planId || null : null
  );
  const plan: SavingsPlan | EasyLifePlan | null = planType === "easylife" ? easyLifePlan : savingsPlan;

  const onError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Failed to withdraw from savings plan"];

    ErrorToast({
      title: "Withdrawal Failed",
      descriptions,
    });
    setWalletPin("");
  };

  const onSuccess = (data: unknown) => {
    const response = (data as { data?: { data?: { penalty?: number; interest?: number; payoutAmount?: number } } })
      ?.data?.data;
    const penalty = response?.penalty ?? 0;
    const interest = response?.interest ?? 0;
    const total = response?.payoutAmount ?? 0;

    SuccessToast({
      title: "Withdrawal Successful!",
      description: `Payout ₦${Number(total).toLocaleString()} processed. Interest: ₦${Number(interest).toLocaleString()}, Penalty: ₦${Number(penalty).toLocaleString()}.`,
    });
    setWalletPin("");
    setReason("");
    onClose();
  };

  const { mutate: withdrawSavings, isPending: withdrawingSavings } = useWithdrawSavingsPlan(onError, onSuccess);
  const { mutate: withdrawEasyLife, isPending: withdrawingEasyLife } = useWithdrawEasyLifePlan(onError, onSuccess);

  const onVerifyPinError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Invalid PIN"];
    ErrorToast({ title: "Verification Failed", descriptions });
  };

  const onVerifyPinSuccess = () => {
    if (!planId) return;
    if (planType === "easylife") {
      withdrawEasyLife({ planId });
    } else {
      withdrawSavings({ planId });
    }
  };

  const { mutate: verifyPin, isPending: verifyingPin } = useVerifyWalletPin(
    onVerifyPinError,
    onVerifyPinSuccess
  );

  const withdrawing = withdrawingSavings || withdrawingEasyLife || verifyingPin;

  React.useEffect(()=>{ 
    if (isOpen){ 
      setWalletPin("");
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

    // Optional reason (for UX only); backend does not require it for these withdraw endpoints
    verifyPin({ pin: walletPin });
  };

  const today = new Date();
  const maturity = plan ? new Date(plan.maturityDate) : new Date();
  const isEarly = maturity > today;
  const penaltyRatePercent =
    typeof plan?.penaltyRate === "number" ? Math.round(plan.penaltyRate * 1000) / 10 : undefined;

  if (!isOpen) return null;
  return (
    <div className="z-[999999] fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative mx-3 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>
        <h3 className="text-white text-base font-semibold mb-4">Withdraw from {planName}</h3>

        {true ? (
          <>
            {isEarly && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 rounded-lg p-3 mb-4">
                <p className="text-[#ff6b6b] text-xs mb-2">⚠️ Early Withdrawal Penalty</p>
                <p className="text-white/80 text-xs">
                  Withdrawing before maturity will attract a penalty{penaltyRatePercent !== undefined ? ` (${penaltyRatePercent}%)` : ""}. Final payout is calculated by the server.
                </p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Total Deposited</span>
                <span className="text-white text-sm font-medium">₦{Number(plan?.totalDeposited ?? 0).toLocaleString()}</span>
              </div>
              {typeof plan?.totalInterestAccrued === "number" && (
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Interest Earned</span>
                  <span className="text-emerald-400 text-sm font-medium">+₦{Number(plan.totalInterestAccrued).toLocaleString()}</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2" />
              <p className="text-white/60 text-xs">
                You&apos;ll see the exact payout, interest, and any penalty after confirmation.
              </p>
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
                disabled={walletPin.length !== 4 || withdrawing} 
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
