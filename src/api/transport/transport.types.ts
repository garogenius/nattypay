export type IGetTransportPlans = {
  currency: string;
  isEnabled?: boolean;
};

export type IGetTransportBillInfo = {
  billerCode: string;
};

export type IPayTransport = {
  amount: number;
  itemCode: string;
  billerCode: string;
  billerNumber: string;
  currency: string;
  addBeneficiary?: boolean;
  walletPin: string;
};






