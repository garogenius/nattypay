import { request } from "@/utils/axios-utils";
import {
  ICreateCurrencyAccount,
  ICreateCard,
  IFundCard,
  ISetCardLimits,
  IWithdrawCard,
  IConvertCurrency,
} from "./currency.types";

// Currency Accounts APIs
export const createCurrencyAccountRequest = async (
  formdata: ICreateCurrencyAccount
) => {
  return request({
    url: "/currency/accounts",
    method: "post",
    data: formdata,
  });
};

export const getCurrencyAccountsRequest = async () => {
  return request({
    url: "/currency/accounts",
    method: "get",
  });
};

export const getCurrencyAccountByCurrencyRequest = async (
  currency: string
) => {
  return request({
    url: `/currency/accounts/${currency}`,
    method: "get",
  });
};

// Virtual Cards APIs
export const createCardRequest = async (formdata: ICreateCard) => {
  return request({
    url: "/currency/cards",
    method: "post",
    data: formdata,
  });
};

export const getCardsRequest = async () => {
  return request({
    url: "/currency/cards",
    method: "get",
  });
};

export const getCardByIdRequest = async (cardId: string) => {
  return request({
    url: `/currency/cards/${cardId}`,
    method: "get",
  });
};

export const fundCardRequest = async (cardId: string, formdata: IFundCard) => {
  return request({
    url: `/currency/cards/${cardId}/fund`,
    method: "post",
    data: formdata,
  });
};

export const freezeCardRequest = async (cardId: string) => {
  return request({
    url: `/currency/cards/${cardId}/freeze`,
    method: "patch",
  });
};

export const unfreezeCardRequest = async (cardId: string) => {
  return request({
    url: `/currency/cards/${cardId}/unfreeze`,
    method: "patch",
  });
};

export const setCardLimitsRequest = async (
  cardId: string,
  formdata: ISetCardLimits
) => {
  return request({
    url: `/currency/cards/${cardId}/limits`,
    method: "put",
    data: formdata,
  });
};

export const blockCardRequest = async (cardId: string) => {
  return request({
    url: `/currency/cards/${cardId}/block`,
    method: "post",
  });
};

export const closeCardRequest = async (cardId: string) => {
  return request({
    url: `/currency/cards/${cardId}/close`,
    method: "post",
  });
};

export const withdrawCardRequest = async (
  cardId: string,
  formdata: IWithdrawCard
) => {
  return request({
    url: `/currency/cards/${cardId}/withdraw`,
    method: "post",
    data: formdata,
  });
};

export const getCardTransactionsRequest = async (
  cardId: string,
  params?: { page?: number; limit?: number }
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  const queryString = queryParams.toString();
  return request({
    url: `/currency/cards/${cardId}/transactions${queryString ? `?${queryString}` : ""}`,
    method: "get",
  });
};

// Currency Conversion APIs
export const convertCurrencyRequest = async (formdata: IConvertCurrency) => {
  return request({
    url: "/currency/convert",
    method: "post",
    data: formdata,
  });
};

export const getCurrencyRatesRequest = async (params?: {
  from?: string;
  to?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.from) queryParams.set("from", params.from);
  if (params?.to) queryParams.set("to", params.to);
  const queryString = queryParams.toString();
  return request({
    url: `/currency/rates${queryString ? `?${queryString}` : ""}`,
    method: "get",
  });
};

export const getSupportedCurrenciesRequest = async () => {
  return request({
    url: "/currency/supported",
    method: "get",
  });
};





