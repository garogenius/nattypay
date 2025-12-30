"use client";
import useUserStore from "@/store/user.store";
import BalanceCard from "../BalanceCard";
import InvestCard from "../InvestCard";
import UnverifiedDashboard from "./UnverifiedDashboard";
import { TIER_LEVEL } from "@/constants/types";
import VerifiedDashboard from "./VerifiedDashboard";
import { useEffect, useState } from "react";
import FixedSavingsCard from "../FixedSavingsCard";
import FixedDepositCard from "../FixedDepositCard";

const DashboardContent = () => {
  const { user } = useUserStore();
  const isBvnVerified =
    user?.tierLevel !== TIER_LEVEL.notSet && user?.isBvnVerified;
  const isPinCreated = user?.isWalletPinSet;

  const isVerified = isBvnVerified && isPinCreated;

  const [verificationStatus, setVerificationStatus] = useState(isVerified);

  useEffect(() => {
    setVerificationStatus(isVerified);
  }, [isVerified]);

  const primaryWallet = user?.wallet?.[0];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-text-200 dark:text-text-800 text-2xl md:text-3xl font-semibold">
          {`Welcome Back, ${user?.fullname?.split(" ")?.[0] || "User"}`}
        </h1>
        <p className="text-text-200 dark:text-text-400 text-sm md:text-base">
          Here’s what’s happening with your finances today
        </p>
      </div>

      {/* Four top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {primaryWallet && (
          <BalanceCard
            currency={primaryWallet.currency.toLowerCase()}
            balance={primaryWallet.balance}
          />
        )}
        <FixedSavingsCard amount={0} />
        <FixedDepositCard amount={0} />
        <InvestCard amount={0} />
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
