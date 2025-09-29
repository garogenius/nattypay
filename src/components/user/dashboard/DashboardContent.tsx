"use client";
import useUserStore from "@/store/user.store";
import BalanceCard from "../BalanceCard";
import InvestCard from "../InvestCard";
import UnverifiedDashboard from "./UnverifiedDashboard";
import { TIER_LEVEL } from "@/constants/types";
import VerifiedDashboard from "./VerifiedDashboard";
import { useEffect, useState } from "react";

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
    <div className="flex flex-col gap-4 pb-10">
      {/* Top cards: My Balance + Invest */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {primaryWallet && (
          <BalanceCard
            currency={primaryWallet.currency.toLowerCase()}
            balance={primaryWallet.balance}
          />
        )}
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
