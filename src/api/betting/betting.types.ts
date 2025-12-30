export interface IBettingPlatform {
  code: string;
  name: string;
  enabled: boolean;
}

export interface IFundBettingPlatform {
  platform: string;
  platformUserId: string;
  amount: number;
  currency: string;
  walletPin: string;
  description?: string;
}

export interface IFundBettingWallet {
  amount: number;
  currency: string;
  walletPin: string;
  description?: string;
}

export interface IWithdrawBettingWallet {
  amount: number;
  currency: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  walletPin: string;
  description?: string;
}

export interface IBettingWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  palmpayAccountId: string;
  palmpayAccountNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBettingTransaction {
  id: string;
  operationType: "FUNDING" | "WITHDRAWAL" | "PLATFORM_FUNDING";
  status: string;
  amount: number;
  currency: string;
  transactionRef: string;
  createdAt: string;
}

































