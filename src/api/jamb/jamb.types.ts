export type IGetJambPlans = {};

export type IGetJambBillInfo = {
  billerCode: string;
};

export type IVerifyJambBillerNumber = {
  billerCode: string;
  itemCode: string;
  customerId: string;
};

export type IPayJamb = {
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








