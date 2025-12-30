"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useWithdrawCard } from "@/api/currency/currency.queries";
import { IVirtualCard } from "@/api/currency/currency.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface WithdrawCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard | null;
}

const WithdrawCardModal: React.FC<WithdrawCardModalProps> = ({ isOpen, onClose, card }) => {
  const [amount, setAmount] = React.useState("");
  const [walletPin, setWalletPin] = React.useState("");
  const [showPinStep, setShowPinStep] = React.useState(false);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to withdraw from card"];

    ErrorToast({
      title: "Withdrawal Failed",
      descriptions,
    });
    setShowPinStep(false);
    setWalletPin("");
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Withdrawal Successful!",
      description: `$${Number(amount).toLocaleString()} has been withdrawn from your card.`,
    });
    setShowPinStep(false);
    setAmount("");
    setWalletPin("");
    onClose();
  };

  const { mutate: withdrawCard, isPending: withdrawing } = useWithdrawCard(onError, onSuccess);

  React.useEffect(() => {
    if (isOpen) {
      setAmount("");
      setWalletPin("");
      setShowPinStep(false);
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (!amount || Number(amount) <= 0) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid amount"],
      });
      return;
    }

    if (!card) {
      ErrorToast({
        title: "Error",
        descriptions: ["Card information is missing"],
      });
      return;
    }

    if (Number(amount) > card.balance) {
      ErrorToast({
        title: "Insufficient Balance",
        descriptions: ["You don't have enough balance on this card"],
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

    if (!card) {
      ErrorToast({
        title: "Error",
        descriptions: ["Card information is missing"],
      });
      return;
    }

    withdrawCard({
      cardId: card.id,
      formdata: {
        amount: Number(amount),
        walletPin,
      },
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
        <h2 className="text-white text-base font-semibold mb-4">Withdraw from Card</h2>

        {!showPinStep ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 mb-2">
                <p className="text-white/60 text-xs mb-1">Available Balance</p>
                <p className="text-white text-lg font-semibold">${card.balance.toLocaleString()}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Amount (USD)</label>
                <input
                  type="number"
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <CustomButton
                  onClick={onClose}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  onClick={handleContinue}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                >
                  Continue
                </CustomButton>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Amount</span>
                <span className="text-white text-sm font-medium">${Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Card</span>
                <span className="text-white text-sm font-medium">{card.label}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-white/70 text-xs">Enter Transaction PIN</label>
              <input
                type="password"
                maxLength={4}
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                placeholder="••••"
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <CustomButton
                onClick={() => setShowPinStep(false)}
                className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
              >
                Back
              </CustomButton>
              <CustomButton
                onClick={handleConfirm}
                disabled={walletPin.length !== 4 || withdrawing}
                isLoading={withdrawing}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
              >
                Confirm
              </CustomButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WithdrawCardModal;


