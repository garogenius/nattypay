export interface IInitiateBvnVerification {
  bvn: string;
}

export interface IValidateBvnVerification {
  verificationId: string;
  isBusiness:boolean
  otpCode: string;
}

export interface IVerifyAccount {
  accountNumber: string;
  bankCode?: string;
}

export interface IMatchedBank {
  bankCode: string;
  name: string;
}

export interface IInitiateTransfer {
  accountNumber: string;
  accountName: string;
  sessionId: string;
  bankCode: string;
  amount: number;
  description?: string;
  currency: string;
  walletPin: string;
  addBeneficiary?: boolean;
}

export interface IBvnFaceVerification {
  bvn: string;
  selfieImage: string; // Base64 encoded image with data URI prefix (data:image/jpeg;base64,...)
}

// QR Code Types
export interface IDecodeQRCode {
  qrCode: string;
}

export interface IQRCodeDecoded {
  accountNumber: string;
  accountName: string;
  amount?: number;
  currency: string;
  bankCode: string;
}

export interface IGenerateQRCode {
  amount: number;
}
