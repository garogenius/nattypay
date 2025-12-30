import { request } from "@/utils/axios-utils";
import {
  IGetWaecPlans,
  IGetWaecBillInfo,
  IVerifyWaecBillerNumber,
  IPayWaec,
} from "./waec.types";

export const getWaecPlansRequest = async () => {
  return request({
    url: `/bill/waec/get-plan`,
    method: "get",
  });
};

export const getWaecBillInfoRequest = async (formdata: IGetWaecBillInfo) => {
  return request({
    url: `/bill/waec/get-bill-info?billerCode=${formdata.billerCode}`,
    method: "get",
  });
};

export const verifyWaecBillerNumberRequest = async (
  formdata: IVerifyWaecBillerNumber
) => {
  return request({
    url: `/bill/waec/verify-biller-number`,
    method: "post",
    data: formdata,
  });
};

export const waecPaymentRequest = async (formdata: IPayWaec) => {
  return request({
    url: `/bill/waec/pay`,
    method: "post",
    data: formdata,
  });
};








