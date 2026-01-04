"use client";

import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useCreateInvestment } from "@/api/investments/investments.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import InsufficientBalanceModal from "./InsufficientBalanceModal";
import useUserStore from "@/store/user.store";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MINIMUM_AMOUNT = 25000000; // ₦25,000,000
const ROI_PERCENTAGE = 15; // 15%
const LOCK_PERIOD_MONTHS = 12; // 12 months

const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const [amount, setAmount] = useState<number>(MINIMUM_AMOUNT);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [agreementReference, setAgreementReference] = useState("");
  const [legalDocumentUrl, setLegalDocumentUrl] = useState("");
  const [legalDocumentFile, setLegalDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const wallets = user?.wallet || [];
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets.length > 0 ? wallets[0].id : null);

  // Get NGN wallet balance
  const ngnWallet = user?.wallet?.find((w) => w.currency?.toUpperCase() === "NGN");
  const currentBalance = ngnWallet?.balance || 0;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setAmount(MINIMUM_AMOUNT);
      setAgreementReference("");
      setLegalDocumentUrl("");
      setLegalDocumentFile(null);
      setTransactionResult(null);
      setShowInsufficientBalanceModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const onCreateError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const errorString = Array.isArray(errorMessage)
      ? errorMessage.join(" ")
      : errorMessage || "Failed to create investment";
    
    // Check if error is about insufficient balance
    if (errorString.toLowerCase().includes("insufficient wallet balance") || 
        errorString.toLowerCase().includes("insufficient balance")) {
      setShowInsufficientBalanceModal(true);
    } else {
      const descriptions = Array.isArray(errorMessage)
        ? errorMessage
        : [errorString];

      ErrorToast({
        title: "Investment Creation Failed",
        descriptions,
      });
    }
  };

  const onCreateSuccess = (data: any) => {
    setTransactionResult(data?.data?.data || data?.data);
    setStep(3);
    SuccessToast({
      title: "Investment Created Successfully!",
      description: `Your investment of ₦${amount.toLocaleString()} has been created successfully.`,
    });
  };

  useEffect(() => {
    // Set default wallet if none selected
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets.length]);

  const { mutate: createInvestment, isPending: creating } = useCreateInvestment(
    onCreateError,
    onCreateSuccess
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value.replace(/[^0-9.]/g, "")) || 0;
    setAmount(value);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleNext = () => {
    if (amount < MINIMUM_AMOUNT) {
      ErrorToast({
        title: "Validation Error",
        descriptions: [`Minimum investment amount is ₦${MINIMUM_AMOUNT.toLocaleString()}`],
      });
      return;
    }
    setStep(2);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF)
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        ErrorToast({
          title: "Invalid File Type",
          descriptions: ["Please upload a PDF file"],
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        ErrorToast({
          title: "File Too Large",
          descriptions: ["Please upload a PDF smaller than 5MB"],
        });
        return;
      }

      setLegalDocumentFile(file);
      // For now, we'll use a placeholder URL. In production, you'd upload the file first
      // and get the URL from the server response
      setLegalDocumentUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setLegalDocumentFile(null);
    setLegalDocumentUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    createInvestment({
      amount,
      currency: "NGN",
      ...(agreementReference && { agreementReference }),
      ...(legalDocumentUrl && { legalDocumentUrl }),
    });
  };

  const resetAndClose = () => {
    setStep(1);
    setAmount(MINIMUM_AMOUNT);
    setAgreementReference("");
    setLegalDocumentUrl("");
    setLegalDocumentFile(null);
    setTransactionResult(null);
    setSelectedWalletId(wallets.length > 0 ? wallets[0].id : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // Calculate ROI and expected return
  const interestAmount = (amount * ROI_PERCENTAGE) / 100;
  const expectedReturn = amount + interestAmount;

  // Use transaction result data if available
  const displayAmount = transactionResult?.amount || amount;
  const displayInterestAmount = transactionResult?.interestAmount || interestAmount;
  const displayExpectedReturn = transactionResult?.expectedReturn || expectedReturn;
  const displayRoiRate = transactionResult?.roiRate ? `${(transactionResult.roiRate * 100).toFixed(0)}%` : `${ROI_PERCENTAGE}%`;
  const displayMaturityDate = transactionResult?.maturityDate 
    ? new Date(transactionResult.maturityDate).toLocaleDateString('en-GB')
    : new Date(new Date().setMonth(new Date().getMonth() + LOCK_PERIOD_MONTHS)).toLocaleDateString('en-GB');

  if (!isOpen) return null;

  return (
    <>
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => setShowInsufficientBalanceModal(false)}
        requiredAmount={amount}
        currentBalance={currentBalance}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-3 sm:p-5 z-10 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        {step === 1 ? (
          <>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Create Investment</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Investment Amount (Minimum ₦{MINIMUM_AMOUNT.toLocaleString()})
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
                {amount < MINIMUM_AMOUNT && (
                  <p className="text-red-400 text-xs mt-1">
                    Minimum investment is ₦{MINIMUM_AMOUNT.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="bg-bg-500 dark:bg-bg-900 p-3 sm:p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">Principal Amount:</span>
                  <span className="text-white font-medium text-sm sm:text-base">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">ROI Rate:</span>
                  <span className="text-[#D4B139] text-sm sm:text-base">{ROI_PERCENTAGE}% per annum</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">Lock Period:</span>
                  <span className="text-white text-sm sm:text-base">{LOCK_PERIOD_MONTHS} months</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">Expected Interest:</span>
                  <span className="text-[#D4B139] font-medium text-sm sm:text-base">+{formatCurrency(interestAmount)}</span>
                </div>
                <div className="h-px bg-white/10 my-2 sm:my-3" />
                <div className="flex justify-between">
                  <span className="text-white/70 text-sm">Expected Return:</span>
                  <span className="text-white font-medium text-sm sm:text-base">{formatCurrency(expectedReturn)}</span>
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

              <CustomButton
                onClick={handleNext}
                disabled={amount < MINIMUM_AMOUNT || !selectedWalletId}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
              >
                Continue
              </CustomButton>
            </div>
          </>
        ) : step === 2 ? (
          <>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Create Investment</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Agreement Reference (Optional)
                </label>
                <input
                  type="text"
                  value={agreementReference}
                  onChange={(e) => setAgreementReference(e.target.value)}
                  placeholder="e.g., INV-2025-001"
                  className="w-full bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Legal Document (Optional)
                </label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {!legalDocumentFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 px-4 text-white/70 hover:text-white hover:border-[#D4B139] transition-colors text-sm"
                    >
                      Upload PDF Document
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 px-4">
                      <span className="text-white text-sm truncate flex-1 mr-2">
                        {legalDocumentFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 text-xs">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <input
                    type="url"
                    value={legalDocumentUrl}
                    onChange={(e) => {
                      setLegalDocumentUrl(e.target.value);
                      if (e.target.value) {
                        setLegalDocumentFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }
                    }}
                    placeholder="https://example.com/agreement.pdf"
                    className="w-full bg-bg-500 dark:bg-bg-1000 border border-border-700 dark:border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent text-sm"
                  />
                </div>
                <p className="text-white/50 text-xs mt-1">
                  Upload a PDF file or provide a URL to the legal document
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <CustomButton
                  onClick={() => setStep(1)}
                  className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/5 py-3 rounded-lg"
                >
                  Back
                </CustomButton>
                <CustomButton
                  onClick={handleSubmit}
                  disabled={creating}
                  isLoading={creating}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
                >
                  Create Investment
                </CustomButton>
              </div>
            </div>
          </>
        ) : step === 3 ? (
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#D4B139]/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg width="24" height="24" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="#D4B139" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Investment Created!</h2>
            <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">Your investment of {formatCurrency(displayAmount)} has been successfully created.</p>
            
            <div className="bg-bg-500 dark:bg-bg-900 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-sm">Principal:</span>
                <span className="text-white text-sm sm:text-base">{formatCurrency(displayAmount)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-sm">ROI Rate:</span>
                <span className="text-[#D4B139] text-sm sm:text-base">{displayRoiRate} per annum</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-white/70 text-sm">Lock Period:</span>
                <span className="text-white text-sm sm:text-base">{LOCK_PERIOD_MONTHS} months</span>
              </div>
              {transactionResult?.transactionId && (
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">Transaction ID:</span>
                  <span className="text-white font-mono text-xs break-all text-right ml-2">{transactionResult.transactionId}</span>
                </div>
              )}
              {transactionResult?.agreementReference && (
                <div className="flex justify-between mb-2">
                  <span className="text-white/70 text-sm">Agreement Ref:</span>
                  <span className="text-white font-mono text-xs break-all text-right ml-2">{transactionResult.agreementReference}</span>
                </div>
              )}
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white/70 text-sm">Maturity Date:</span>
                <span className="text-white text-sm sm:text-base">{displayMaturityDate}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/70 text-sm">Expected Return:</span>
                <span className="text-white font-medium text-sm sm:text-base">{formatCurrency(displayExpectedReturn)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <CustomButton
                onClick={resetAndClose}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium"
              >
                View Investment
              </CustomButton>
              <CustomButton
                onClick={resetAndClose}
                className="w-full bg-transparent hover:bg-white/5 text-white py-3 rounded-lg font-medium border border-white/10"
              >
                Close
              </CustomButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
    </>
  );
};

export default InvestmentModal;
