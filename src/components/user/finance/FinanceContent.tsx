"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import useNavigate from "@/hooks/useNavigate";
import StartNewFinancePlanModal from "@/components/modals/finance/StartNewFinancePlanModal";
import InvestmentModal from "@/components/modals/finance/InvestmentModal";
import FinancePlanCard from "@/components/user/finance/FinancePlanCard";
import FinancePlanViewModal, { FinancePlanData } from "@/components/modals/finance/FinancePlanViewModal";
import { useGetInvestments } from "@/api/investments/investments.queries";
import { Investment } from "@/api/investments/investments.types";

const FinanceContent: React.FC = () => {
  const navigate = useNavigate();
  const [subTab, setSubTab] = React.useState<"active" | "completed">("active");
  const [open, setOpen] = React.useState(false);
  const [openInvestment, setOpenInvestment] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<FinancePlanData | null>(null);

  // Fetch investments
  const { investments, isPending: investmentsLoading, refetch: refetchInvestments } = useGetInvestments();

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
  };

  // Convert investment to FinancePlanData format
  const convertInvestmentToPlanData = (investment: Investment): FinancePlanData => {
    // Calculate duration from start and maturity dates
    const start = new Date(investment.startDate);
    const maturity = new Date(investment.maturityDate);
    const months = Math.round((maturity.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    return {
      name: `Investment #${investment.id.slice(-8).toUpperCase()}`,
      amount: investment.amount || investment.capitalAmount || 0,
      earned: investment.interestAmount || 0,
      startDate: formatDate(investment.startDate),
      endDate: formatDate(investment.maturityDate),
      interestRate: investment.roiRate ? `${(investment.roiRate * 100).toFixed(0)}% per annum` : "15% per annum",
      duration: `${months} ${months === 1 ? 'month' : 'months'}`,
      type: "investment",
      investmentId: investment.id,
      status: investment.status,
      agreementReference: investment.agreementReference,
      transactionReference: investment.transaction?.transactionRef || investment.transactionId,
    };
  };


  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Finance</h1>
          <p className="text-white/60 text-xs sm:text-sm">Manage your investments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/user/investment-opportunity")}
            className="flex items-center gap-2 bg-transparent border border-[#D4B139] hover:bg-[#D4B139]/10 text-[#D4B139] px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
          >
            Investment Opportunity
          </button>
        <button
          onClick={()=> setOpen(true)}
          className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
        >
          <FiPlus className="text-base sm:text-lg" />
          Start New Plan
        </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {investmentsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Sub-tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {[
                { key: "active", label: "Active" },
                { key: "completed", label: "Completed" },
              ].map((st) => (
            <button
                  key={st.key}
                  onClick={() => setSubTab(st.key as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                    subTab === st.key ? "text-[#D4B139] border-b-2 border-[#D4B139]" : "text-white/60 hover:text-white"
              }`}
            >
                  {st.label}
            </button>
          ))}
        </div>

        {(() => {
            const activeInvestments = investments.filter((inv: Investment) => inv.status === "ACTIVE");
            const completedInvestments = investments.filter((inv: Investment) => inv.status === "PAID_OUT");
            const list = subTab === "active" ? activeInvestments : completedInvestments;
            const planList = list.map(convertInvestmentToPlanData);
            
            // Empty state
            if (planList.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-6">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/5 flex items-center justify-center border-4 border-white/10">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      <line x1="2" y1="7" x2="22" y2="7" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="text-center max-w-md">
                    <p className="text-white text-sm sm:text-base mb-2">
                      {subTab === "active" 
                        ? "You have no active investments — start a new one to keep building your portfolio"
                        : "You have no completed investments"}
                    </p>
                  </div>
                  {subTab === "active" && (
                    <button
                      onClick={() => setOpen(true)}
                      className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      Start New Plan
                    </button>
                  )}
                </div>
              );
            }

            return (
                <div className="flex flex-col gap-4">
                  {planList.map((p) => (
                    <FinancePlanCard
                      key={p.investmentId || p.name}
                      name={p.name}
                      amount={p.amount}
                      earned={p.earned || 0}
                      startDate={p.startDate}
                      endDate={p.endDate}
                      interestRate={p.interestRate}
                      status={p.status === "PAID_OUT" ? "completed" : "active"}
                      onView={() => { 
                        setSelectedPlan(p); 
                        setViewOpen(true); 
                      }}
                    />
                  ))}
                </div>
          );
        })()}
          </>
        )}
      </div>

      <StartNewFinancePlanModal
        isOpen={open}
        onClose={()=> setOpen(false)}
        onSelectType={(type) => {
          if (type === "investment") setOpenInvestment(true);
        }}
      />

      <InvestmentModal 
        isOpen={openInvestment} 
        onClose={()=> {
          setOpenInvestment(false);
          refetchInvestments();
        }} 
      />

      <FinancePlanViewModal 
        isOpen={viewOpen} 
        onClose={()=> setViewOpen(false)} 
        plan={selectedPlan}
        onRefresh={() => {
          refetchInvestments();
        }}
      />
    </div>
  );
};

export default FinanceContent;
