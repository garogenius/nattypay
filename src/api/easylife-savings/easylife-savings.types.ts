export type EasyLifeContributionFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
export type EasyLifePlanStatus = "ACTIVE" | "COMPLETED" | "BROKEN";

export interface ICreateEasyLifePlan {
  name: string;
  description?: string;
  goalAmount: number;
  currency: string; // e.g. "NGN"
  durationDays: number;
  contributionFrequency: EasyLifeContributionFrequency;
  autoDebitEnabled: boolean;
  earlyWithdrawalEnabled: boolean;
}

export interface IFundEasyLifePlan {
  planId: string;
  amount: number;
  currency: string;
}

export interface EasyLifeDeposit {
  id: string;
  planId: string;
  walletId?: string;
  amount: number;
  currency: string;
  transactionId?: string;
  createdAt: string;
}

export interface EasyLifePlan {
  id: string;
  userId?: string;
  type: "EASYLIFE";
  name: string;
  description?: string;
  goalAmount: number;
  currency: string;
  interestRate: number;
  penaltyRate: number;
  durationDays: number;
  minDepositAmount?: number;
  contributionFrequency: EasyLifeContributionFrequency;
  autoDebitEnabled: boolean;
  earlyWithdrawalEnabled: boolean;
  startDate: string;
  maturityDate: string;
  lockedUntil?: string;
  totalDeposited: number;
  totalInterestAccrued: number;
  progressPercentage?: number;
  isGoalReached?: boolean;
  status: EasyLifePlanStatus;
  lastDepositDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  deposits?: EasyLifeDeposit[];
}

export interface EasyLifeWithdrawResponse {
  plan: {
    id: string;
    status: EasyLifePlanStatus;
    totalDeposited: number;
    totalInterestAccrued: number;
  };
  payoutAmount: number;
  interest: number;
  penalty: number;
}



























































































