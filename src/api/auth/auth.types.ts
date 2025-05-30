export interface ILogin {
  email: string;
  password: string;
  ipAddress: string;
  deviceName: string;
  operatingSystem: string;
}

export interface IRegister {
  email: string;
  password: string;
  username: string;
  fullname: string;
  referralCode?: string;
  dateOfBirth: string;
  countryCode: string;
}


export interface IBusinessRegister {
  email: string;
  password: string;
  username: string;
  fullname: string;
  companyRegistrationNumber:string;
  accountType: string;
  referralCode?: string;
  dateOfBirth: string;
  countryCode: string;
}

export interface IVerifyEmail {
  email: string;
  otpCode: string;
}

export interface IResendVerificationCode {
  email: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  email: string;
  password: string;
  confirmPassword: string;
}
