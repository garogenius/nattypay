"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import {
  useGetBettingPlatforms,
  useGetBettingWallet,
  useFundBettingWallet,
  useFundBettingPlatform,
  useWithdrawBettingWallet,
  useGetBettingWalletTransactions,
} from "@/api/betting/betting.queries";
import { useGetAllBanks, useVerifyAccount } from "@/api/wallet/wallet.queries";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";
import { useTransactionProcessingStore } from "@/store/transactionProcessing.store";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActionType = "fund-wallet" | "fund-platform" | "withdraw" | "transactions";

const BettingModal: React.FC<BettingModalProps> = ({ isOpen, onClose }) => {
  const [action, setAction] = useState<ActionType>("fund-wallet");
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  
  // Fund Wallet
  const [fundWalletAmount, setFundWalletAmount] = useState<string>("");
  const [fundWalletPin, setFundWalletPin] = useState<string>("");
  
  // Fund Platform
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<{code: string; name: string} | null>(null);
  const [platformUserId, setPlatformUserId] = useState<string>("");
  const [fundPlatformAmount, setFundPlatformAmount] = useState<string>("");
  const [fundPlatformPin, setFundPlatformPin] = useState<string>("");
  
  // Withdraw
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<{name: string; bankCode: string} | null>(null);
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState<string>("");
  const [withdrawAccountName, setWithdrawAccountName] = useState<string>("");
  const [withdrawSessionId, setWithdrawSessionId] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawPin, setWithdrawPin] = useState<string>("");
  
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const { showProcessing, showSuccess, showError } = useTransactionProcessingStore();

  const platformRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(platformRef, () => setPlatformOpen(false));
  useOnClickOutside(bankRef, () => setBankOpen(false));

  // Fetch betting wallet
  const { data: walletData, isLoading: walletLoading } = useGetBettingWallet();
  const bettingWallet = walletData?.data?.data;

  // Fetch platforms
  const { data: platformsData, isLoading: platformsLoading, isError: platformsError } = useGetBettingPlatforms();
  const platforms = Array.isArray(platformsData?.data?.data) ? platformsData.data.data : [];

  // Fetch banks
  const { banks } = useGetAllBanks();

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useGetBettingWalletTransactions({
    limit: 10,
  });
  const transactions = transactionsData?.data?.data || [];

  // Account verification for withdrawal
  const onVerifyAccountError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Account Verification Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
    setWithdrawAccountName("");
    setWithdrawSessionId("");
  };

  const onVerifyAccountSuccess = (data: any) => {
    const d = data?.data?.data;
    setWithdrawAccountName(d?.accountName || "");
    setWithdrawSessionId(d?.sessionId || "");
  };

  const { mutate: verifyAccount } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  useEffect(() => {
    if (selectedBank && withdrawAccountNumber.length === 10) {
      verifyAccount({
        bankCode: selectedBank.bankCode,
        accountNumber: withdrawAccountNumber,
      });
    }
  }, [selectedBank, withdrawAccountNumber, verifyAccount]);

  const handleClose = () => {
    setAction("fund-wallet");
    setStep("form");
    setFundWalletAmount("");
    setFundWalletPin("");
    setSelectedPlatform(null);
    setPlatformUserId("");
    setFundPlatformAmount("");
    setFundPlatformPin("");
    setSelectedBank(null);
    setWithdrawAccountNumber("");
    setWithdrawAccountName("");
    setWithdrawSessionId("");
    setWithdrawAmount("");
    setWithdrawPin("");
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

  // Fund Wallet Handlers
  const onFundWalletSuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Wallet Funded Successfully",
      description: `₦${fundWalletAmount} has been transferred to your betting wallet`,
    });
    showSuccess({ title: "Successful", message: "Betting wallet funded successfully." });
  };

  const onFundWalletError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Funding Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
    showError({
      title: "Transaction Failed",
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || "Funding failed.",
    });
  };

  const { mutate: fundWallet, isPending: fundingWallet } = useFundBettingWallet(
    onFundWalletError,
    onFundWalletSuccess
  );

  const handleFundWallet = () => {
    if (fundWalletPin.length !== 4 || !fundWalletAmount || Number(fundWalletAmount) < 100) return;
    showProcessing({ title: "Processing", message: "Funding betting wallet..." });
    fundWallet({
      amount: Number(fundWalletAmount),
      currency: "NGN",
      walletPin: fundWalletPin,
      description: "Funding betting wallet",
    });
  };

  // Fund Platform Handlers
  const onFundPlatformSuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Platform Funded Successfully",
      description: `₦${fundPlatformAmount} has been sent to ${selectedPlatform?.name}`,
    });
    showSuccess({ title: "Successful", message: "Betting platform funded successfully." });
  };

  const onFundPlatformError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Funding Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
    showError({
      title: "Transaction Failed",
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || "Funding failed.",
    });
  };

  const { mutate: fundPlatform, isPending: fundingPlatform } = useFundBettingPlatform(
    onFundPlatformError,
    onFundPlatformSuccess
  );

  const handleFundPlatform = () => {
    if (fundPlatformPin.length !== 4 || !selectedPlatform || !platformUserId || !fundPlatformAmount || Number(fundPlatformAmount) < 100) return;
    showProcessing({ title: "Processing", message: "Funding platform..." });
    fundPlatform({
      platform: selectedPlatform.code,
      platformUserId: platformUserId,
      amount: Number(fundPlatformAmount),
      currency: "NGN",
      walletPin: fundPlatformPin,
      description: `Funding ${selectedPlatform.name} account`,
    });
  };

  // Withdraw Handlers
  const onWithdrawSuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Withdrawal Successful",
      description: `₦${withdrawAmount} has been sent to ${withdrawAccountName}`,
    });
    showSuccess({ title: "Successful", message: "Withdrawal completed successfully." });
  };

  const onWithdrawError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Withdrawal Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
    showError({
      title: "Transaction Failed",
      message: Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || "Withdrawal failed.",
    });
  };

  const { mutate: withdraw, isPending: withdrawing } = useWithdrawBettingWallet(
    onWithdrawError,
    onWithdrawSuccess
  );

  const handleWithdraw = () => {
    if (withdrawPin.length !== 4 || !selectedBank || !withdrawAccountNumber || !withdrawAccountName || !withdrawAmount || Number(withdrawAmount) < 100) return;
    showProcessing({ title: "Processing", message: "Processing withdrawal..." });
    withdraw({
      amount: Number(withdrawAmount),
      currency: "NGN",
      bankCode: selectedBank.bankCode,
      accountNumber: withdrawAccountNumber,
      accountName: withdrawAccountName,
      walletPin: withdrawPin,
      description: "Withdrawal from betting wallet",
    });
  };

  // Validation
  const canFundWallet = fundWalletAmount && Number(fundWalletAmount) >= 100 && fundWalletPin.length === 4;
  const canFundPlatform = selectedPlatform && platformUserId && fundPlatformAmount && Number(fundPlatformAmount) >= 100 && fundPlatformPin.length === 4;
  const canWithdraw = selectedBank && withdrawAccountNumber.length === 10 && withdrawAccountName && withdrawAmount && Number(withdrawAmount) >= 100 && withdrawPin.length === 4;

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-start md:items-center w-full md:inset-0 h-[100dvh] py-4 md:py-0">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-hidden max-h-[calc(100dvh-2rem)] md:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2 flex-shrink-0">
          <div>
            <h2 className="text-white text-lg font-semibold">Betting</h2>
            <p className="text-white/60 text-sm">
              {step === "form" ? "Manage your betting wallet" : step === "confirm" ? "Confirm Transaction" : "Transaction Result"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        {/* Betting Wallet Balance */}
        {step === "form" && (
          <div className="px-4 pb-6 md:pb-4 overflow-y-auto flex-1 min-h-0">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <p className="text-white/60 text-xs mb-1">Betting Wallet Balance</p>
              {walletLoading ? (
                <div className="flex items-center gap-2">
                  <SpinnerLoader width={16} height={16} color="#D4B139" />
                  <span className="text-white/70 text-sm">Loading...</span>
                </div>
              ) : (
                <p className="text-white text-2xl font-semibold">
                  ₦{bettingWallet?.balance?.toLocaleString() || "0.00"}
                </p>
              )}
            </div>

            {/* Action Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setAction("fund-wallet")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  action === "fund-wallet"
                    ? "bg-[#D4B139] text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Fund Wallet
              </button>
              <button
                onClick={() => setAction("fund-platform")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  action === "fund-platform"
                    ? "bg-[#D4B139] text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Fund Platform
              </button>
              <button
                onClick={() => setAction("withdraw")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  action === "withdraw"
                    ? "bg-[#D4B139] text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Withdraw
              </button>
              <button
                onClick={() => setAction("transactions")}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  action === "transactions"
                    ? "bg-[#D4B139] text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Transactions
              </button>
            </div>

            {/* Fund Wallet Form */}
            {action === "fund-wallet" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Minimum ₦100"
                    type="number"
                    min="100"
                    value={fundWalletAmount}
                    onChange={(e) => setFundWalletAmount(e.target.value)}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                  <p className="text-white/50 text-xs">Minimum amount: ₦100</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Wallet PIN</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter 4-digit PIN"
                    type="password"
                    maxLength={4}
                    value={fundWalletPin}
                    onChange={(e) => setFundWalletPin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                </div>

                <CustomButton
                  onClick={() => setStep("confirm")}
                  disabled={!canFundWallet}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Continue
                </CustomButton>
              </div>
            )}

            {/* Fund Platform Form */}
            {action === "fund-platform" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2" ref={platformRef}>
                  <label className="text-white/70 text-sm">Platform</label>
                  <div
                    onClick={() => setPlatformOpen(!platformOpen)}
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                  >
                    <span className={selectedPlatform ? "text-white" : "text-white/50"}>
                      {selectedPlatform?.name || "Select platform"}
                    </span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {platformOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {platformsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <SpinnerLoader width={20} height={20} color="#D4B139" />
                            <span className="text-white/70 text-sm ml-2">Loading platforms...</span>
                          </div>
                        ) : platformsError ? (
                          <div className="px-4 py-3 text-red-400 text-sm">Failed to load platforms. Please try again.</div>
                        ) : platforms.length === 0 ? (
                          <div className="px-4 py-3 text-white/50 text-sm">No platforms available</div>
                        ) : (
                          platforms.map((platform: any) => (
                            <button
                              key={platform.code}
                              onClick={() => {
                                setSelectedPlatform({ code: platform.code, name: platform.name });
                                setPlatformOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm"
                            >
                              {platform.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Platform User ID</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter your platform user ID"
                    value={platformUserId}
                    onChange={(e) => setPlatformUserId(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Minimum ₦100"
                    type="number"
                    min="100"
                    value={fundPlatformAmount}
                    onChange={(e) => setFundPlatformAmount(e.target.value)}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                  <p className="text-white/50 text-xs">Minimum amount: ₦100</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Wallet PIN</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter 4-digit PIN"
                    type="password"
                    maxLength={4}
                    value={fundPlatformPin}
                    onChange={(e) => setFundPlatformPin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                </div>

                <CustomButton
                  onClick={() => setStep("confirm")}
                  disabled={!canFundPlatform}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Continue
                </CustomButton>
              </div>
            )}

            {/* Withdraw Form */}
            {action === "withdraw" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2" ref={bankRef}>
                  <label className="text-white/70 text-sm">Bank</label>
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
                    <label className="text-white/70 text-sm">Account Number</label>
                    <input
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                      placeholder="Enter 10-digit account number"
                      type="text"
                      maxLength={10}
                      value={withdrawAccountNumber}
                      onChange={(e) => setWithdrawAccountNumber(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                    />
                    {withdrawAccountName && (
                      <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
                        <p className="text-green-400 text-sm font-medium">{withdrawAccountName}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Minimum ₦100"
                    type="number"
                    min="100"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                  <p className="text-white/50 text-xs">Minimum amount: ₦100</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Wallet PIN</label>
                  <input
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                    placeholder="Enter 4-digit PIN"
                    type="password"
                    maxLength={4}
                    value={withdrawPin}
                    onChange={(e) => setWithdrawPin(e.target.value.replace(/\D/g, ""))}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />
                </div>

                <CustomButton
                  onClick={() => setStep("confirm")}
                  disabled={!canWithdraw}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Continue
                </CustomButton>
              </div>
            )}

            {/* Transactions View */}
            {action === "transactions" && (
              <div className="flex flex-col gap-3">
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerLoader width={24} height={24} color="#D4B139" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/60 text-sm">No transactions found</p>
                  </div>
                ) : (
                  transactions.map((txn: any) => (
                    <div key={txn.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium text-sm">{txn.operationType}</p>
                        <p className={`text-sm font-semibold ${
                          txn.status === "SUCCESS" ? "text-green-400" : 
                          txn.status === "FAILED" ? "text-red-400" : 
                          "text-yellow-400"
                        }`}>
                          {txn.status}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-white/70 text-xs">₦{txn.amount?.toLocaleString()}</p>
                        <p className="text-white/50 text-xs">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <div className="px-4 pb-6 md:pb-4 overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Transaction Details</h3>
                {action === "fund-wallet" && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Amount</span>
                      <span className="text-white font-medium">₦{Number(fundWalletAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">From</span>
                      <span className="text-white">Main Wallet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">To</span>
                      <span className="text-white">Betting Wallet</span>
                    </div>
                  </div>
                )}
                {action === "fund-platform" && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Platform</span>
                      <span className="text-white font-medium">{selectedPlatform?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">User ID</span>
                      <span className="text-white">{platformUserId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Amount</span>
                      <span className="text-white font-medium">₦{Number(fundPlatformAmount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {action === "withdraw" && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">Bank</span>
                      <span className="text-white font-medium">{selectedBank?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Account Number</span>
                      <span className="text-white">{withdrawAccountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Account Name</span>
                      <span className="text-white">{withdrawAccountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Amount</span>
                      <span className="text-white font-medium">₦{Number(withdrawAmount).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Enter PIN to confirm</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  type="password"
                  maxLength={4}
                  value={
                    action === "fund-wallet" ? fundWalletPin :
                    action === "fund-platform" ? fundPlatformPin :
                    withdrawPin
                  }
                  onChange={(e) => {
                    const pin = e.target.value.replace(/\D/g, "");
                    if (action === "fund-wallet") setFundWalletPin(pin);
                    else if (action === "fund-platform") setFundPlatformPin(pin);
                    else setWithdrawPin(pin);
                  }}
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
                  onClick={() => {
                    if (action === "fund-wallet") handleFundWallet();
                    else if (action === "fund-platform") handleFundPlatform();
                    else handleWithdraw();
                  }}
                  disabled={
                    action === "fund-wallet" ? fundWalletPin.length !== 4 || fundingWallet :
                    action === "fund-platform" ? fundPlatformPin.length !== 4 || fundingPlatform :
                    withdrawPin.length !== 4 || withdrawing
                  }
                  isLoading={
                    action === "fund-wallet" ? fundingWallet :
                    action === "fund-platform" ? fundingPlatform :
                    withdrawing
                  }
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3"
                >
                  Confirm
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && (
          <div className="px-4 pb-6 md:pb-4 overflow-y-auto flex-1 min-h-0">
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                resultSuccess ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {resultSuccess ? (
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-1 ${
                  resultSuccess ? "text-green-400" : "text-red-400"
                }`}>
                  {resultSuccess ? "Transaction Successful" : "Transaction Failed"}
                </h3>
                {transactionData && resultSuccess && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-left">
                    <p className="text-white/70 text-xs mb-1">Transaction Reference</p>
                    <p className="text-white text-sm font-mono">{transactionData?.transactionRef || transactionData?.transaction?.transactionRef}</p>
                  </div>
                )}
              </div>
              <CustomButton
                onClick={handleClose}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Close
              </CustomButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingModal;


