"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useSetCardLimits } from "@/api/currency/currency.queries";
import { IVirtualCard } from "@/api/currency/currency.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface SpendingLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard | null;
}

const SpendingLimitModal: React.FC<SpendingLimitModalProps> = ({ isOpen, onClose, card }) => {
  const [dailyLimit, setDailyLimit] = React.useState("");
  const [monthlyLimit, setMonthlyLimit] = React.useState("");
  const [transactionLimit, setTransactionLimit] = React.useState("");

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to set card limits"];

    ErrorToast({
      title: "Action Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Limits Updated!",
      description: "Card spending limits have been updated successfully.",
    });
    setDailyLimit("");
    setMonthlyLimit("");
    setTransactionLimit("");
    onClose();
  };

  const { mutate: setLimits, isPending: setting } = useSetCardLimits(onError, onSuccess);

  React.useEffect(() => {
    if (isOpen && card) {
      setDailyLimit(card.dailyLimit?.toString() || "");
      setMonthlyLimit(card.monthlyLimit?.toString() || "");
      setTransactionLimit(card.transactionLimit?.toString() || "");
    } else if (isOpen) {
      setDailyLimit("");
      setMonthlyLimit("");
      setTransactionLimit("");
    }
  }, [isOpen, card]);

  const handleSetLimits = () => {
    if (!card) {
      ErrorToast({
        title: "Error",
        descriptions: ["Card information is missing"],
      });
      return;
    }

    const limits: any = {};
    if (dailyLimit && Number(dailyLimit) > 0) {
      limits.dailyLimit = Number(dailyLimit);
    }
    if (monthlyLimit && Number(monthlyLimit) > 0) {
      limits.monthlyLimit = Number(monthlyLimit);
    }
    if (transactionLimit && Number(transactionLimit) > 0) {
      limits.transactionLimit = Number(transactionLimit);
    }

    if (Object.keys(limits).length === 0) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter at least one limit"],
      });
      return;
    }

    setLimits({
      cardId: card.id,
      formdata: limits,
    });
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full">
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-4">Set Spending Limits</h2>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs">Daily Limit (USD)</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter daily limit"
              className="w-full rounded-lg border border-white/10 bg-bg-2400 dark:bg-bg-2100 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs">Monthly Limit (USD)</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter monthly limit"
              className="w-full rounded-lg border border-white/10 bg-bg-2400 dark:bg-bg-2100 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-white/70 text-xs">Transaction Limit (USD)</label>
            <input
              type="number"
              value={transactionLimit}
              onChange={(e) => setTransactionLimit(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter transaction limit"
              className="w-full rounded-lg border border-white/10 bg-bg-2400 dark:bg-bg-2100 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <CustomButton
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSetLimits}
            disabled={setting}
            isLoading={setting}
            className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
          >
            Set Limits
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default SpendingLimitModal;

