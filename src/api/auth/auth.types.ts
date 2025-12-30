export interface ILogin {
  identifier: string; // email or phone
  password: string;
  ipAddress: string;
  deviceName: string;
  operatingSystem: string;
}

export interface IRegister {
  username: string;
  fullname: string;
  email?: string; // Optional - use when registering with email
  phoneNumber?: string; // Optional - use when registering with phone (format: "+2348012345678")
  password: string;
  dateOfBirth: string; // Format: "15-Jan-1990"
  currency: string; // "NGN", "USD", "EUR", "GBP"
  accountType: "PERSONAL";
}

export interface IBusinessRegister {
  username: string;
  fullname: string;
  email?: string; // Optional - use when registering with email
  phoneNumber?: string; // Optional - use when registering with phone (format: "+2348012345678")
  password: string;
  dateOfBirth: string; // Format: "15-Jan-1990"
  companyRegistrationNumber: string;
  currency: string; // "NGN", "USD", "EUR", "GBP"
  accountType: "BUSINESS";
}

export interface IVerifyEmail {
  email: string;
  otpCode: string;
}

export interface IResendVerificationCode {
  email: string;
}

export interface IVerifyEmailPreRegister {
  email: string;
  otpCode: string;
}

export interface IResendVerifyEmailPreRegister {
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

export interface IBiometricLogin {
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
  userHandle?: string;
}

export interface IBiometricChallenge {
  challenge: string; // Base64 encoded challenge from backend
  credentialId?: string; // Optional: specific credential ID to use
}

export interface IBiometricRegister {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
}

export interface ICreatePasscode {
  passcode: string; // 6-digit passcode
}

export interface IPasscodeLogin {
  identifier: string; // email or phone
  passcode: string; // 6-digit passcode
  ipAddress: string;
  deviceName: string;
  operatingSystem: string;
}

export interface IVerify2FA {
  email: string; // User's email address
  otpCode: string; // 6-digit OTP code
}

export interface IResend2faEmail {
  email: string; // User's email address
}

export interface IVerifyContact {
  identifier: string; // email or phone number
  otpCode: string; // 6-digit OTP code
}

export interface IResendVerifyContact {
  identifier: string; // email or phone number
}
