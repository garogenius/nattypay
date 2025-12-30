import { request } from "@/utils/axios-utils";
import {
  IBvnFaceVerification,
  IInitiateBvnVerification,
  IInitiateTransfer,
  IValidateBvnVerification,
  IVerifyAccount,
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

export const getQrCode = ({ amount }: { amount: number }) => {
  return request({
    url: `/wallet/generate-qrcode?amount=${amount}`,
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
