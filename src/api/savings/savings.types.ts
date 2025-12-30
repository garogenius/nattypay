export type SavingsPlanType = "FLEX_SAVE" | "NATTY_AUTO_SAVE";
export type SavingsPlanStatus = "ACTIVE" | "COMPLETED" | "BROKEN";

export interface ICreateSavingsPlan {
  type: SavingsPlanType; // "FLEX_SAVE" or "NATTY_AUTO_SAVE"
  name: string;
  description?: string;
  goalAmount: number; // Required for FLEX_SAVE, positive number
  currency: string; // e.g., "NGN"
  durationMonths: number; // Integer between 1-60
}

export interface IFundSavingsPlan {
  planId: string;
  amount: number;
  currency: string; // e.g., "NGN"
}

export interface IWithdrawSavingsPlanResponse {
  plan: {
    id: string;
    status: SavingsPlanStatus;
    totalDeposited: number;
    totalInterestAccrued: number;
  };
  payoutAmount: number;
  interest: number;
  penalty: number;
}

export interface SavingsPlan {
  id: string;
  userId?: string;
  name: string;
  type: SavingsPlanType; // API returns "type" not "planType"
  status: SavingsPlanStatus;
  description?: string;
  goalAmount: number; // API returns "goalAmount" not "targetAmount"
  currency: string;
  durationMonths: number; // API returns "durationMonths" not "duration"
  interestRate: number; // Decimal (e.g., 0.03 = 3%)
  penaltyRate: number; // Decimal (e.g., 0.1 = 10%)
  minMonthlyDeposit?: number | null;
  autoDebitEnabled?: boolean;
  autoDebitChargeDay?: number;
  totalDeposited: number; // API returns "totalDeposited" not "currentAmount"
  totalInterestAccrued: number; // API returns "totalInterestAccrued" not "interestEarned"
  startDate: string;
  maturityDate: string;
  lockedUntil: string;
  lastDepositDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deposits?: SavingsDeposit[];
  brokenDate?: string;
  breakReason?: string;
  penaltyFee?: number;
  // Legacy fields for backward compatibility
  planType?: SavingsPlanType;
  targetAmount?: number;
  currentAmount?: number;
  interestEarned?: number;
  duration?: number;
  isAutoSave?: boolean;
  frequency?: string;
  topUpAmount?: number;
}

export interface SavingsDeposit {
  id: string;
  planId: string;
  walletId?: string;
  amount: number;
  currency: string;
  transactionId?: string;
  createdAt: string;
}

export interface SavingsWithdrawResponse {
  planId: string;
  amountWithdrawn: number;
  interestPaid: number;
  penaltyApplied: number;
  totalReceived: number;
  isEarlyWithdrawal: boolean;
}


