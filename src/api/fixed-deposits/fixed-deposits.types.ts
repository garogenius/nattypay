export type FixedDepositStatus = "ACTIVE" | "MATURED" | "PAID_OUT" | "EARLY_WITHDRAWN";

export type FixedDepositPlanType = "SHORT_TERM_90" | "MEDIUM_TERM_180" | "LONG_TERM_365" | string;
export type FixedDepositInterestPaymentFrequency = "AT_MATURITY" | string;
export type FixedDepositRolloverType = "PRINCIPAL_ONLY" | "PRINCIPAL_PLUS_INTEREST";

export interface ICreateFixedDeposit {
  planType: FixedDepositPlanType;
  principalAmount: number;
  currency: "NGN";
  interestPaymentFrequency: FixedDepositInterestPaymentFrequency;
  reinvestInterest: boolean;
  autoRenewal: boolean;
}

export interface FixedDeposit {
  id: string;
  planType: FixedDepositPlanType;
  principalAmount: number;
  currency: string;
  interestRate?: number; // Decimal (e.g., 0.04 = 4%)
  minimumDeposit?: number;
  durationDays?: number;
  durationMonths?: number;
  interestPaymentFrequency?: FixedDepositInterestPaymentFrequency;
  reinvestInterest?: boolean;
  autoRenewal?: boolean;
  certificateReference?: string;
  status: FixedDepositStatus;
  startDate?: string;
  maturityDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FixedDepositPlan {
  planType: FixedDepositPlanType;
  name: string;
  minimumDeposit: number;
  interestRate: number;
  interestRatePercentage?: string;
  durationDays: number;
  durationMonths: number;
}

export interface IFixedDepositEarlyWithdrawal {
  fixedDepositId: string;
  reason: string;
}

export interface IFixedDepositRollover {
  fixedDepositId: string;
  rolloverType: FixedDepositRolloverType;
  planType?: FixedDepositPlanType;
  autoRenewal?: boolean;
}

export interface FixedDepositPayoutResponse {
  fixedDeposit: {
    id: string;
    status: FixedDepositStatus;
  };
  payout: {
    principalAmount: number;
    interestAmount: number;
    totalPayout: number;
    transactionId?: string;
  };
}



















