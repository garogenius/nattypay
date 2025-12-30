"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { useWithdrawBettingWallet } from "@/api/betting/betting.queries";
import { useGetAllBanks, useVerifyAccount } from "@/api/wallet/wallet.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<{name: string; bankCode: string} | null>(null);
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const bankRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bankRef, () => setBankOpen(false));

  const { banks } = useGetAllBanks();

  const onVerifyAccountError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Account Verification Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
    setAccountName("");
    setSessionId("");
  };

  const onVerifyAccountSuccess = (data: any) => {
    const d = data?.data?.data;
    setAccountName(d?.accountName || "");
    setSessionId(d?.sessionId || "");
  };

  const { mutate: verifyAccount } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  useEffect(() => {
    if (selectedBank && accountNumber.length === 10) {
      verifyAccount({
        bankCode: selectedBank.bankCode,
        accountNumber: accountNumber,
      });
    }
  }, [selectedBank, accountNumber, verifyAccount]);

  const onSuccessHandler = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Withdrawal Successful",
      description: `₦${amount} has been sent to ${accountName}`,
    });
    if (onSuccess) onSuccess();
  };

  const onErrorHandler = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Withdrawal Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: withdraw, isPending: withdrawing } = useWithdrawBettingWallet(
    onErrorHandler,
    onSuccessHandler
  );

  const handleClose = () => {
    setStep("form");
    setBankOpen(false);
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setSessionId("");
    setAmount("");
    setWalletPin("");
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedBank || !accountNumber || !accountName || !amount || Number(amount) < 100) return;
    withdraw({
      amount: Number(amount),
      currency: "NGN",
      bankCode: selectedBank.bankCode,
      accountNumber: accountNumber,
      accountName: accountName,
      walletPin,
      description: "Withdrawal from betting wallet",
    });
  };

  const canProceed = selectedBank && accountNumber.length === 10 && accountName && amount && Number(amount) >= 100 && walletPin.length === 4;

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">Withdraw Funds</h2>
            <p className="text-white/60 text-sm">Transfer money from betting wallet to bank</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2" ref={bankRef}>
                <label className="text-white/70 text-sm font-medium">Bank</label>
                <div
                  onClick={() => setBankOpen(!bankOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedBank ? "text-white" : "text-white/50"}>
                    {selectedBank?.name || "Select bank"}
                  </span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
                </div>
                {bankOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      <SearchableDropdown
                        items={banks}
                        searchKey="name"
                        displayFormat={(bank: any) => (
                          <div className="flex flex-col text-white/90">
                            <p className="text-sm font-medium">{bank.name}</p>
                          </div>
                        )}
                        onSelect={(bank: any) => {
                          setSelectedBank({ name: bank.name, bankCode: String(bank.bankCode) });
                          setBankOpen(false);
                        }}
                        placeholder="Search bank..."
                        isOpen={bankOpen}
                        onClose={() => setBankOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {selectedBank && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm font-medium">Account Number</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter 10-digit account number"
                    type="text"
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                  {accountName && (
                    <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                      <p className="text-green-400 text-sm font-medium">{accountName}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Amount</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Minimum ₦100"
                  type="number"
                  min="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                />
                <p className="text-white/50 text-xs">Minimum amount: ₦100</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Wallet PIN</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Enter 4-digit PIN"
                  type="password"
                  maxLength={4}
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                />
              </div>

              <CustomButton
                onClick={() => setStep("confirm")}
                disabled={!canProceed}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg mt-2"
              >
                Continue
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Bank</span>
                    <span className="text-white font-medium">{selectedBank?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Account Number</span>
                    <span className="text-white">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Account Name</span>
                    <span className="text-white">{accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Amount</span>
                    <span className="text-white font-medium">₦{Number(amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Enter PIN to confirm</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  type="password"
                  maxLength={4}
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <CustomButton
                  onClick={() => setStep("form")}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-3"
                >
                  Back
                </CustomButton>
                <CustomButton
                  onClick={handleConfirm}
                  disabled={walletPin.length !== 4 || withdrawing}
                  isLoading={withdrawing}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3"
                >
                  Confirm
                </CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                resultSuccess ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {resultSuccess ? (
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 ${
                  resultSuccess ? "text-green-400" : "text-red-400"
                }`}>
                  {resultSuccess ? "Transaction Successful" : "Transaction Failed"}
                </h3>
                {transactionData && resultSuccess && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4 text-left w-full">
                    <p className="text-white/70 text-xs mb-1">Transaction Reference</p>
                    <p className="text-white text-sm font-mono">{transactionData?.transactionRef || transactionData?.transaction?.transactionRef || "N/A"}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <CustomButton
                  onClick={handleClose}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-3"
                >
                  Close
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModal;







