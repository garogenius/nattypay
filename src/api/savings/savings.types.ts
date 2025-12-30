export type SavingsPlanType = "FLEX_SAVE" | "NATTY_AUTO_SAVE";
export type SavingsPlanStatus = "ACTIVE" | "COMPLETED" | "BROKEN";

export interface ICreateSavingsPlan {
  name: string;
  planType: SavingsPlanType;
  targetAmount?: number; // Required for FLEX_SAVE
  duration?: number; // Duration in days
  interestRate?: number; // Interest rate percentage
  penaltyRate?: number; // Penalty rate percentage (default 10%)
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  frequency?: "Daily" | "Weekly" | "Monthly" | "Yearly"; // For auto-save
  topUpAmount?: number; // For auto-save
  walletId?: string; // Wallet ID for funding
  isAutoSave?: boolean; // Whether it's auto-save mode
}

export interface IFundSavingsPlan {
  planId: string;
  amount: number;
  walletPin: string;
  walletId?: string; // Optional wallet ID
}

export interface IWithdrawSavingsPlan {
  planId: string;
  walletPin: string;
  reason?: string; // Reason for early withdrawal
}

export interface SavingsPlan {
  id: string;
  name: string;
  planType: SavingsPlanType;
  status: SavingsPlanStatus;
  targetAmount?: number;
  currentAmount: number;
  interestEarned: number;
  interestRate: number;
  penaltyRate: number;
  startDate: string;
  maturityDate: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  deposits?: SavingsDeposit[];
  isAutoSave?: boolean;
  frequency?: string;
  topUpAmount?: number;
  brokenDate?: string;
  breakReason?: string;
  penaltyFee?: number;
}

export interface SavingsDeposit {
  id: string;
  planId: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL";
  createdAt: string;
  description?: string;
}

export interface SavingsWithdrawResponse {
  planId: string;
  amountWithdrawn: number;
  interestPaid: number;
  penaltyApplied: number;
  totalReceived: number;
  isEarlyWithdrawal: boolean;
}


