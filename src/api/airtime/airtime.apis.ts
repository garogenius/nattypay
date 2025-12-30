import { request } from "@/utils/axios-utils";
import {
  IAirtimePayPayload,
  IAirtimePlan,
  IAirtimeVariation,
  IInternationalAirtimeFxRate,
  IInternationalAirtimePlan,
  IInternationalAirtimePayPayload,
} from "./airtime.types";

export const airtimePlanRequest = async (formdata: IAirtimePlan) => {
  return request({
    url: `/bill/airtime/get-plan?phone=${formdata.phone}&currency=${formdata.currency}`,
    method: "get",
  });
};

export const airtimeVariationRequest = async (formdata: IAirtimeVariation) => {
  return request({
    url: `/bill/airtime/get-variation?operatorId=${formdata.operatorId}`,
    method: "get",
  });
};

export const airtimePaymentRequest = async (formdata: IAirtimePayPayload) => {
  return request({
    url: `/bill/airtime/pay`,
    method: "post",
    data: formdata,
  });
};

export const airtimeNetworkProviderRequest = async () => {
  return request({
    url: `/bill/airtime/network-providers`,
    method: "get",
  });
};

export const internationalAirtimePlanRequest = async (
  formdata: IInternationalAirtimePlan
) => {
  return request({
    url: `/bill/airtime/international/get-plan?phone=${formdata.phone}`,
    method: "get",
  });
};

export const internationalAirtimeFxRateRequest = async (
  formdata: IInternationalAirtimeFxRate
) => {
  return request({
    url: `/bill/airtime/international/get-fx-rate?amount=${formdata.amount}&operatorId=${formdata.operatorId}`,
    method: "get",
  });
};

export const internationalAirtimePaymentRequest = async (
  formdata: IInternationalAirtimePayPayload
) => {
  return request({
    url: `/bill/airtime/international/pay`,
    method: "post",
    data: formdata,
  });
};
