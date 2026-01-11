import { request } from "@/utils/axios-utils";
import {
  IBvnFaceVerification,
  IInitiateBvnVerification,
  IInitiateTransfer,
  IValidateBvnVerification,
  IVerifyAccount,
  IDecodeQRCode,
  IGenerateQRCode,
} from "./wallet.types";
import {
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "@/constants/types";

export const initiateBvnVerificationRequest = async (
  formdata: IInitiateBvnVerification
) => {
  return request({
    url: "/wallet/initiate-bvn-verification",
    method: "post",
    data: formdata,
  });
};

export const validateBvnVerificationRequest = async (
  formdata: IValidateBvnVerification
) => {
  return request({
    url: "/wallet/validate-bvn-verification",
    method: "post",
    data: formdata,
  });
};

export const verifyAccountRequest = async (formdata: IVerifyAccount) => {
  return request({
    url: "/wallet/verify-account",
    method: "post",
    data: formdata,
  });
};

export const initiateTransferRequest = async (formdata: IInitiateTransfer) => {
  return request({
    url: "/wallet/initiate-transfer",
    method: "post",
    data: formdata,
  });
};

export const getAllBanks = () => {
  return request({ url: `/wallet/get-banks/NGN` });
};

export const getMatchedBanksRequest = (accountNumber: string) => {
  const base =
    (process.env.NEXT_PUBLIC_VALAR_PAY_API_BASE_URL ||
      "https://valar-pay-api.up.railway.app/api/v1"
    ).replace(/\/$/, "");

  // This endpoint uses a separate base URL from the rest of the app.
  // Using an absolute URL keeps the existing axios interceptors/headers (API key, token) intact.
  return request({
    url: `${base}/wallet/get-matched-banks/${accountNumber}`,
    method: "get",
  });
};

export const getTransferFee = ({
  currency,
  amount,
}: {
  currency: string;
  amount: number;
}) => {
  return request({
    url: `/wallet/get-transfer-fee?currency=${currency}&amount=${amount}`,
  });
};

export const getTransactions = ({
  page,
  limit,
  search,
  type,
  category,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  type?: TRANSACTION_TYPE;
  category?: TRANSACTION_CATEGORY;
  status?: TRANSACTION_STATUS;
}) => {
  const queryParams = new URLSearchParams();
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  if (search) queryParams.set("search", search);
  if (type) queryParams.set("type", type);
  if (category) queryParams.set("category", category);
  if (status) queryParams.set("status", status);
  return request({
    url: `/wallet/transaction?${queryParams.toString()}`,
  });
};

export const generateQRCodeRequest = async (params: IGenerateQRCode) => {
  return request({
    url: `/wallet/generate-qrcode?amount=${params.amount}`,
    method: "get",
  });
};

export const decodeQRCodeRequest = async (formdata: IDecodeQRCode) => {
  return request({
    url: "/wallet/decode-qrcode",
    method: "post",
    data: formdata,
  });
};

export const bvnFaceVerificationRequest = async (
  formdata: IBvnFaceVerification
) => {
  return request({
    url: "/wallet/bvn-verification",
    method: "post",
    data: formdata,
  });
};
