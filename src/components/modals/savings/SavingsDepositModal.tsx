"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";
import { useFundSavingsPlan } from "@/api/savings/savings.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface SavingsDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planId?: string;
}

const SavingsDepositModal: React.FC<SavingsDepositModalProps> = ({ isOpen, onClose, planName, planId }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];
  const [amount, setAmount] = React.useState("");
  const [selectedWalletIndex, setSelectedWalletIndex] = React.useState(0);
  const [walletPin, setWalletPin] = React.useState("");
  const [showPinStep, setShowPinStep] = React.useState(false);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to fund savings plan"];

    ErrorToast({
      title: "Funding Failed",
      descriptions,
    });
    setShowPinStep(false);
    setWalletPin("");
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Plan Funded Successfully!",
      description: `₦${Number(amount).toLocaleString()} has been added to ${planName}.`,
    });
    setShowPinStep(false);
    setAmount("");
    setWalletPin("");
    setSelectedWalletIndex(0);
    onClose();
  };

  const { mutate: fundPlan, isPending: funding } = useFundSavingsPlan(onError, onSuccess);

  React.useEffect(()=>{ 
    if (isOpen){ 
      setAmount(""); 
      setSelectedWalletIndex(0);
      setWalletPin("");
      setShowPinStep(false);
    }
  },[isOpen]);

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
      ErrorToast({
        title: "Insufficient Balance",
        descriptions: ["You don't have enough balance in the selected wallet"],
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

    const selectedWallet = wallets[selectedWalletIndex];
    fundPlan({
      planId,
      amount: Number(amount),
      walletPin,
      walletId: selectedWallet?.id,
    });
  };

  if (!isOpen) return null;
  return (
    <div className="z-[999999] fixed inset-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative mx-3 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl p-4">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>
        <h3 className="text-white text-base font-semibold mb-4">Deposit to {planName}</h3>

        {!showPinStep ? (
          <>
            <div className="flex flex-col gap-2 mb-3">
              <label className="text-white/70 text-xs">Amount</label>
              <input
                type="number"
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                placeholder="Enter amount"
                value={amount}
                onChange={(e)=> setAmount(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/70 text-xs">Select Funding Method</label>
              <div className="rounded-lg border border-white/10 bg-transparent divide-y divide-white/10">
                <div className="flex items-center justify-between py-3 px-3">
                  <span className="text-white/80 text-sm">Available Balance (₦{Number(wallets?.[selectedWalletIndex]?.balance || wallets?.[0]?.balance || 0).toLocaleString()})</span>
                  <span className="w-4 h-4 rounded-full border-2 border-[#D4B139] inline-block" />
                </div>
                {wallets.map((w, i) => (
                  <label key={i} className="flex items-center justify-between py-3 px-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                        <span className="text-black font-bold">{w.currency?.slice(0,1) || 'N'}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white text-sm font-medium">{w.bankName || w.currency}</p>
                        <p className="text-white/60 text-xs">₦{Number(w.balance || 0).toLocaleString()} <span className="ml-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/10">Balance</span></p>
                      </div>
                    </div>
                    <input type="radio" checked={selectedWalletIndex===i} onChange={()=> setSelectedWalletIndex(i)} className="w-4 h-4 accent-[#D4B139]" />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <CustomButton type="button" className="bg-transparent border border-white/15 text-white rounded-lg py-2.5" onClick={onClose}>Cancel</CustomButton>
              <CustomButton type="button" className="bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5" onClick={handleContinue}>Continue</CustomButton>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Amount</span>
                <span className="text-white text-sm font-medium">₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Wallet</span>
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
                onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <CustomButton type="button" className="bg-transparent border border-white/15 text-white rounded-lg py-2.5" onClick={() => setShowPinStep(false)}>Back</CustomButton>
              <CustomButton type="button" disabled={walletPin.length !== 4 || funding} isLoading={funding} className="bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5" onClick={handleConfirm}>Confirm Deposit</CustomButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SavingsDepositModal;
