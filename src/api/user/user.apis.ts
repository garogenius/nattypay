import { request } from "@/utils/axios-utils";
import axios from "axios";
import {
  IChangePassword,
  IChangePasswordWithOtp,
  IChangePasscode,
  IChangePin,
  ICreateAccount,
  ICreateBusinessAccount,
  ICreateForeignAccount,
  ICreateOvalPerson,
  ICreatePin,
  IRequestChangePassword,
  IResetPin,
  ITier2Verification,
  ITier3Verification,
  IValidatePhoneNumber,
  IVerifyNin,
  IVerifyPhoneNumber,
  IVerifyWalletPin,
} from "./user.types";
import { BENEFICIARY_TYPE, BILL_TYPE, TRANSFER_TYPE } from "@/constants/types";

export const getUser = () => {
  return request({ url: `/user/me` });
};

export const updateUserRequest = async (formData: FormData) => {
  return request({
    url: "/user/edit-profile",
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data", // Important for file upload
    },
  });
};

export const createPinRequest = async (formdata: ICreatePin) => {
  return request({
    url: "/user/set-wallet-pin",
    method: "post",
    data: formdata,
  });
};

export const resetOtpRequest = async () => {
  return request({
    url: "/user/forget-pin",
    method: "post",
  });
};

export const resetPinRequest = async (formdata: IResetPin) => {
  return request({
    url: "/user/reset-pin",
    method: "post",
    data: formdata,
  });
};

export const changePasswordRequest = async (formdata: IChangePassword) => {
  return request({
    url: "/user/change-password",
    method: "put",
    data: formdata,
  });
};

export const reportScamRequest = async (formdata: FormData) => {
  return request({
    url: "/user/report-scam",
    method: "post",
    data: formdata,
  });
};

export const tier2VerificationRequest = async (
  formdata: ITier2Verification
) => {
  return request({
    url: "/user/kyc-tier2",
    method: "post",
    data: formdata,
  });
};

export const tier3VerificationRequest = async (
  formdata: ITier3Verification
) => {
  return request({
    url: "/user/kyc-tier3",
    method: "post",
    data: formdata,
  });
};

export const getBeneficiariesRequest = async ({
  category,
  transferType,
  billType,
}: {
  category: BENEFICIARY_TYPE;
  transferType?: TRANSFER_TYPE;
  billType?: BILL_TYPE;
}) => {
  const url =
    `/user/get-beneficiaries?category=${category}` +
    (transferType ? `&transferType=${transferType}` : "") +
    (billType ? `&billType=${billType}` : "");
  return request({ url });
};

export const validatePhoneNumberRequest = async (
  formdata: IValidatePhoneNumber
) => {
  return request({
    url: "/user/validate-phoneNumber",
    method: "post",
    data: formdata,
  });
};

export const verifyPhoneNumberRequest = async (
  formdata: IVerifyPhoneNumber
) => {
  return request({
    url: "/user/verify-phoneNumber",
    method: "post",
    data: formdata,
  });
};

export const verifyNinRequest = async (formdata: IVerifyNin) => {
  return request({
    url: "/user/verify-nin",
    method: "post",
    data: formdata,
  });
};

// Password Change with OTP
export const requestChangePasswordRequest = async (formdata: IRequestChangePassword) => {
  const queryParams = new URLSearchParams();
  queryParams.set("email", formdata.email);
  return request({
    url: `/user/request-change-password?${queryParams.toString()}`,
    method: "get",
  });
};

export const changePasswordWithOtpRequest = async (formdata: IChangePasswordWithOtp) => {
  return request({
    url: "/user/change-password",
    method: "put",
    data: formdata,
  });
};

// Login Passcode (6-digit)
export const changePasscodeRequest = async (formdata: IChangePasscode) => {
  return request({
    url: "/user/change-passcode",
    method: "put",
    data: formdata,
  });
};

// Wallet PIN
export const verifyWalletPinRequest = async (formdata: IVerifyWalletPin) => {
  return request({
    url: "/user/verify-wallet-pin",
    method: "post",
    data: formdata,
  });
};

export const changePinRequest = async (formdata: IChangePin) => {
  return request({
    url: "/user/change-pin",
    method: "put",
    data: formdata,
  });
};

// Account Creation
export const createAccountRequest = async (formdata: ICreateAccount) => {
  return request({
    url: "/user/create-account",
    method: "post",
    data: formdata,
  });
};

export const createBusinessAccountRequest = async (formdata: ICreateBusinessAccount) => {
  return request({
    url: "/user/create-business-account",
    method: "post",
    data: formdata,
  });
};

export const createForeignAccountRequest = async (formdata: ICreateForeignAccount) => {
  return request({
    url: "/user/create-foreign-account",
    method: "post",
    data: formdata,
  });
};

// Delete Account
export const deleteAccountRequest = async (userId: string) => {
  return request({
    url: `/user/${userId}`,
    method: "delete",
  });
};

// User Statistics
export const getUserStatisticsLineChartRequest = async (params?: { period?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.set("period", params.period);
  const queryString = queryParams.toString();
  return request({
    url: `/user/statistics-line-chart${queryString ? `?${queryString}` : ""}`,
    method: "get",
  });
};

export const getUserStatisticsPieChartRequest = async (params?: { period?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.period) queryParams.set("period", params.period);
  const queryString = queryParams.toString();
  return request({
    url: `/user/statistics-pie-chart${queryString ? `?${queryString}` : ""}`,
    method: "get",
  });
};

// KYC Document Upload
export const uploadDocumentRequest = async (formData: FormData) => {
  return request({
    url: "/user/upload-document",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data", // Important for file upload
    },
  });
};

// Oval Person API
export const createOvalPersonRequest = async (data: ICreateOvalPerson) => {
  // This is an external API call, so we use axios directly instead of the request utility
  const ovalApiUrl = process.env.NEXT_PUBLIC_OVAL_API_URL || "https://api.useoval.com";
  
  return axios({
    url: `${ovalApiUrl}/person`,
    method: "post",
    data,
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      // Add authorization if needed
      // "Authorization": `Bearer ${token}`,
    },
  });
};
