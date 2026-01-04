export interface ICreateCurrencyAccount {
  currency: "USD" | "EUR" | "GBP";
  label: string;
}

export interface IGetCurrencyAccount {
  currency: "NGN" | "USD" | "EUR" | "GBP";
}

export interface ICurrencyAccount {
  id?: string;
  currency: string;
  label: string;
  accountNumber?: string;
  bankName?: string;
  balance?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt?: string;
  updatedAt?: string;
}

// Card Types
export interface ICreateCard {
  label: string;
  currency: "USD" | "EUR" | "GBP"; // Virtual cards are available for USD, EUR, and GBP (required)
  initialBalance?: number; // Optional initial balance for the card
}

export interface IFundCard {
  amount: number;
  walletPin: string;
  walletId?: string;
}

export interface ISetCardLimits {
  dailyLimit?: number;
  monthlyLimit?: number;
  transactionLimit?: number;
}

export interface IWithdrawCard {
  amount: number;
  walletPin: string;
}

export interface IVirtualCard {
  id: string;
  label: string;
  maskedNumber: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "FROZEN" | "BLOCKED" | "CLOSED";
  isVirtual: boolean;
  brand?: "visa" | "mastercard" | "verve";
  cardholder?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  transactionLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ICardTransaction {
  id: string;
  cardId: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  currency: string;
  description?: string;
  merchant?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

// Currency Conversion Types
export interface IConvertCurrency {
  fromCurrency: "NGN" | "USD" | "EUR" | "GBP";
  toCurrency: "NGN" | "USD" | "EUR" | "GBP";
  amount: number;
}

export interface ICurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp?: string;
}

export interface ISupportedCurrency {
  code: string;
  name: string;
  symbol: string;
}

// Currency Account Transaction Types
export interface ICurrencyAccountTransaction {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  transaction_type: "credit" | "debit";
  status: "pending" | "completed" | "failed";
  description?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

// Currency Account Deposit Types
export interface ICurrencyAccountDeposit {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  created_at: string;
  updated_at: string;
}

// Currency Account Payout Types
export interface ICurrencyAccountPayout {
  id: string;
  account_id: string;
  destination_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  fee: number;
  created_at: string;
  updated_at?: string;
}

// Payout Destination Types
export interface IPayoutDestination {
  id: string;
  type: "wire" | "nip" | "stablecoin";
  account_number: string;
  bank_name?: string;
  account_name: string;
  currency: string;
  created_at: string;
}

export interface ICreatePayoutDestination {
  type: "wire" | "nip" | "stablecoin";
  account_number: string;
  bank_name?: string;
  account_name: string;
}

export interface ICreatePayout {
  destinationId: string;
  amount: number;
  reference?: string;
  description?: string;
}

export interface IUpdateCurrencyAccount {
  label: string;
}

export interface ICloseCurrencyAccount {
  walletPin: string;
}

export interface IUpdateCard {
  label: string;
}

export interface IBlockCard {
  walletPin: string;
  reason?: string;
}

export interface ICloseCard {
  walletPin: string;
}

export interface IGetTransferFee {
  currency: string;
  amount: number;
  accountNumber: string;
}





