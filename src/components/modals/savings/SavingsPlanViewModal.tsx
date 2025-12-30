"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import SavingsDepositModal from "@/components/modals/savings/SavingsDepositModal";
import SavingsWithdrawModal from "@/components/modals/savings/SavingsWithdrawModal";
import BreakPlanModal from "@/components/modals/savings/BreakPlanModal";
import { useGetSavingsPlanById } from "@/api/savings/savings.queries";
import { useGetEasyLifePlanById } from "@/api/easylife-savings/easylife-savings.queries";

import { SavingsPlan } from "@/api/savings/savings.types";
import type { EasyLifePlan } from "@/api/easylife-savings/easylife-savings.types";

export interface SavingsPlanData {
  name: string;
  amount: number;
  earned?: number;
  startDate?: string;
  maturityDate?: string;
  interestRate?: string;
  daysLeft?: number;
  target?: number;
  due?: string;
  type: "fixed" | "target" | "easylife";
  planId?: string;
  plan?: SavingsPlan | EasyLifePlan;
}

interface SavingsPlanViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SavingsPlanData | null;
}

const SavingsPlanViewModal: React.FC<SavingsPlanViewModalProps> = ({ isOpen, onClose, plan }) => {
  const [openDeposit, setOpenDeposit] = React.useState(false);
  const [openWithdraw, setOpenWithdraw] = React.useState(false);
  const [openBreak, setOpenBreak] = React.useState(false);

  // Fetch plan details if planId is available
  const { plan: savingsPlanData, isPending: savingsPending } = useGetSavingsPlanById(
    plan?.type === "target" ? plan?.planId || null : null
  );
  const { plan: easyLifePlanData, isPending: easyLifePending } = useGetEasyLifePlanById(
    plan?.type === "easylife" ? plan?.planId || null : null
  );
  const isPending = savingsPending || easyLifePending;
  
  // Use fetched plan data if available, otherwise use passed plan data
  // planData is the direct SavingsPlan object from API
  // plan.plan is the SavingsPlan object passed from parent
  const passedPlan = plan?.plan || undefined;
  const actualPlan: SavingsPlan | EasyLifePlan | null = savingsPlanData || easyLifePlanData || passedPlan || null;
  const planId = plan?.planId || savingsPlanData?.id || easyLifePlanData?.id || passedPlan?.id;

  if (!isOpen || !plan) return null;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Get transaction history from plan data
  const transactions = (actualPlan?.deposits || []) as Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const lockedUntil = actualPlan?.lockedUntil ? new Date(actualPlan.lockedUntil) : null;
  const maturityDate = actualPlan?.maturityDate ? new Date(actualPlan.maturityDate) : null;
  const now = new Date();
  const isLocked = lockedUntil ? now < lockedUntil : false;
  const isEarly = maturityDate ? now < maturityDate : false;
  const earlyWithdrawalEnabled =
    plan.type === "easylife" && actualPlan && "earlyWithdrawalEnabled" in actualPlan
      ? !!(actualPlan as EasyLifePlan).earlyWithdrawalEnabled
      : true;
  const canBreak = plan.type !== "fixed" && isEarly && earlyWithdrawalEnabled;
  const canWithdraw = plan.type !== "fixed" && !isLocked;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-md max-h-[92vh] rounded-2xl flex flex-col overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors z-10">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-4 pt-1 pb-2">
          <h2 className="text-white text-xs font-medium">{actualPlan?.name || plan?.name || "Savings Plan"}</h2>
          {typeof actualPlan?.autoDebitEnabled === "boolean" && (
            <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={!!actualPlan?.autoDebitEnabled}
                onChange={() => null}
                disabled
                className="w-3 h-3 rounded border-white/30 bg-transparent accent-[#D4B139]"
              />
              <span className="text-white/50 text-[10px]">Auto-save</span>
            </label>
          )}
        </div>

        {isPending ? (
          <div className="px-4 pb-3 flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="px-4 pb-3 flex-1 overflow-y-auto">
            {/* Plan Type & Status */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                actualPlan?.type === "FLEX_SAVE" 
                  ? "bg-blue-500/20 text-blue-400" 
                  : "bg-purple-500/20 text-purple-400"
              }`}>
                {actualPlan?.type === "FLEX_SAVE" ? "Flex Save" : actualPlan?.type === "NATTY_AUTO_SAVE" ? "Natty Auto Save" : "Savings Plan"}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                actualPlan?.status === "ACTIVE" 
                  ? "bg-emerald-500/20 text-emerald-400"
                  : actualPlan?.status === "COMPLETED"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {actualPlan?.status || "ACTIVE"}
              </span>
            </div>

            {/* Description */}
            {actualPlan?.description && (
              <div className="mb-3">
                <p className="text-white/60 text-[10px] mb-1">Description</p>
                <p className="text-white text-[11px]">{actualPlan.description}</p>
              </div>
            )}

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Total Deposited</span>
                <span className="text-white text-xs font-medium">₦{(actualPlan?.totalDeposited ?? actualPlan?.currentAmount ?? plan?.amount ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-right">
                <span className="text-white/50 text-[10px]">Interest Earned</span>
                <span className="text-emerald-400 text-xs font-medium">+₦{(actualPlan?.totalInterestAccrued ?? actualPlan?.interestEarned ?? plan?.earned ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Goal Amount & Progress */}
            {actualPlan?.goalAmount && (
              <div className="mb-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-[10px]">Goal Amount</span>
                  <span className="text-white text-[11px] font-medium">₦{actualPlan.goalAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                  <div 
                    className="bg-[#D4B139] h-1.5 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, ((actualPlan?.totalDeposited ?? actualPlan?.currentAmount ?? 0) / actualPlan.goalAmount) * 100)}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] text-white/40">
                  <span>₦{(actualPlan?.totalDeposited ?? actualPlan?.currentAmount ?? 0).toLocaleString()} saved</span>
                  <span>{Math.round(((actualPlan?.totalDeposited ?? actualPlan?.currentAmount ?? 0) / actualPlan.goalAmount) * 100)}%</span>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pb-3 mb-3 border-t border-b border-white/10 pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Currency</span>
                <span className="text-white text-[11px]">{actualPlan?.currency || "NGN"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Duration</span>
                <span className="text-white text-[11px]">{actualPlan?.durationMonths || actualPlan?.duration || "N/A"} {actualPlan?.durationMonths ? "Months" : ""}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Start Date</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.startDate ? formatDate(actualPlan.startDate) : plan?.startDate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Maturity Date</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.maturityDate ? formatDate(actualPlan.maturityDate) : plan?.maturityDate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Locked Until</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.lockedUntil ? formatDate(actualPlan.lockedUntil) : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Days Left</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.maturityDate 
                    ? (() => {
                        const today = new Date();
                        const maturity = new Date(actualPlan.maturityDate);
                        const diffTime = maturity.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 0 ? `${diffDays} Days` : "Matured";
                      })()
                    : plan?.daysLeft ? `${plan.daysLeft} Days` : "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Interest Rate</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.interestRate !== undefined 
                    ? `${(actualPlan.interestRate * 100).toFixed(2)}% per annum` 
                    : plan?.interestRate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Penalty Rate</span>
                <span className="text-white text-[11px]">
                  {actualPlan?.penaltyRate !== undefined 
                    ? `${(actualPlan.penaltyRate * 100).toFixed(1)}%` 
                    : "N/A"}
                </span>
              </div>
              {actualPlan?.minMonthlyDeposit && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/50 text-[10px]">Min Monthly Deposit</span>
                  <span className="text-white text-[11px]">₦{actualPlan.minMonthlyDeposit.toLocaleString()}</span>
                </div>
              )}
              {actualPlan?.lastDepositDate && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/50 text-[10px]">Last Deposit</span>
                  <span className="text-white text-[11px]">{formatDate(actualPlan.lastDepositDate)}</span>
                </div>
              )}
            </div>

            {/* Auto Debit Settings */}
            {actualPlan?.autoDebitEnabled !== undefined && (
              <div className="mb-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-[10px]">Auto Debit</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    actualPlan.autoDebitEnabled 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-white/10 text-white/50"
                  }`}>
                    {actualPlan.autoDebitEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                {actualPlan.autoDebitEnabled && actualPlan.autoDebitChargeDay && (
                  <div className="text-white/60 text-[10px]">
                    Charges on day {actualPlan.autoDebitChargeDay} of each month
                  </div>
                )}
              </div>
            )}

            {/* Plan Info */}
            <div className="mb-3 p-2.5 bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/50">Plan ID</span>
                  <span className="text-white/70 font-mono text-[9px] truncate">{actualPlan?.id || planId || "N/A"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-white/50">Created</span>
                  <span className="text-white/70 text-[9px]">
                    {actualPlan?.createdAt ? formatDate(actualPlan.createdAt) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="mb-2">
              <h3 className="text-white text-[11px] font-medium mb-2.5">Transaction History</h3>
              {sortedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-white/10 rounded-lg">
                  <p className="text-white/40 text-[10px]">No transactions yet</p>
                </div>
              ) : (
                <div className="flex flex-col border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {sortedTransactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2.5 px-3 border-b border-white/10 last:border-0">
                      <div className="flex flex-col">
                        <span className="text-white text-[11px]">Deposit</span>
                        <span className="text-white/40 text-[9px]">{formatDate(txn.createdAt)}</span>
                      </div>
                      <span className="text-[11px] text-emerald-400">
                        +₦{Number(txn.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {plan.type !== "fixed" && (
          <div className="px-4 pb-2 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            <button
              onClick={() => setOpenBreak(true)}
              disabled={!canBreak}
              className="rounded-lg border border-[#ff6b6b] text-[#ff6b6b] py-2.5 text-sm hover:bg-[#ff6b6b]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Break
            </button>
            <button
              onClick={() => setOpenDeposit(true)}
              className="rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black py-2.5 text-sm font-medium transition-colors"
            >
              Fund
            </button>
            <button
              onClick={() => setOpenWithdraw(true)}
              disabled={!canWithdraw}
              className="rounded-lg border border-white/15 text-white py-2.5 text-sm hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
          </div>
        )}
      </div>

      <SavingsDepositModal
        isOpen={openDeposit}
        onClose={()=> setOpenDeposit(false)}
        planName={actualPlan?.name || plan?.name || "Savings Plan"}
        planId={planId}
        planType={plan.type === "easylife" ? "easylife" : "target"}
      />
      <SavingsWithdrawModal
        isOpen={openWithdraw}
        onClose={()=> setOpenWithdraw(false)}
        planName={actualPlan?.name || plan?.name || "Savings Plan"}
        planId={planId}
        planType={plan.type === "easylife" ? "easylife" : "target"}
      />
      <BreakPlanModal 
        isOpen={openBreak} 
        onClose={()=> setOpenBreak(false)} 
        planName={actualPlan?.name || plan?.name || "Savings Plan"}
        planId={planId}
        planType={plan.type === "easylife" ? "easylife" : "target"}
        onConfirm={() => {
          // Break plan will be handled by BreakPlanModal
          setOpenBreak(false);
        }}
      />
    </div>
  );
};

export default SavingsPlanViewModal;
