import { request } from "@/utils/axios-utils";
import { IGCPayload, IGetGCFxRate } from "./gift-card.types";

export const getGCCategoriesRequest = async () => {
  return request({
    url: `/bill/giftcard/get-categories`,
    method: "get",
  });
};

export const getGCProductsByCurrencyRequest = async ({
  currency,
}: {
  currency: string;
}) => {
  return request({
    url: `/bill/giftcard/get-product?currency=${currency}`,
    method: "get",
  });
};

export const getGCRedeemCodeRequest = async ({
  transactionId,
}: {
  transactionId: number;
}) => {
  return request({
    url: `/bill/giftcard/get-redeem-code?transactionId=${transactionId}`,
    method: "get",
  });
};

export const gcPaymentRequest = async (formdata: IGCPayload) => {
  return request({
    url: `/bill/giftcard/pay`,
    method: "post",
    data: formdata,
  });
};

export const getGCFxRateRequest = async (formdata: IGetGCFxRate) => {
  return request({
    url: `/bill/giftcard/get-fx-rate?amount=${formdata.amount}&currency=${formdata.currency}`,
    method: "get",
  });
};
