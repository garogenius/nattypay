export interface IUpdateUser {
  fullname: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface IUpdateUserCurrency {
  currency: string;
}

export interface ICreatePin {
  pin: string;
}

export interface IResetPin {
  pin: string;
  confirmPin: string;
  otpCode: string;
}

export interface IChangePassword {
  oldPassword: string;
  newPassword: string;
}

export interface IReportScam {
  title: string;
  description: string;
}

export interface ITier2Verification {
  nin: string;
  // selfieImage: string;
}

export interface ITier3Verification {
  city: string;
  state: string;
  address: string;
}

export interface IVerifyPhoneNumber {
  email: string;
  otp: string;
}

export interface IValidatePhoneNumber {
  email: string;
  phoneNumber: string;
}

export interface IVerifyNin {
  nin: string;
}

// Password Change with OTP
export interface IRequestChangePassword {
  email: string;
}

export interface IChangePasswordWithOtp {
  email: string;
  otp: string;
  newPassword: string;
}

// Login Passcode (6-digit)
export interface IChangePasscode {
  currentPasscode: string;
  newPasscode: string;
}

// Wallet PIN
export interface IVerifyWalletPin {
  pin: string;
}

export interface IChangePin {
  currentPin: string;
  newPin: string;
}

// Account Creation
export interface ICreateAccount {
  accountType?: "PERSONAL" | "BUSINESS";
  currency?: string;
}

export interface ICreateBusinessAccount {
  businessName: string;
  businessType: string;
  registrationNumber?: string;
}

export interface ICreateForeignAccount {
  currency: "USD" | "EUR" | "GBP";
  label: string;
}

// User Statistics
export interface IUserStatisticsLineChart {
  labels: string[];
  values: number[];
  period?: string;
}

export interface IUserStatisticsPieChart {
  categories: string[];
  amounts: number[];
  period?: string;
}

// Oval Person API Types
export interface IOvalAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface IOvalBackgroundInformation {
  employment_status: string;
  occupation: string;
  primary_purpose: string;
  source_of_funds: string;
  expected_monthly_inflow: number;
}

export interface IOvalDocument {
  type: string;
  url: string;
  issue_date: string;
  expiry_date: string;
}

export interface ICreateOvalPerson {
  id_level: "primary" | "secondary";
  id_type?: "passport" | "drivers_license" | "national_id";
  kyc_level?: "basic" | "enhanced";
  name_first: string;
  name_last: string;
  name_other?: string;
  phone: string;
  email: string;
  dob: string; // YYYY-MM-DD
  id_number: string;
  id_country: string;
  bank_id_number?: string; // BVN
  address: IOvalAddress;
  background_information?: IOvalBackgroundInformation;
  documents?: IOvalDocument[];
}

// KYC Document Upload
export interface IUploadDocument {
  documentType: "passport" | "bank_statement" | "utility_bill" | "proof_of_address";
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  file: File;
}
