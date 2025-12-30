export type IGetEducationBillers = {};

export type IGetEducationBillerItems = {
  billerCode: string;
};

export type IVerifyEducationCustomer = {
  billerCode: string;
  itemCode: string;
  customerId: string;
};

export type IPayEducation = {
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






