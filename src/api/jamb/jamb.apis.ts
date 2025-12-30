import { request } from "@/utils/axios-utils";
import {
  IGetJambPlans,
  IGetJambBillInfo,
  IVerifyJambBillerNumber,
  IPayJamb,
} from "./jamb.types";

export const getJambPlansRequest = async () => {
  return request({
    url: `/bill/jamb/get-plan`,
    method: "get",
  });
};

export const getJambBillInfoRequest = async (formdata: IGetJambBillInfo) => {
  return request({
    url: `/bill/jamb/get-bill-info?billerCode=${formdata.billerCode}`,
    method: "get",
  });
};

export const verifyJambBillerNumberRequest = async (
  formdata: IVerifyJambBillerNumber
) => {
  return request({
    url: `/bill/jamb/verify-biller-number`,
    method: "post",
    data: formdata,
  });
};

export const jambPaymentRequest = async (formdata: IPayJamb) => {
  return request({
    url: `/bill/jamb/pay`,
    method: "post",
    data: formdata,
  });
};








