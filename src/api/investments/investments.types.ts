export type InvestmentStatus = "ACTIVE" | "PAID_OUT";

export interface ICreateInvestment {
  amount: number;
  currency: "NGN";
  agreementReference?: string;
  legalDocumentUrl?: string;
}

export interface Investment {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: string;
  roiRate: number; // 0.15 = 15%
  expectedReturn: number;
  capitalAmount: number;
  interestAmount: number;
  startDate: string;
  maturityDate: string;
  payoutDate?: string | null;
  status: InvestmentStatus;
  agreementReference?: string;
  agreementStatus?: string;
  legalDocumentUrl?: string | null;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  transaction?: {
    id: string;
    transactionRef: string;
    createdAt: string;
    description?: string;
  };
}

export interface IPayoutInvestment {
  walletPin: string;
}

export interface InvestmentPayoutResponse {
  investmentId: string;
  capitalAmount: number;
  interestAmount: number;
  totalPayout: number;
  transactionReference: string;
  status: "PAID_OUT";
}











