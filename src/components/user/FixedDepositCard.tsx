"use client";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRef, useState, useMemo } from "react";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { LiaPiggyBankSolid } from "react-icons/lia";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { useGetFixedDeposits } from "@/api/fixed-deposits/fixed-deposits.queries";
import { FixedDepositPlanType } from "@/api/fixed-deposits/fixed-deposits.types";

const FixedDepositCard = () => {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [planType, setPlanType] = useState<FixedDepositPlanType | "All">("All");
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setOpen(false));
  
  // Fetch fixed deposits
  const { fixedDeposits } = useGetFixedDeposits();
  
  // Get unique plan types from fixed deposits
  const availablePlanTypes = useMemo(() => {
    const types = new Set<FixedDepositPlanType>();
    fixedDeposits.forEach((deposit) => {
      if (deposit.planType) {
        types.add(deposit.planType);
      }
    });
    return Array.from(types);
  }, [fixedDeposits]);

  // Calculate amount based on selected plan type
  const amount = useMemo(() => {
    let filteredDeposits = fixedDeposits;
    
    if (planType !== "All") {
      filteredDeposits = fixedDeposits.filter((deposit) => deposit.planType === planType);
    }
    
    // Calculate total interest earned
    // Interest = principalAmount * interestRate * (daysElapsed / totalDays)
    return filteredDeposits.reduce((total, deposit) => {
      if (!deposit.principalAmount || !deposit.interestRate) return total;
      
      // Calculate interest based on time elapsed
      let interest = 0;
      if (deposit.startDate && deposit.maturityDate) {
        const start = new Date(deposit.startDate);
        const maturity = new Date(deposit.maturityDate);
        const now = new Date();
        const totalDays = Math.ceil((maturity.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const daysElapsed = Math.min(
          Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
          totalDays
        );
        
        if (totalDays > 0) {
          interest = deposit.principalAmount * (deposit.interestRate || 0) * (daysElapsed / totalDays);
        }
      } else if (deposit.interestRate) {
        // Fallback: use interest rate directly if dates not available
        interest = deposit.principalAmount * (deposit.interestRate || 0);
      }
      
      return total + interest;
    }, 0);
  }, [fixedDeposits, planType]);

  // Get plan type label
  const getPlanTypeLabel = (type: FixedDepositPlanType | "All"): string => {
    if (type === "All") return "All Plans";
    const labels: Record<string, string> = {
      "SHORT_TERM_90": "Short Term (90 days)",
      "MEDIUM_TERM_180": "Medium Term (180 days)",
      "LONG_TERM_365": "Long Term (365 days)",
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-4 flex flex-col gap-2 sm:gap-3">
      <div className="relative flex items-center gap-2 text-text-200 dark:text-text-800">
        <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
          <LiaPiggyBankSolid className="text-lg" />
        </div>
        <p className="text-sm sm:text-base font-semibold">Fixed Deposit</p>
        {availablePlanTypes.length > 0 && (
          <>
            <MdKeyboardArrowDown onClick={() => setOpen((v) => !v)} className="ml-auto cursor-pointer" />
            {open && (
              <div ref={menuRef} className="absolute right-0 top-9 z-50 w-64 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-text-200 dark:text-text-800 font-semibold">Plan Types</p>
                  <MdClose onClick={() => setOpen(false)} className="cursor-pointer" />
                </div>
                {["All", ...availablePlanTypes].map((type, idx, arr) => (
                  <button
                    key={type}
                    onClick={() => {
                      setPlanType(type as FixedDepositPlanType | "All");
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between py-2.5 ${idx !== arr.length - 1 ? "border-b border-border-800 dark:border-border-700" : ""}`}
                  >
                    <span className="text-left text-text-200 dark:text-text-800 text-sm">{getPlanTypeLabel(type as FixedDepositPlanType | "All")}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border ${planType === type ? "bg-secondary border-secondary" : "border-border-800 dark:border-border-700"}`}></span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 font-semibold">
        <p className="text-text-200 dark:text-text-800 text-xs sm:text-sm">Total Interest Credited</p>
        {visible ? (
          <FiEyeOff onClick={() => setVisible(false)} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        ) : (
          <FiEye onClick={() => setVisible(true)} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        )}
      </div>
      <p className="text-text-400 text-2xl sm:text-3xl font-semibold">
        {visible ? `₦ ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "---"}
      </p>
    </div>
  );
};

export default FixedDepositCard;
