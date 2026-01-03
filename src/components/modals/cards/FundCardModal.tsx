"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import { useFundCard } from "@/api/currency/currency.queries";
import { IVirtualCard } from "@/api/currency/currency.types";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import { isInsufficientBalanceError, extractBalanceInfo } from "@/utils/errorUtils";

interface FundCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard | null;
}

const FundCardModal: React.FC<FundCardModalProps> = ({ isOpen, onClose, card }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];
  const [amount, setAmount] = React.useState("");
  const [walletPin, setWalletPin] = React.useState("");
  const [selectedWalletIndex, setSelectedWalletIndex] = React.useState(0);
  const [showPinStep, setShowPinStep] = React.useState(false);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = React.useState(false);
  const [balanceInfo, setBalanceInfo] = React.useState<{ requiredAmount?: number; currentBalance?: number }>({});

  const onError = (error: any) => {
    // Check if it's an insufficient balance error
    if (isInsufficientBalanceError(error)) {
      const info = extractBalanceInfo(error);
      const selectedWallet = wallets[selectedWalletIndex];
      // If we don't have balance info from error, use the wallet balance
      if (!info.currentBalance && selectedWallet) {
        info.currentBalance = selectedWallet.balance || 0;
      }
      // If we don't have required amount, use the amount being funded
      if (!info.requiredAmount && amount) {
        info.requiredAmount = Number(amount);
      }
      setBalanceInfo(info);
      setShowInsufficientBalanceModal(true);
      setShowPinStep(false);
      setWalletPin("");
      return;
    }

    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to fund card"];

    ErrorToast({
      title: "Funding Failed",
      descriptions,
    });
    setShowPinStep(false);
    setWalletPin("");
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Card Funded Successfully!",
      description: `$${Number(amount).toLocaleString()} has been added to your card.`,
    });
    setShowPinStep(false);
    setAmount("");
    setWalletPin("");
    setSelectedWalletIndex(0);
    onClose();
  };

  const { mutate: fundCard, isPending: funding } = useFundCard(onError, onSuccess);

  React.useEffect(() => {
    if (isOpen) {
      setAmount("");
      setWalletPin("");
      setSelectedWalletIndex(0);
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

    const selectedWallet = wallets[selectedWalletIndex];
    if (!selectedWallet) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select a wallet"],
      });
      return;
    }

    if (Number(amount) > Number(selectedWallet.balance)) {
      setBalanceInfo({
        requiredAmount: Number(amount),
        currentBalance: Number(selectedWallet.balance),
      });
      setShowInsufficientBalanceModal(true);
      return;
    }

    if (!card) {
      ErrorToast({
        title: "Error",
        descriptions: ["Card information is missing"],
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

    const selectedWallet = wallets[selectedWalletIndex];
    fundCard({
      cardId: card.id,
      formdata: {
        amount: Number(amount),
        walletPin,
        walletId: selectedWallet?.id,
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
        <h2 className="text-white text-base font-semibold mb-4">Fund Card</h2>

        {!showPinStep ? (
          <>
            <div className="flex flex-col gap-3">
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

              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Select Funding Source</label>
                <div className="rounded-lg border border-white/10 bg-transparent divide-y divide-white/10">
                  <div className="flex items-center justify-between py-3 px-3">
                    <span className="text-white/80 text-sm">
                      Available Balance (₦{Number(wallets?.[selectedWalletIndex]?.balance || wallets?.[0]?.balance || 0).toLocaleString()})
                    </span>
                  </div>
                  {wallets.map((w, i) => (
                    <label key={i} className="flex items-center justify-between py-3 px-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                          <span className="text-black font-bold">{w.currency?.slice(0, 1) || "N"}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white text-sm font-medium">{w.bankName || w.currency}</p>
                          <p className="text-white/60 text-xs">
                            ₦{Number(w.balance || 0).toLocaleString()} <span className="ml-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/10">Balance</span>
                          </p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selectedWalletIndex === i}
                        onChange={() => setSelectedWalletIndex(i)}
                        className="w-4 h-4 accent-[#D4B139]"
                      />
                    </label>
                  ))}
                </div>
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
                <span className="text-white/60 text-sm">Source</span>
                <span className="text-white text-sm font-medium">{wallets[selectedWalletIndex]?.bankName || wallets[selectedWalletIndex]?.currency}</span>
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
                disabled={walletPin.length !== 4 || funding}
                isLoading={funding}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
              >
                Confirm
              </CustomButton>
            </div>
          </>
        )}
      </div>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={balanceInfo.requiredAmount}
        currentBalance={balanceInfo.currentBalance}
      />
    </div>
  );
};

export default FundCardModal;


