"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import StartNewPlanModal from "@/components/modals/StartNewPlanModal";
import TargetSavingsModal from "@/components/modals/savings/TargetSavingsModal";
import FixedDepositModal from "@/components/modals/finance/FixedDepositModal";
import EasyLifeSavingsModal from "@/components/modals/savings/EasyLifeSavingsModal";
import SavingsPlanCard from "@/components/user/savings/SavingsPlanCard";
import SavingsPlanViewModal, { SavingsPlanData } from "@/components/modals/savings/SavingsPlanViewModal";
import BreakPlanModal from "@/components/modals/savings/BreakPlanModal";
import { useGetSavingsPlans } from "@/api/savings/savings.queries";
import { SavingsPlan, SavingsPlanStatus } from "@/api/savings/savings.types";
import { useGetEasyLifePlans } from "@/api/easylife-savings/easylife-savings.queries";
import type { EasyLifePlan, EasyLifePlanStatus } from "@/api/easylife-savings/easylife-savings.types";
import { useGetFixedDeposits } from "@/api/fixed-deposits/fixed-deposits.queries";
import type { FixedDeposit, FixedDepositStatus } from "@/api/fixed-deposits/fixed-deposits.types";
import FinancePlanViewModal, { FinancePlanData } from "@/components/modals/finance/FinancePlanViewModal";

