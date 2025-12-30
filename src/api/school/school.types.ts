export type IGetSchoolPlans = {
  currency: string;
};

export type IGetSchoolBillInfo = {
  billerCode: string;
};

export type IVerifySchoolBillerNumber = {
  billerCode: string;
  itemCode: string;
  customerId: string;
};

export type IPaySchool = {
  itemCode: string;
  billerCode: string;
  billerNumber: string;
  currency: string;
  amount: number;
  walletPin: string;
  addBeneficiary?: boolean;
};








