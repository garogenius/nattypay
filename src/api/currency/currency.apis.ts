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
  // Debug: Log the request details
  if (process.env.NODE_ENV === 'development') {
    console.log('createCardRequest:', {
      url: "/currency/cards",
      method: "post",
      data: formdata,
      fullPayload: JSON.stringify(formdata),
    });
  }
  
  // Try the endpoint as documented: /api/v1/currency/cards
  // If that doesn't work, the backend might expect a different path
  try {
    return await request({
      url: "/currency/cards",
      method: "post",
      data: formdata,
    });
  } catch (error: any) {
    // Enhanced error logging for debugging
    if (process.env.NODE_ENV === 'development') {
      // Log the most important information first
      console.group('🔍 createCardRequest Error Details');
      console.log('Status:', error?.response?.status);
      console.log('Status Text:', error?.response?.statusText);
      console.log('Response Data:', error?.response?.data);
      console.log('Request URL:', error?.config?.baseURL + error?.config?.url);
      console.log('Request Method:', error?.config?.method);
      console.log('Request Payload:', formdata);
      console.log('Error Message:', error?.message);
      console.log('Error Code:', error?.code);
      console.groupEnd();
    }
    
    // Always log the response data for 400 errors to help debug
    if (error?.response?.status === 400) {
      const responseData = error.response.data;
      console.warn('⚠️ 400 Bad Request - Server Response:', {
        statusCode: responseData?.statusCode,
        message: responseData?.message,
        error: responseData?.error,
        path: responseData?.path,
        fullResponse: responseData,
      });
    }
    
    throw error;
  }
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