const SavingsContent: React.FC = () => {
  const [tab, setTab] = React.useState<"fixed" | "target" | "easylife">("fixed");
  const [subTab, setSubTab] = React.useState<"active" | "completed" | "broken">("active");
  const [open, setOpen] = React.useState(false);
  const [openTarget, setOpenTarget] = React.useState(false);
  const [openFixedDeposit, setOpenFixedDeposit] = React.useState(false);
  const [openEasy, setOpenEasy] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SavingsPlanData | null>(null);
  const [financeViewOpen, setFinanceViewOpen] = React.useState(false);
  const [selectedFinancePlan, setSelectedFinancePlan] = React.useState<FinancePlanData | null>(null);
  const [breakOpen, setBreakOpen] = React.useState(false);
  const [planToBreak, setPlanToBreak] = React.useState<string>("");

  // Fetch savings plans (Target/Natty Auto Save)
  const { plans: savingsPlans, isPending: savingsPending, refetch: refetchSavings } = useGetSavingsPlans();
  // Fetch EasyLife plans
  const { plans: easyLifePlans, isPending: easyLifePending, refetch: refetchEasyLife } = useGetEasyLifePlans();
  // Fetch Fixed deposits
  const { fixedDeposits, isPending: fixedPending, refetch: refetchFixed } = useGetFixedDeposits();
  const isPending = savingsPending || easyLifePending || fixedPending;
  const refetch = () => {
    refetchSavings();
    refetchEasyLife();
    refetchFixed();
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (maturityDate: string) => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Filter plans by type and status
  const getFilteredPlans = (): Array<SavingsPlan | EasyLifePlan | FixedDeposit> => {
    let filtered: Array<SavingsPlan | EasyLifePlan | FixedDeposit> = [];

    if (tab === "target") {
      filtered = savingsPlans.filter((p) => (p.type || p.planType) === "FLEX_SAVE");
    } else if (tab === "fixed") {
      filtered = fixedDeposits;
    } else if (tab === "easylife") {
      filtered = easyLifePlans;
    }

    // Filter by status (subTab)
    if (subTab === "active") {
      filtered = filtered.filter((p) => {
        if (tab === "fixed") {
          const st = (p as FixedDeposit).status as FixedDepositStatus;
          return st === "ACTIVE" || st === "MATURED";
        }
        return (p as SavingsPlan | EasyLifePlan).status === "ACTIVE";
      });
    } else if (subTab === "completed") {
      filtered = filtered.filter((p) => {
        if (tab === "fixed") {
          return (p as FixedDeposit).status === "PAID_OUT";
        }
        return (p as SavingsPlan | EasyLifePlan).status === "COMPLETED";
      });
    } else if (subTab === "broken") {
      filtered = filtered.filter((p) => {
        if (tab === "fixed") {
          return (p as FixedDeposit).status === "EARLY_WITHDRAWN";
        }
        return (p as SavingsPlan | EasyLifePlan).status === "BROKEN";
      });
    }

    return filtered;
  };

  const filteredPlans = getFilteredPlans();

  const isSavingsPlan = (p: SavingsPlan | EasyLifePlan | FixedDeposit): p is SavingsPlan => {
    return (p as SavingsPlan).type === "FLEX_SAVE" || (p as SavingsPlan).type === "NATTY_AUTO_SAVE";
  };
  const isFixedDeposit = (p: SavingsPlan | EasyLifePlan | FixedDeposit): p is FixedDeposit => {
    return "principalAmount" in (p as FixedDeposit);
  };

  // Convert API plan to card data
  const convertPlanToCardData = (plan: SavingsPlan | EasyLifePlan | FixedDeposit) => {
    const statusMap: Record<
      SavingsPlanStatus | EasyLifePlanStatus | FixedDepositStatus,
      "active" | "completed" | "broken"
    > = {
      ACTIVE: "active",
      COMPLETED: "completed",
      BROKEN: "broken",
      MATURED: "active",
      PAID_OUT: "completed",
      EARLY_WITHDRAWN: "broken",
    };

    const totalDeposited = isFixedDeposit(plan)
      ? plan.principalAmount
      : "totalDeposited" in plan
      ? plan.totalDeposited
      : 0;
    const totalInterestAccrued = isFixedDeposit(plan)
      ? 0
      : "totalInterestAccrued" in plan
      ? plan.totalInterestAccrued
      : 0;

    const today = new Date();
    const maturity = new Date(plan.maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = diffDays > 0 ? diffDays : 0;

    const isEasyLife = tab === "easylife";
    const planType = !isEasyLife && isSavingsPlan(plan) 
      ? (plan as SavingsPlan).type || (plan as SavingsPlan).planType 
      : undefined;

    const startDate =
      isFixedDeposit(plan)
        ? plan.startDate || plan.createdAt || plan.maturityDate
        : plan.startDate;

    return {
      name: isFixedDeposit(plan) ? `Fixed Deposit (${String(plan.planType)})` : plan.name,
      amount: totalDeposited,
      earned: totalInterestAccrued,
      startDate: formatDate(startDate),
      maturityDate: formatDate(plan.maturityDate),
      interestRate: isFixedDeposit(plan)
        ? plan.interestRate !== undefined
          ? `${(plan.interestRate * 100).toFixed(2)}% per annum`
          : ""
        : `${((plan as SavingsPlan | EasyLifePlan).interestRate * 100).toFixed(2)}% per annum`,
      status: statusMap[plan.status],
      penaltyFee: 0,
      brokenDate: "",
      breakReason: "",
      goalAmount: isFixedDeposit(plan) ? undefined : plan.goalAmount,
      planType,
      currency: plan.currency || "NGN",
      daysLeft,
      planId: plan.id,
      plan: isFixedDeposit(plan) ? undefined : plan,
    };
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Savings</h1>
          <p className="text-white/60 text-xs sm:text-sm">Manage your savings goals and watch your progress grow.</p>
        </div>
        <button
          onClick={()=> setOpen(true)}
          className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
        >
          <FiPlus className="text-base sm:text-lg" />
          <span>Start New Plan</span>
        </button>
      </div>

      <div className="rounded-2xl bg-bg-600 dark:bg-bg-1100 p-6 flex flex-col gap-6">
        <div className="w-full bg-white/10 rounded-full p-1.5 sm:p-2 grid grid-cols-3 gap-1.5 sm:gap-2">
          {(
            [
              { key: "fixed", label: "Fixed Savings" },
              { key: "target", label: "Target Savings" },
              { key: "easylife", label: "Easy-life Savings" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
                tab === t.key ? "bg-white/15 text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
            { key: "broken", label: "Broken" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setSubTab(st.key as "active" | "completed" | "broken")}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                subTab === st.key ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isPending && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/60 text-sm">Loading savings plans...</p>
          </div>
        )}

        {/* Empty State */}
        {!isPending && filteredPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FiPlus className="text-2xl text-white/40" />
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No {subTab} plans yet</h3>
            <p className="text-white/60 text-sm text-center mb-6">
              {subTab === "active" 
                ? "Start a new savings plan to begin your journey"
                : `You don't have any ${subTab} savings plans at the moment`}
            </p>
            {subTab === "active" && (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <FiPlus className="text-base" />
                <span>Start New Plan</span>
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!isPending && filteredPlans.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredPlans.map((plan) => {
              const cardData = convertPlanToCardData(plan);
              return (
                <SavingsPlanCard
                  key={plan.id}
                  name={cardData.name}
                  amount={cardData.amount}
                  earned={cardData.earned || 0}
                  startDate={cardData.startDate}
                  maturityDate={cardData.maturityDate}
                  interestRate={cardData.interestRate}
                  status={cardData.status}
                  penaltyFee={cardData.penaltyFee}
                  brokenDate={cardData.brokenDate}
                  breakReason={cardData.breakReason}
                  goalAmount={cardData.goalAmount}
                  planType={cardData.planType}
                  currency={cardData.currency}
                  daysLeft={cardData.daysLeft}
                  onView={() => {
                    if (tab === "fixed") {
                      const fd = plan as FixedDeposit;
                      const status =
                        fd.status === "PAID_OUT"
                          ? "PAID_OUT"
                          : fd.status === "MATURED"
                          ? "MATURED"
                          : "ACTIVE";
                      setSelectedFinancePlan({
                        name: `Fixed Deposit #${fd.id.slice(-8).toUpperCase()}`,
                        amount: fd.principalAmount,
                        earned: 0,
                        startDate: fd.startDate ? formatDate(fd.startDate) : "",
                        endDate: formatDate(fd.maturityDate),
                        interestRate: fd.interestRate !== undefined ? `${(fd.interestRate * 100).toFixed(2)}% per annum` : "",
                        duration: fd.durationMonths ? `${fd.durationMonths} months` : "",
                        type: "fixed_deposit",
                        fixedDepositId: fd.id,
                        status,
                      });
                      setFinanceViewOpen(true);
                      return;
                    }

                    const sp = plan as SavingsPlan | EasyLifePlan;
                    const daysLeft = calculateDaysLeft(sp.maturityDate);
                    const currentAmount = sp.totalDeposited ?? 0;
                    const interestEarned = sp.totalInterestAccrued ?? 0;
                    setSelectedPlan({
                      name: sp.name,
                      amount: currentAmount,
                      earned: interestEarned,
                      startDate: cardData.startDate,
                      maturityDate: cardData.maturityDate,
                      interestRate: cardData.interestRate,
                      daysLeft,
                      type: tab,
                      planId: sp.id,
                      plan: sp,
                    });
                    setViewOpen(true);
                  }}
                  onBreak={
                    tab === "fixed"
                      ? undefined
                      : () => {
                          setPlanToBreak((plan as SavingsPlan | EasyLifePlan).id);
                          setBreakOpen(true);
                        }
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      <StartNewPlanModal
        isOpen={open}
        onClose={()=> setOpen(false)}
        onSelect={(type) => {
          setOpen(false);
          if (type === "target") setOpenTarget(true);
          if (type === "fixed") setOpenFixedDeposit(true);
          if (type === "easylife") setOpenEasy(true);
        }}
      />

      <TargetSavingsModal isOpen={openTarget} onClose={()=> { setOpenTarget(false); refetch(); }} />
      <FixedDepositModal isOpen={openFixedDeposit} onClose={()=> { setOpenFixedDeposit(false); refetch(); }} />
      <EasyLifeSavingsModal isOpen={openEasy} onClose={()=> { setOpenEasy(false); refetch(); }} />

      <SavingsPlanViewModal isOpen={viewOpen} onClose={()=> setViewOpen(false)} plan={selectedPlan} />
      <FinancePlanViewModal
        isOpen={financeViewOpen}
        onClose={() => setFinanceViewOpen(false)}
        plan={selectedFinancePlan}
        onRefresh={refetch}
      />
      
      <BreakPlanModal 
        isOpen={breakOpen} 
        onClose={()=> { setBreakOpen(false); setPlanToBreak(""); refetch(); }} 
        planName={(() => {
          const foundPlan = filteredPlans.find(p => p.id === planToBreak);
          return foundPlan && 'name' in foundPlan ? foundPlan.name : planToBreak;
        })()}
        planId={planToBreak}
        planType={tab === "easylife" ? "easylife" : "target"}
        onConfirm={() => {
          setBreakOpen(false);
          setPlanToBreak("");
          refetch();
        }}
      />
    </div>
  );
};

export default SavingsContent;
