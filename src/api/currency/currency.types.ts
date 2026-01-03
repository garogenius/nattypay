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





