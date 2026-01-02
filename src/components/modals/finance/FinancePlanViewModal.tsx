"use client";

import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { useGetInvestmentById, usePayoutInvestment } from "@/api/investments/investments.queries";
import {
  useEarlyWithdrawFixedDeposit,
  useGetFixedDepositById,
  usePayoutFixedDeposit,
  useRolloverFixedDeposit,
} from "@/api/fixed-deposits/fixed-deposits.queries";
import { useVerifyWalletPin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";

export interface FinancePlanData {
  name: string;
  amount: number;
  earned: number;
  startDate: string;
  endDate: string;
  interestRate: string;
  duration: string;
  type: "investment" | "fixed_deposit";
  investmentId?: string;
  fixedDepositId?: string;
  status?: "ACTIVE" | "PAID_OUT" | "MATURED";
  agreementReference?: string;
  agreementDocument?: string;
  transactionReference?: string;
}

interface FinancePlanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FinancePlanData | null;
  onRefresh?: () => void;
}

const FinancePlanViewModal: React.FC<FinancePlanViewModalProps> = ({ isOpen, onClose, plan, onRefresh }) => {
  const [walletPin, setWalletPin] = useState("");
  const [showPayoutStep, setShowPayoutStep] = useState(false);
  const [showEarlyWithdrawStep, setShowEarlyWithdrawStep] = useState(false);
  const [showRolloverStep, setShowRolloverStep] = useState(false);
  const [earlyWithdrawReason, setEarlyWithdrawReason] = useState("");
  const [rolloverType, setRolloverType] = useState<"PRINCIPAL_ONLY" | "PRINCIPAL_PLUS_INTEREST">(
    "PRINCIPAL_ONLY"
  );
  const [pendingFixedDepositAction, setPendingFixedDepositAction] = useState<
    null | "payout" | "early_withdrawal" | "rollover"
  >(null);

  // Fetch investment details if it's an investment
  const { investment, isPending: loadingInvestmentDetails } = useGetInvestmentById(
    plan?.type === "investment" && plan?.investmentId ? plan.investmentId : null
  );

  // Fetch fixed deposit details if it's a fixed deposit
  const { fixedDeposit, isPending: loadingFixedDepositDetails } = useGetFixedDepositById(
    plan?.type === "fixed_deposit" && plan?.fixedDepositId ? plan.fixedDepositId : null
  );

  const loadingDetails = loadingInvestmentDetails || loadingFixedDepositDetails;

  // Use fetched data if available, otherwise use plan data
  const displayPlan = investment
    ? {
        ...plan,
        name: `Investment #${investment.id.slice(-8).toUpperCase()}`,
        amount: investment.amount || investment.capitalAmount || plan?.amount || 0,
        earned: investment.interestAmount || 0,
        status: investment.status,
        agreementReference: investment.agreementReference,
        transactionReference: investment.transaction?.transactionRef || investment.transactionId,
        interestRate: investment.roiRate ? `${(investment.roiRate * 100).toFixed(0)}% per annum` : plan?.interestRate || "",
        startDate: investment.startDate ? new Date(investment.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : plan?.startDate || "",
        endDate: investment.maturityDate ? new Date(investment.maturityDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : plan?.endDate || "",
      }
    : fixedDeposit
    ? {
        ...plan,
        name: `Fixed Deposit #${fixedDeposit.id.slice(-8).toUpperCase()}`,
        amount: fixedDeposit.principalAmount ?? plan?.amount ?? 0,
        earned: 0,
        status: fixedDeposit.status,
        interestRate: fixedDeposit.interestRate ? `${(fixedDeposit.interestRate * 100).toFixed(2)}% per annum` : plan?.interestRate || "",
        duration: fixedDeposit.durationMonths ? `${fixedDeposit.durationMonths} ${fixedDeposit.durationMonths === 1 ? 'month' : 'months'}` : plan?.duration || "",
        startDate: fixedDeposit.startDate ? new Date(fixedDeposit.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : plan?.startDate || "",
        endDate: fixedDeposit.maturityDate ? new Date(fixedDeposit.maturityDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-") : plan?.endDate || "",
      }
    : plan;

  const onPayoutError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Failed to process payout"];

    ErrorToast({
      title: "Payout Failed",
      descriptions,
    });
    setShowPayoutStep(false);
    setWalletPin("");
  };

  const onPayoutSuccess = (data: unknown) => {
    const totalPayout = (data as { data?: { data?: { totalPayout?: number } } })?.data?.data?.totalPayout;
    SuccessToast({
      title: "Payout Successful!",
      description: `₦${Number(totalPayout ?? (displayPlan.amount + displayPlan.earned)).toLocaleString()} has been paid to your wallet.`,
    });
    setShowPayoutStep(false);
    setWalletPin("");
    if (onRefresh) onRefresh();
    onClose();
  };

  const { mutate: payoutInvestment, isPending: payingOutInvestment } = usePayoutInvestment(
    onPayoutError,
    onPayoutSuccess
  );

  const { mutate: payoutFixedDeposit, isPending: payingOutFixedDeposit } = usePayoutFixedDeposit(
    onPayoutError,
    onPayoutSuccess
  );

  const { mutate: earlyWithdrawFixedDeposit, isPending: earlyWithdrawingFixedDeposit } =
    useEarlyWithdrawFixedDeposit(onPayoutError, onPayoutSuccess);

  const { mutate: rolloverFixedDeposit, isPending: rollingOverFixedDeposit } =
    useRolloverFixedDeposit(onPayoutError, onPayoutSuccess);

  const onVerifyPinError = (error: unknown) => {
    const errorMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data
      ?.message as unknown;
    const descriptions = Array.isArray(errorMessage)
      ? (errorMessage as string[])
      : [typeof errorMessage === "string" ? errorMessage : "Invalid PIN"];
    ErrorToast({ title: "Verification Failed", descriptions });
    setPendingFixedDepositAction(null);
  };

  const onVerifyPinSuccess = () => {
    if (!plan?.fixedDepositId) return;
    if (pendingFixedDepositAction === "payout") {
      payoutFixedDeposit({ fixedDepositId: plan.fixedDepositId });
    } else if (pendingFixedDepositAction === "early_withdrawal") {
      earlyWithdrawFixedDeposit({
        fixedDepositId: plan.fixedDepositId,
        reason: earlyWithdrawReason.trim(),
      });
    } else if (pendingFixedDepositAction === "rollover") {
      rolloverFixedDeposit({ fixedDepositId: plan.fixedDepositId, rolloverType });
    }
    setPendingFixedDepositAction(null);
  };

  const { mutate: verifyPin, isPending: verifyingPin } = useVerifyWalletPin(
    onVerifyPinError,
    onVerifyPinSuccess
  );

  const payingOut =
    payingOutInvestment ||
    payingOutFixedDeposit ||
    earlyWithdrawingFixedDeposit ||
    rollingOverFixedDeposit ||
    verifyingPin;

  useEffect(() => {
    if (!isOpen) {
      setShowPayoutStep(false);
      setWalletPin("");
      setShowEarlyWithdrawStep(false);
      setShowRolloverStep(false);
      setEarlyWithdrawReason("");
      setRolloverType("PRINCIPAL_ONLY");
      setPendingFixedDepositAction(null);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isMatured = new Date(displayPlan.endDate) <= new Date();
  const canPayout = (
    (displayPlan.type === "investment" && displayPlan.status === "ACTIVE" && isMatured && displayPlan.investmentId) ||
    (displayPlan.type === "fixed_deposit" && (displayPlan.status === "ACTIVE" || displayPlan.status === "MATURED") && isMatured && displayPlan.fixedDepositId)
  );

  const getStatusBadge = () => {
    const status = displayPlan.status || (isMatured ? "PAID_OUT" : "ACTIVE");
    const isPaidOut = status === "PAID_OUT";
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        isPaidOut 
          ? 'bg-emerald-500/10 text-emerald-400' 
          : 'bg-[#D4B139]/10 text-[#D4B139]'
      }`}>
        {isPaidOut ? 'Paid Out' : isMatured ? 'Matured' : 'Active'}
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    SuccessToast({
      title: "Copied!",
      description: "Reference copied to clipboard",
    });
  };

  const handlePayout = () => {
    if (!walletPin || walletPin.length !== 4) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter a valid 4-digit PIN"],
      });
      return;
    }

    if (displayPlan.type === "investment" && displayPlan.investmentId) {
      payoutInvestment({
        investmentId: displayPlan.investmentId,
        formdata: { walletPin },
      });
    } else if (displayPlan.type === "fixed_deposit" && displayPlan.fixedDepositId) {
      setPendingFixedDepositAction("payout");
      verifyPin({ pin: walletPin });
    } else {
      ErrorToast({
        title: "Error",
        descriptions: ["Plan ID is missing"],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-6 z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              <span className="text-xs text-white/50">
                {plan.type === 'investment' ? 'Investment' : 'Fixed Deposit'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <CgClose className="text-xl text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/70">Total Value</span>
                  <span className="text-white font-medium text-lg">{formatCurrency(displayPlan.amount + displayPlan.earned)}</span>
                </div>
                
                <div className="h-px bg-white/10 my-3" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Capital Amount</p>
                    <p className="text-white font-medium">{formatCurrency(displayPlan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Interest Amount</p>
                    <p className="text-emerald-400 font-medium">+{formatCurrency(displayPlan.earned)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Expected Return</p>
                    <p className="text-white font-medium">
                      {investment?.expectedReturn 
                        ? formatCurrency(investment.expectedReturn)
                        : fixedDeposit?.totalPayout
                        ? formatCurrency(fixedDeposit.totalPayout)
                        : formatCurrency(displayPlan.amount + displayPlan.earned)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Interest Rate</p>
                    <p className="text-white font-medium">{displayPlan.interestRate}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">
                  {displayPlan.type === "investment" ? "Investment Details" : "Fixed Deposit Details"}
                </h3>
                
                <div className="space-y-3">
                  {displayPlan.investmentId && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Investment ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{displayPlan.investmentId.slice(-12).toUpperCase()}</span>
                        <button 
                          onClick={() => copyToClipboard(displayPlan.investmentId || "")}
                          className="text-white/50 hover:text-[#D4B139] transition-colors"
                        >
                          <FiCopy className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {displayPlan.agreementReference && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Agreement Reference</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{displayPlan.agreementReference}</span>
                        <button 
                          onClick={() => copyToClipboard(displayPlan.agreementReference || "")}
                          className="text-white/50 hover:text-[#D4B139] transition-colors"
                        >
                          <FiCopy className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}

                  {displayPlan.transactionReference && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Transaction Reference</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{displayPlan.transactionReference}</span>
                        <button 
                          onClick={() => copyToClipboard(displayPlan.transactionReference || "")}
                          className="text-white/50 hover:text-[#D4B139] transition-colors"
                        >
                          <FiCopy className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Start Date</span>
                    <span className="text-white text-sm">{displayPlan.startDate}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Maturity Date</span>
                    <span className="text-white text-sm">{displayPlan.endDate}</span>
                  </div>

                  {displayPlan.fixedDepositId && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Fixed Deposit ID</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{displayPlan.fixedDepositId.slice(-12).toUpperCase()}</span>
                        <button 
                          onClick={() => copyToClipboard(displayPlan.fixedDepositId || "")}
                          className="text-white/50 hover:text-[#D4B139] transition-colors"
                        >
                          <FiCopy className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}

                  {investment?.legalDocumentUrl && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Agreement Document</span>
                      <a
                        href={investment.legalDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#D4B139] hover:underline text-sm flex items-center gap-1"
                      >
                        View Document
                        <FiExternalLink className="text-xs" />
                      </a>
                    </div>
                  )}

                  {investment?.expectedReturn && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Expected Return</span>
                      <span className="text-white text-sm">{formatCurrency(investment.expectedReturn)}</span>
                    </div>
                  )}

                  {fixedDeposit?.totalPayout && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Total Payout</span>
                      <span className="text-white text-sm">{formatCurrency(fixedDeposit.totalPayout)}</span>
                    </div>
                  )}

                  {fixedDeposit?.durationMonths && (
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Duration</span>
                      <span className="text-white text-sm">{fixedDeposit.durationMonths} {fixedDeposit.durationMonths === 1 ? 'month' : 'months'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4B139] mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {displayPlan.type === "investment" ? "Investment Started" : "Fixed Deposit Started"}
                      </p>
                      <p className="text-white/60 text-xs">{displayPlan.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${isMatured ? 'bg-emerald-400' : 'bg-white/30'}`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">Maturity Date</p>
                      <p className="text-white/60 text-xs">{displayPlan.endDate}</p>
                      {isMatured && displayPlan.status === "PAID_OUT" && (
                        <p className="text-emerald-400 text-xs mt-1">✓ Paid Out</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                {showEarlyWithdrawStep ? (
                  <div className="space-y-4">
                    <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Early Withdrawal</h4>
                      <p className="text-white/70 text-sm">
                        Early withdrawals may attract penalties. Final payout is calculated by the server.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs">Reason</label>
                      <textarea
                        className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none resize-none"
                        rows={3}
                        placeholder="e.g. Emergency financial need"
                        value={earlyWithdrawReason}
                        onChange={(e) => setEarlyWithdrawReason(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs">Enter Transaction PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={walletPin}
                        onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                        placeholder="••••"
                      />
                    </div>

                    <div className="flex gap-3">
                      <CustomButton
                        onClick={() => {
                          setShowEarlyWithdrawStep(false);
                          setEarlyWithdrawReason("");
                          setWalletPin("");
                          setPendingFixedDepositAction(null);
                        }}
                        className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          if (!plan?.fixedDepositId) return;
                          if (!earlyWithdrawReason.trim()) {
                            ErrorToast({
                              title: "Validation Error",
                              descriptions: ["Please provide a reason for early withdrawal"],
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
                          setPendingFixedDepositAction("early_withdrawal");
                          verifyPin({ pin: walletPin });
                        }}
                        disabled={payingOut || walletPin.length !== 4 || !earlyWithdrawReason.trim()}
                        isLoading={payingOut}
                        className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                      >
                        Confirm
                      </CustomButton>
                    </div>
                  </div>
                ) : showRolloverStep ? (
                  <div className="space-y-4">
                    <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Rollover Fixed Deposit</h4>
                      <p className="text-white/70 text-sm">
                        Choose how you want to roll over this deposit. The server will create the new deposit.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs">Rollover Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRolloverType("PRINCIPAL_ONLY")}
                          className={`py-2 rounded-lg text-sm border ${
                            rolloverType === "PRINCIPAL_ONLY"
                              ? "bg-[#D4B139] text-black border-transparent"
                              : "bg-transparent text-white border-white/15 hover:bg-white/5"
                          }`}
                        >
                          Principal Only
                        </button>
                        <button
                          type="button"
                          onClick={() => setRolloverType("PRINCIPAL_PLUS_INTEREST")}
                          className={`py-2 rounded-lg text-sm border ${
                            rolloverType === "PRINCIPAL_PLUS_INTEREST"
                              ? "bg-[#D4B139] text-black border-transparent"
                              : "bg-transparent text-white border-white/15 hover:bg-white/5"
                          }`}
                        >
                          Principal + Interest
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs">Enter Transaction PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={walletPin}
                        onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                        placeholder="••••"
                      />
                    </div>

                    <div className="flex gap-3">
                      <CustomButton
                        onClick={() => {
                          setShowRolloverStep(false);
                          setWalletPin("");
                          setPendingFixedDepositAction(null);
                        }}
                        className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          if (!plan?.fixedDepositId) return;
                          if (!walletPin || walletPin.length !== 4) {
                            ErrorToast({
                              title: "Validation Error",
                              descriptions: ["Please enter a valid 4-digit PIN"],
                            });
                            return;
                          }
                          setPendingFixedDepositAction("rollover");
                          verifyPin({ pin: walletPin });
                        }}
                        disabled={payingOut || walletPin.length !== 4}
                        isLoading={payingOut}
                        className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                      >
                        Confirm
                      </CustomButton>
                    </div>
                  </div>
                ) : showPayoutStep ? (
                  <div className="space-y-4">
                    <div className="bg-bg-500 dark:bg-bg-900 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-3">Payout Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/70">Capital Amount:</span>
                          <span className="text-white">{formatCurrency(displayPlan.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Interest Amount:</span>
                          <span className="text-emerald-400">+{formatCurrency(displayPlan.earned)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Total Payout:</span>
                          <span className="text-white font-medium">{formatCurrency(displayPlan.amount + displayPlan.earned)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-white/70 text-xs">Enter Transaction PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={walletPin}
                        onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                        placeholder="••••"
                      />
                    </div>

                    <div className="flex gap-3">
                      <CustomButton
                        onClick={() => {
                          setShowPayoutStep(false);
                          setWalletPin("");
                        }}
                        className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                      >
                        Cancel
                      </CustomButton>
                      <CustomButton
                        onClick={handlePayout}
                        disabled={payingOut || !walletPin || walletPin.length !== 4}
                        isLoading={payingOut}
                        className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                      >
                        Confirm Payout
                      </CustomButton>
                    </div>
                  </div>
                ) : (
                  <>
                    {canPayout && (
                      <CustomButton
                        onClick={() => setShowPayoutStep(true)}
                        className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 rounded-lg font-medium transition-colors mb-3"
                      >
                        Withdraw / Payout
                      </CustomButton>
                    )}

                    {/* Fixed Deposit: Early Withdrawal & Rollover */}
                    {displayPlan.type === "fixed_deposit" && displayPlan.fixedDepositId && displayPlan.status === "ACTIVE" && !isMatured && (
                      <CustomButton
                        onClick={() => setShowEarlyWithdrawStep(true)}
                        className="w-full bg-transparent border border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/5 py-3 rounded-lg font-medium transition-colors mb-3"
                      >
                        Early Withdrawal
                      </CustomButton>
                    )}
                    {displayPlan.type === "fixed_deposit" && displayPlan.fixedDepositId && isMatured && displayPlan.status !== "PAID_OUT" && (
                      <CustomButton
                        onClick={() => setShowRolloverStep(true)}
                        className="w-full bg-transparent border border-white/15 text-white hover:bg-white/5 py-3 rounded-lg font-medium transition-colors mb-3"
                      >
                        Rollover
                      </CustomButton>
                    )}
                    
                    {displayPlan.status === "PAID_OUT" && (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3 rounded-lg font-medium text-center mb-3">
                        {displayPlan.type === "investment" ? "Investment Paid Out" : "Fixed Deposit Paid Out"}
                      </div>
                    )}

                    {!canPayout && displayPlan.status === "ACTIVE" && !isMatured && (
                      <div className="w-full bg-white/5 border border-white/10 text-white/60 py-3 rounded-lg font-medium text-center mb-3">
                        {displayPlan.type === "investment" ? "Investment locked until maturity" : "Fixed Deposit locked until maturity"}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancePlanViewModal;
