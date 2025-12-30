export type IGetWaecPlans = {};

export type IGetWaecBillInfo = {
  billerCode: string;
};

export type IVerifyWaecBillerNumber = {
  billerCode: string;
  itemCode: string;
  customerId: string;
};

export type IPayWaec = {
  billerCode: string;
  itemCode: string;
  customerId: string;
  amount: number;
  currency: string;
  walletPin: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addBeneficiary?: boolean;
};








