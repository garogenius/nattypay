import { request } from "@/utils/axios-utils";
import {
  IBettingPlatform,
  IFundBettingPlatform,
  IFundBettingWallet,
  IWithdrawBettingWallet,
  IBettingWallet,
  IBettingTransaction,
} from "./betting.types";

export const getBettingPlatformsRequest = async (): Promise<{
  data: { data: IBettingPlatform[] };
}> => {
  return request({
    url: `/betting/platforms`,
    method: "get",
  });
};

export const getBettingWalletRequest = async (): Promise<{
  data: { data: IBettingWallet };
}> => {
  return request({
    url: `/betting/wallet`,
    method: "get",
  });
};

export const fundBettingPlatformRequest = async (
  formdata: IFundBettingPlatform
): Promise<{ data: any }> => {
  return request({
    url: `/betting/platforms/fund`,
    method: "post",
    data: formdata,
  });
};

export const fundBettingWalletRequest = async (
  formdata: IFundBettingWallet
): Promise<{ data: any }> => {
  return request({
    url: `/betting/wallet/fund`,
    method: "post",
    data: formdata,
  });
};

export const withdrawBettingWalletRequest = async (
  formdata: IWithdrawBettingWallet
): Promise<{ data: any }> => {
  return request({
    url: `/betting/wallet/withdraw`,
    method: "post",
    data: formdata,
  });
};

export const getBettingWalletTransactionsRequest = async (params?: {
  limit?: number;
}): Promise<{ data: { data: IBettingTransaction[] } }> => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  const queryString = queryParams.toString();
  return request({
    url: `/betting/wallet/transactions${queryString ? `?${queryString}` : ""}`,
    method: "get",
  });
};
























































































































