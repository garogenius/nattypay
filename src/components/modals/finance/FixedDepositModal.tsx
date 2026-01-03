"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiArrowRight } from "react-icons/fi";
import useUserStore from "@/store/user.store";
import { useCreateFixedDeposit, useGetFixedDepositPlans } from "@/api/fixed-deposits/fixed-deposits.queries";
import { useVerifyWalletPin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import type { FixedDepositPlan, FixedDepositPlanType } from "@/api/fixed-deposits/fixed-deposits.types";

interface FixedDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FixedDepositModal: React.FC<FixedDepositModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];
  const ngnWallet = wallets.find((w) => w.currency?.toUpperCase() === "NGN");

  const { plans, isPending: plansLoading } = useGetFixedDepositPlans();
  const [selectedPlanType, setSelectedPlanType] = useState<FixedDepositPlanType>("SHORT_TERM_90");
  const selectedPlan: FixedDepositPlan | undefined = plans.find((p) => p.planType === selectedPlanType) || plans[0];

  const minDeposit = selectedPlan?.minimumDeposit ?? 0;
  const [amount, setAmount] = useState<number>(minDeposit || 0);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [walletPin, setWalletPin] = useState("");
  const [transactionResult, setTransactionResult] = useState<unknown>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(ngnWallet?.id || null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);

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

  const onError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Failed to create fixed deposit"];

    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onSuccess = (data: unknown) => {
    const payload = (data as { data?: { data?: unknown } })?.data?.data;
    setTransactionResult(payload ?? null);
    setStep(3);
    SuccessToast({
      title: "Fixed Deposit Created Successfully!",
      description: "Your fixed deposit has been created. It will mature on the specified date.",
    });
  };

  const { mutate: createFixedDeposit, isPending: creating } = useCreateFixedDeposit(onError, onSuccess);

  const onVerifyPinError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Invalid PIN"];
    ErrorToast({ title: "Verification Failed", descriptions });
  };

  const onVerifyPinSuccess = () => {
    if (!selectedPlan) return;
    createFixedDeposit({
      planType: selectedPlan.planType,
      principalAmount: amount,
      currency: "NGN",
      interestPaymentFrequency: "AT_MATURITY",
      reinvestInterest: false,
      autoRenewal: false,
    });
  };

  const { mutate: verifyPin, isPending: verifyingPin } = useVerifyWalletPin(
    onVerifyPinError,
    onVerifyPinSuccess
  );

  const handleCreate = () => {
    if (!selectedPlan) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select a fixed deposit plan"],
      });
      return;
    }

    if (amount < minDeposit) {
      ErrorToast({
        title: "Validation Error",
        descriptions: [`Minimum deposit for this plan is ₦${Number(minDeposit).toLocaleString()}`],
      });
      return;
    }

    if (walletPin.length !== 4) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid 4-digit PIN"],
      });
      return;
    }

    const selectedWallet = wallets.find(w => w.id === selectedWalletId);
    if (!selectedWallet) {
      ErrorToast({
        title: "Wallet Required",
        descriptions: ["Please select a wallet"],
      });
      return;
    }

    if (Number(amount) > Number(selectedWallet.balance || 0)) {
      setShowInsufficientBalanceModal(true);
      return;
    }

    verifyPin({ pin: walletPin });
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount(minDeposit || 0);
    setWalletPin("");
    setTransactionResult(null);
    setSelectedWalletId(wallets.length > 0 ? wallets[0].id : null);
    onClose();
  };

  useEffect(() => {
    // When plans load, ensure we have a sensible default amount
    if (minDeposit > 0 && (!amount || amount < minDeposit)) {
      setAmount(minDeposit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDeposit]);

  useEffect(() => {
    // Set default wallet if none selected
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets.length]);

  const interestRateText = selectedPlan
    ? `${(selectedPlan.interestRate * 100).toFixed(2)}% per annum`
    : "N/A";

  const tr = transactionResult as null | Partial<{
    principalAmount: number;
    planType: string;
    interestRate: number;
    maturityDate: string;
  }>;

  const displayPrincipal = tr?.principalAmount ?? amount;
  const displayPlanType = tr?.planType ?? selectedPlan?.planType;
  const displayInterestRate = tr?.interestRate
    ? `${(tr.interestRate * 100).toFixed(2)}% per annum`
    : interestRateText;
  const displayMaturityDate = tr?.maturityDate
    ? new Date(tr.maturityDate).toLocaleDateString("en-GB")
    : selectedPlan
    ? new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")
    : "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-4 sm:p-6 z-10 overflow-x-hidden">
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
                  Plan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {plansLoading ? (
                    <div className="text-white/60 text-sm">Loading plans...</div>
                  ) : (
                    plans.map((p) => (
                      <button
                        key={p.planType}
                        onClick={() => {
                          setSelectedPlanType(p.planType);
                          setAmount((prev) => (prev < p.minimumDeposit ? p.minimumDeposit : prev));
                        }}
                        className={`py-2 text-sm rounded-lg text-left px-3 border ${
                          (selectedPlan?.planType || selectedPlanType) === p.planType
                            ? "bg-[#D4B139] text-black border-transparent"
                            : "bg-bg-500 dark:bg-bg-900 text-white/80 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs">{(p.interestRate * 100).toFixed(2)}%</span>
                        </div>
                        <div className="text-[11px] opacity-80 mt-0.5">
                          Min ₦{Number(p.minimumDeposit).toLocaleString()} • {p.durationDays} days
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Interest Rate: <span className="text-[#D4B139]">{interestRateText}</span>
                </div>
              </div>

              <CustomButton
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
              >
                Continue <FiArrowRight className="inline ml-2" />
              </CustomButton>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <h2 className="text-xl font-semibold text-white mb-6">Start Fixed Deposit</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 break-words">
                  Amount to Deposit {minDeposit ? `(Minimum ₦${Number(minDeposit).toLocaleString()})` : ""}
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
                <div className="flex items-center justify-between mt-2 gap-1.5 sm:gap-2 flex-wrap">
                  {[50000, 100000, 200000, 500000].map((value) => (
                    <button
                      key={value}
                      onClick={() => setAmount(value)}
                      className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded-full whitespace-nowrap ${
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

              <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70">Principal Amount:</span>
                  <span className="text-white font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="h-px bg-white/10 my-3" />
                <div className="flex justify-between">
                  <span className="text-white/70">Maturity:</span>
                  <span className="text-white/80 text-sm">Calculated by server</span>
                </div>
              </div>

              {/* Wallet Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Select Wallet
                </label>
                <div className="rounded-lg border border-white/10 bg-transparent divide-y divide-white/10">
                  <div className="flex items-center justify-between py-3 px-3">
                    <span className="text-white/80 text-sm">Available Balance (₦{Number(wallets?.[0]?.balance || 0).toLocaleString()})</span>
                    <span className="w-4 h-4 rounded-full border-2 border-[#D4B139] inline-block" />
                  </div>
                  {wallets.map((w) => (
                    <label key={w.id} className="flex items-center justify-between py-3 px-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                          <span className="text-black font-bold">{w.currency?.slice(0,1) || 'N'}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-white text-sm font-medium">{w.bankName || w.currency}</p>
                          <p className="text-white/60 text-xs">{w.accountNumber || '0000000000'} <span className="ml-2 inline-flex text-[10px] px-1.5 py-0.5 rounded bg-white/10">Account</span></p>
                        </div>
                      </div>
                      <input 
                        type="radio" 
                        checked={selectedWalletId === w.id} 
                        onChange={() => setSelectedWalletId(w.id)} 
                        className="w-4 h-4 accent-[#D4B139]" 
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <CustomButton
                  onClick={() => setStep(1)}
                  className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/5 py-3 rounded-lg"
                >
                  Back
                </CustomButton>
                <CustomButton
                  onClick={() => setStep(3)}
                  disabled={!!minDeposit && amount < minDeposit || !selectedWalletId}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
                >
                  Continue <FiArrowRight className="inline ml-2" />
                </CustomButton>
              </div>
            </div>
          </>
        ) : step === 3 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Confirm Fixed Deposit</h2>
            
            <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Principal Amount:</span>
                <span className="text-white font-medium">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Plan:</span>
                <span className="text-white">{selectedPlan?.name || selectedPlanType}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Interest Rate:</span>
                <span className="text-[#D4B139]">{interestRateText}</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Maturity Date:</span>
                <span className="text-white">
                  {selectedPlan
                    ? new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB")
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Maturity Amount:</span>
                <span className="text-white/80 text-sm">Calculated by server</span>
              </div>
            </div>

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Enter Transaction PIN
              </label>
              <input
                type="password"
                maxLength={4}
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 px-4 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                placeholder="••••"
              />
            </div>

            <div className="flex gap-3">
              <CustomButton
                onClick={() => setStep(1)}
                className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/5 py-3 rounded-lg"
              >
                Back
              </CustomButton>
              <CustomButton
                onClick={handleCreate}
                disabled={walletPin.length !== 4 || creating || verifyingPin}
                isLoading={creating || verifyingPin}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
              >
                Create Fixed Deposit
              </CustomButton>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#D4B139]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B139" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Fixed Deposit Created!</h2>
            <p className="text-white/70 mb-6">Your fixed deposit of {formatCurrency(displayPrincipal)} has been successfully created.</p>
            
            <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Principal:</span>
                <span className="text-white">{formatCurrency(displayPrincipal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Plan Type:</span>
                <span className="text-white">{String(displayPlanType || "")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70">Interest Rate:</span>
                <span className="text-[#D4B139]">{displayInterestRate}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white/70">Maturity Date:</span>
                <span className="text-white">{displayMaturityDate}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/70">Maturity Amount:</span>
                <span className="text-white/80 text-sm">Calculated by server</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <CustomButton
                onClick={resetAndClose}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
              >
                View Fixed Deposit
              </CustomButton>
              <CustomButton
                onClick={resetAndClose}
                className="w-full bg-transparent hover:bg-white/5 text-white py-3 rounded-lg font-medium border border-white/10"
              >
                Close
              </CustomButton>
            </div>
          </div>
        )}
      </div>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={amount}
        currentBalance={selectedWalletId ? wallets.find(w => w.id === selectedWalletId)?.balance : ngnWallet?.balance}
      />
    </div>
  );
};

export default FixedDepositModal;
