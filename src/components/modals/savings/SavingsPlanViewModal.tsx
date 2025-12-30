"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import SavingsDepositModal from "@/components/modals/savings/SavingsDepositModal";
import SavingsWithdrawModal from "@/components/modals/savings/SavingsWithdrawModal";
import BreakPlanModal from "@/components/modals/savings/BreakPlanModal";
import { useGetSavingsPlanById } from "@/api/savings/savings.queries";

import { SavingsPlan } from "@/api/savings/savings.types";

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
  plan?: SavingsPlan;
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
  const [autoSave, setAutoSave] = React.useState(false);

  // Fetch plan details if planId is available
  const { plan: planData, isPending } = useGetSavingsPlanById(plan?.planId || null);
  
  // Use fetched plan data if available, otherwise use passed plan data
  const displayPlan = planData || plan;
  const planId = plan?.planId || planData?.id;

  if (!isOpen || !plan) return null;

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Get transaction history from plan data
  const transactions = displayPlan?.plan?.deposits || [];
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
          <h2 className="text-white text-xs font-medium">{displayPlan?.name || plan.name}</h2>
          {displayPlan?.plan?.isAutoSave && (
            <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-3 h-3 rounded border-white/30 bg-transparent accent-[#D4B139]"
              />
              <span className="text-white/50 text-[10px]">Enable Auto-save</span>
            </label>
          )}
        </div>

        {isPending ? (
          <div className="px-4 pb-3 flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="px-4 pb-3 flex-1 overflow-y-auto">
            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Principal Amount</span>
                <span className="text-white text-xs font-medium">₦{(displayPlan?.plan?.currentAmount || displayPlan?.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-right">
                <span className="text-white/50 text-[10px]">Interest Earned</span>
                <span className="text-emerald-400 text-xs font-medium">+₦{(displayPlan?.plan?.interestEarned || displayPlan?.earned || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 pb-3 mb-3 border-t border-b border-white/10 pt-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Start Date</span>
                <span className="text-white text-[11px]">
                  {displayPlan?.plan?.startDate ? formatDate(displayPlan.plan.startDate) : displayPlan?.startDate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Maturity Date</span>
                <span className="text-white text-[11px]">
                  {displayPlan?.plan?.maturityDate ? formatDate(displayPlan.plan.maturityDate) : displayPlan?.maturityDate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Interest Rate</span>
                <span className="text-white text-[11px]">
                  {displayPlan?.plan?.interestRate ? `${displayPlan.plan.interestRate}% per annum` : displayPlan?.interestRate || "N/A"}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/50 text-[10px]">Days Left</span>
                <span className="text-white text-[11px]">
                  {displayPlan?.plan?.maturityDate 
                    ? (() => {
                        const today = new Date();
                        const maturity = new Date(displayPlan.plan.maturityDate);
                        const diffTime = maturity.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 0 ? `${diffDays} Days` : "Matured";
                      })()
                    : displayPlan?.daysLeft ? `${displayPlan.daysLeft} Days` : "N/A"}
                </span>
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
                        <span className="text-white text-[11px]">{txn.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}</span>
                        <span className="text-white/40 text-[9px]">{formatDate(txn.createdAt)}</span>
                      </div>
                      <span className={`text-[11px] ${txn.type === "DEPOSIT" ? "text-emerald-400" : "text-[#ff6b6b]"}`}>
                        {txn.type === "DEPOSIT" ? "+" : "-"}₦{txn.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-2 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
          <button
            onClick={() => setOpenBreak(true)}
            className="rounded-lg border border-[#ff6b6b] text-[#ff6b6b] py-2.5 text-sm hover:bg-[#ff6b6b]/5 transition-colors"
          >
            Break Plan
          </button>
          <button
            onClick={() => setOpenDeposit(true)}
            className="rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black py-2.5 text-sm font-medium transition-colors"
          >
            Fund Plan
          </button>
        </div>
      </div>

      <SavingsDepositModal isOpen={openDeposit} onClose={()=> setOpenDeposit(false)} planName={displayPlan?.name || plan.name} planId={planId} />
      <SavingsWithdrawModal isOpen={openWithdraw} onClose={()=> setOpenWithdraw(false)} planName={displayPlan?.name || plan.name} planId={planId} />
      <BreakPlanModal 
        isOpen={openBreak} 
        onClose={()=> setOpenBreak(false)} 
        planName={displayPlan?.name || plan.name}
        planId={planId}
        onConfirm={() => {
          // Break plan will be handled by BreakPlanModal
          setOpenBreak(false);
        }}
      />
    </div>
  );
};

export default SavingsPlanViewModal;
