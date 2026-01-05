"use client";
import useUserStore from "@/store/user.store";
import BalanceCard from "../BalanceCard";
import InvestCard from "../InvestCard";
import UnverifiedDashboard from "./UnverifiedDashboard";
import { TIER_LEVEL } from "@/constants/types";
import VerifiedDashboard from "./VerifiedDashboard";
import { useEffect, useState, useMemo } from "react";
import FixedSavingsCard from "../FixedSavingsCard";
import FixedDepositCard from "../FixedDepositCard";
import { useGetCurrencyAccounts } from "@/api/currency/currency.queries";
import { useGetSavingsPlans } from "@/api/savings/savings.queries";
import { useGetInvestments } from "@/api/investments/investments.queries";

const DashboardContent = () => {
  const { user } = useUserStore();
  // Check if user has verified with either BVN or NIN
  const isBvnOrNinVerified =
    user?.tierLevel !== TIER_LEVEL.notSet && (user?.isBvnVerified || user?.isNinVerified);
  const isPinCreated = user?.isWalletPinSet;

  const isVerified = isBvnOrNinVerified && isPinCreated;

  const [verificationStatus, setVerificationStatus] = useState(isVerified);

  useEffect(() => {
    setVerificationStatus(isVerified);
  }, [isVerified]);

  // Fetch currency accounts
  const { accounts: currencyAccounts } = useGetCurrencyAccounts();
  
  // Fetch savings plans
  const { plans: savingsPlans } = useGetSavingsPlans();

  // Fetch investments
  const { investments } = useGetInvestments();

  // Fixed Savings - FLEX_SAVE plans (target savings)
  const totalSavingsInterest = useMemo(() => {
    return savingsPlans
      .filter((plan) => plan.planType === "FLEX_SAVE")
      .reduce((total, plan) => total + (plan.interestEarned || 0), 0);
  }, [savingsPlans]);

  // Fixed deposits - NATTY_AUTO_SAVE plans (fixed savings/auto-save)
  const totalFixedDepositInterest = useMemo(() => {
    return savingsPlans
      .filter((plan) => plan.planType === "NATTY_AUTO_SAVE")
      .reduce((total, plan) => total + (plan.interestEarned || 0), 0);
  }, [savingsPlans]);

  const totalInvestmentInterest = useMemo(() => {
    return investments.reduce((total, investment) => {
      return total + (investment.interestAmount || 0);
    }, 0);
  }, [investments]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-text-200 dark:text-text-800 text-2xl md:text-3xl font-semibold">
          {(() => {
            const isBusiness = user?.accountType === "BUSINESS" || user?.isBusiness;
            if (isBusiness && user?.businessName) {
              return `Welcome Back, ${user.businessName}`;
            }
            return `Welcome Back, ${user?.fullname?.split(" ")?.[0] || "User"}`;
          })()}
        </h1>
        <p className="text-text-200 dark:text-text-400 text-sm md:text-base">
          Here's what's happening with your finances today
        </p>
      </div>

      {/* Four top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <BalanceCard
          wallets={user?.wallet || []}
          currencyAccounts={currencyAccounts}
        />
        <FixedSavingsCard />
        <FixedDepositCard amount={totalFixedDepositInterest} />
        <InvestCard amount={totalInvestmentInterest} />
      </div>
      {verificationStatus ? (
        <VerifiedDashboard />
      ) : (
        <UnverifiedDashboard setVerified={setVerificationStatus} />
      )}
    </div>
  );
};

export default DashboardContent;
