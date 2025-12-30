"use client";

import React from "react";
import { FiPlus } from "react-icons/fi";
import StartNewFinancePlanModal from "@/components/modals/finance/StartNewFinancePlanModal";
import InvestmentModal from "@/components/modals/finance/InvestmentModal";
import FixedDepositModal from "@/components/modals/finance/FixedDepositModal";
import FinancePlanCard from "@/components/user/finance/FinancePlanCard";
import FinancePlanViewModal, { FinancePlanData } from "@/components/modals/finance/FinancePlanViewModal";

const FinanceContent: React.FC = () => {
  const [tab, setTab] = React.useState<"investment" | "fixed_deposit">("investment");
  const [subTab, setSubTab] = React.useState<"active" | "completed">("active");
  const [open, setOpen] = React.useState(false);
  const [openInvestment, setOpenInvestment] = React.useState(false);
  const [openFixed, setOpenFixed] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<FinancePlanData | null>(null);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">Finance</h1>
          <p className="text-white/60 text-xs sm:text-sm">Manage your investments and fixed deposits</p>
        </div>
        <button
          onClick={()=> setOpen(true)}
          className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
        >
          <FiPlus className="text-base sm:text-lg" />
          Start New Plan
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Main Tabs */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-white/5 p-1.5 sm:p-2 rounded-2xl">
          {[
            { key: "investment", label: "Investment" },
            { key: "fixed_deposit", label: "Fixed Deposit" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key as any);
                setSubTab("active");
              }}
              className={`rounded-full py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
                tab === (t.key as any) ? "bg-white/15 text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {(() => {
          const samples = {
            investment: {
              active: [
                { name: "Car Savings Goal", amount: 5000000, earned: 5000, startDate: "12-05-2025", endDate: "12-05-2025", interestRate: "17% per annum", status: "active" as const },
                { name: "Car Savings Goal", amount: 5000000, earned: 5000, startDate: "12-05-2025", endDate: "12-05-2025", interestRate: "17% per annum", status: "active" as const },
              ],
              completed: [
                { name: "Car Savings Goal", amount: 5000000, earned: 5000, startDate: "12-05-2025", endDate: "12-05-2025", interestRate: "17% per annum", status: "completed" as const },
              ],
            },
            fixed_deposit: {
              active: [
                { name: "Car Savings Goal", amount: 5000000, earned: 5000, startDate: "12-05-2025", endDate: "12-05-2025", interestRate: "17% per annum", status: "active" as const },
              ],
              completed: [],
            },
          };

          const list = samples[tab][subTab];
          
          // Empty state
          if (list.length === 0) {
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
                  <p className="text-white text-sm sm:text-base mb-2">You have no active Plan — start a new one to keep building your portfolio</p>
                </div>
                <button
                  onClick={() => setOpen(true)}
                  className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  Start New Plan
                </button>
              </div>
            );
          }

          return (
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

              {/* Cards */}
              <div className="flex flex-col gap-4">
                {list.map((p, i) => (
                  <FinancePlanCard
                    key={i}
                    name={p.name}
                    amount={p.amount}
                    earned={p.earned || 0}
                    startDate={p.startDate}
                    endDate={p.endDate}
                    interestRate={p.interestRate}
                    status={p.status}
                    onView={() => { 
                      setSelectedPlan({ 
                        name: p.name, 
                        amount: p.amount, 
                        earned: p.earned,
                        startDate: p.startDate,
                        endDate: p.endDate,
                        interestRate: p.interestRate,
                        duration: "6 Months",
                        type: tab 
                      }); 
                      setViewOpen(true); 
                    }}
                  />
                ))}
              </div>
            </>
          );
        })()}
      </div>

      <StartNewFinancePlanModal
        isOpen={open}
        onClose={()=> setOpen(false)}
        onSelectType={(type) => {
          if (type === "investment") setOpenInvestment(true);
          if (type === "fixed_deposit") setOpenFixed(true);
        }}
      />

      <InvestmentModal isOpen={openInvestment} onClose={()=> setOpenInvestment(false)} />
      <FixedDepositModal isOpen={openFixed} onClose={()=> setOpenFixed(false)} />

      <FinancePlanViewModal isOpen={viewOpen} onClose={()=> setViewOpen(false)} plan={selectedPlan} />
    </div>
  );
};

export default FinanceContent;
