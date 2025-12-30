export type IAirtimePlan = {
  phone: string;
  currency: string;
};

export type IInternationalAirtimePlan = {
  phone: string;
};

export type IInternationalAirtimeFxRate = {
  operatorId: number;
  amount: number;
};

export type IAirtimeVariation = {
  operatorId: number;
};

export type IAirtimePayPayload = {
  phone: string;
  currency: string;
  operatorId: number;
  amount: number;
  addBeneficiary?: boolean;
  walletPin: string;
};

export type IInternationalAirtimePayPayload = {
  phone: string;
  currency: string;
  operatorId: number;
  amount: number;
  addBeneficiary?: boolean;
  walletPin: string;
};
