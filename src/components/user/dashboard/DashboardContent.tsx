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
import { useGetFixedDeposits } from "@/api/fixed-deposits/fixed-deposits.queries";
import StatsPlaceholderCard from "./StatsPlaceholderCard";

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

  // Fetch fixed deposits
  const { fixedDeposits } = useGetFixedDeposits();

  // Fixed Savings - FLEX_SAVE plans (target savings)
  const fixedSavingsPlans = useMemo(() => {
    return savingsPlans.filter((plan) => (plan.type || plan.planType) === "FLEX_SAVE");
  }, [savingsPlans]);

  const totalSavingsInterest = useMemo(() => {
    return fixedSavingsPlans.reduce((total, plan) => total + (plan.interestEarned || plan.totalInterestAccrued || 0), 0);
  }, [fixedSavingsPlans]);

  // Fixed deposits - use actual fixed deposits from API
  const hasFixedDeposits = fixedDeposits.length > 0;

  const totalInvestmentInterest = useMemo(() => {
    return investments.reduce((total, investment) => {
      return total + (investment.interestAmount || 0);
    }, 0);
  }, [investments]);

  // Check if user has created each type
  const hasFixedSavings = fixedSavingsPlans.length > 0;
  const hasInvestments = investments.length > 0;

  // Count visible stats cards (excluding BalanceCard)
  const visibleStatsCardsCount = useMemo(() => {
    let count = 0;
    if (hasFixedSavings) count++;
    if (hasFixedDeposits) count++;
    if (hasInvestments) count++;
    return count;
  }, [hasFixedSavings, hasFixedDeposits, hasInvestments]);

  // Calculate placeholder span: if 1 card visible, span 2; if 2 cards visible, span 1; if 3 cards visible, don't show placeholder
  const placeholderSpan = useMemo(() => {
    if (visibleStatsCardsCount === 0) return 3; // If no cards, placeholder takes all 3 spaces
    if (visibleStatsCardsCount === 1) return 2; // If 1 card, placeholder takes 2 spaces
    if (visibleStatsCardsCount === 2) return 1; // If 2 cards, placeholder takes 1 space
    return 0; // If 3 cards, no placeholder
  }, [visibleStatsCardsCount]);

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
            return `Welcome Back, ${user?.username || "User"}`;
          })()}
        </h1>
        <p className="text-text-200 dark:text-text-400 text-sm md:text-base">
          Here's what's happening with your finances today
        </p>
      </div>

      {/* Stats cards - conditionally displayed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <BalanceCard
          wallets={user?.wallet || []}
          currencyAccounts={currencyAccounts}
        />
        {hasFixedSavings && <FixedSavingsCard />}
        {hasFixedDeposits && <FixedDepositCard />}
        {hasInvestments && <InvestCard amount={totalInvestmentInterest} />}
        {placeholderSpan > 0 && <StatsPlaceholderCard spanCols={placeholderSpan} />}
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
