"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import StartNewPlanModal from "@/components/modals/StartNewPlanModal";
import TargetSavingsModal from "@/components/modals/savings/TargetSavingsModal";
import FixedSavingsModal from "@/components/modals/savings/FixedSavingsModal";
import EasyLifeSavingsModal from "@/components/modals/savings/EasyLifeSavingsModal";
import SavingsPlanCard from "@/components/user/savings/SavingsPlanCard";
import SavingsPlanViewModal, { SavingsPlanData } from "@/components/modals/savings/SavingsPlanViewModal";
import BreakPlanModal from "@/components/modals/savings/BreakPlanModal";
import { useGetSavingsPlans } from "@/api/savings/savings.queries";
import { SavingsPlan, SavingsPlanStatus } from "@/api/savings/savings.types";

const SavingsContent: React.FC = () => {
  const [tab, setTab] = React.useState<"fixed" | "target" | "easylife">("fixed");
  const [subTab, setSubTab] = React.useState<"active" | "completed" | "broken">("active");
  const [open, setOpen] = React.useState(false);
  const [openTarget, setOpenTarget] = React.useState(false);
  const [openFixed, setOpenFixed] = React.useState(false);
  const [openEasy, setOpenEasy] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<SavingsPlanData | null>(null);
  const [breakOpen, setBreakOpen] = React.useState(false);
  const [planToBreak, setPlanToBreak] = React.useState<string>("");

  // Fetch savings plans
  const { plans, isPending, refetch } = useGetSavingsPlans();

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
  const getFilteredPlans = () => {
    let filtered = plans;

    // Filter by plan type (tab)
    if (tab === "fixed") {
      // Fixed savings - typically NATTY_AUTO_SAVE with fixed duration
      filtered = filtered.filter(p => p.planType === "NATTY_AUTO_SAVE" && p.duration);
    } else if (tab === "target") {
      // Target savings - FLEX_SAVE with target amount
      filtered = filtered.filter(p => p.planType === "FLEX_SAVE" && p.targetAmount);
    } else if (tab === "easylife") {
      // Easy-life savings - NATTY_AUTO_SAVE without fixed duration or FLEX_SAVE
      filtered = filtered.filter(p => 
        (p.planType === "NATTY_AUTO_SAVE" && !p.duration) || 
        (p.planType === "FLEX_SAVE" && !p.targetAmount)
      );
    }

    // Filter by status (subTab)
    if (subTab === "active") {
      filtered = filtered.filter(p => p.status === "ACTIVE");
    } else if (subTab === "completed") {
      filtered = filtered.filter(p => p.status === "COMPLETED");
    } else if (subTab === "broken") {
      filtered = filtered.filter(p => p.status === "BROKEN");
    }

    return filtered;
  };

  const filteredPlans = getFilteredPlans();

  // Convert API plan to card data
  const convertPlanToCardData = (plan: SavingsPlan) => {
    const statusMap: Record<SavingsPlanStatus, "active" | "completed" | "broken"> = {
      ACTIVE: "active",
      COMPLETED: "completed",
      BROKEN: "broken",
    };

    return {
      name: plan.name,
      amount: plan.currentAmount,
      earned: plan.interestEarned,
      startDate: formatDate(plan.startDate),
      maturityDate: formatDate(plan.maturityDate),
      interestRate: `${plan.interestRate}% per annum`,
      status: statusMap[plan.status],
      penaltyFee: plan.penaltyFee || 0,
      brokenDate: plan.brokenDate ? formatDate(plan.brokenDate) : "",
      breakReason: plan.breakReason || "",
      planId: plan.id,
      plan: plan, // Store full plan for modal
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
          {[
            { key: "fixed", label: "Fixed Savings" },
            { key: "target", label: "Target Savings" },
            { key: "easylife", label: "Easy-life Savings" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`rounded-full py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
                tab === (t.key as any) ? "bg-white/15 text-white" : "text-white/70 hover:text-white"
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
              onClick={() => setSubTab(st.key as any)}
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
                  onView={() => {
                    const daysLeft = calculateDaysLeft(plan.maturityDate);
                    setSelectedPlan({
                      name: plan.name,
                      amount: plan.currentAmount,
                      earned: plan.interestEarned,
                      startDate: cardData.startDate,
                      maturityDate: cardData.maturityDate,
                      interestRate: cardData.interestRate,
                      daysLeft,
                      type: tab,
                      planId: plan.id,
                      plan: plan,
                    });
                    setViewOpen(true);
                  }}
                  onBreak={() => {
                    setPlanToBreak(plan.id);
                    setBreakOpen(true);
                  }}
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
          if (type === "fixed") setOpenFixed(true);
          if (type === "easylife") setOpenEasy(true);
        }}
      />

      <TargetSavingsModal isOpen={openTarget} onClose={()=> { setOpenTarget(false); refetch(); }} />
      <FixedSavingsModal isOpen={openFixed} onClose={()=> { setOpenFixed(false); refetch(); }} />
      <EasyLifeSavingsModal isOpen={openEasy} onClose={()=> { setOpenEasy(false); refetch(); }} />

      <SavingsPlanViewModal isOpen={viewOpen} onClose={()=> setViewOpen(false)} plan={selectedPlan} />
      
      <BreakPlanModal 
        isOpen={breakOpen} 
        onClose={()=> { setBreakOpen(false); setPlanToBreak(""); refetch(); }} 
        planName={filteredPlans.find(p => p.id === planToBreak)?.name || planToBreak}
        planId={planToBreak}
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
