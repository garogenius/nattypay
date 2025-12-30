import { request } from "@/utils/axios-utils";
import {
  IGetSchoolPlans,
  IGetSchoolBillInfo,
  IVerifySchoolBillerNumber,
  IPaySchool,
} from "./school.types";

export const getSchoolPlansRequest = async (formdata: IGetSchoolPlans) => {
  return request({
    url: `/bill/school/get-plan?currency=${formdata.currency}`,
    method: "get",
  });
};

export const getSchoolBillInfoRequest = async (formdata: IGetSchoolBillInfo) => {
  return request({
    url: `/bill/school/get-bill-info?billerCode=${formdata.billerCode}`,
    method: "get",
  });
};

export const verifySchoolBillerNumberRequest = async (
  formdata: IVerifySchoolBillerNumber
) => {
  return request({
    url: `/bill/school/verify-biller-number`,
    method: "post",
    data: formdata,
  });
};

export const schoolPaymentRequest = async (formdata: IPaySchool) => {
  return request({
    url: `/bill/school/pay`,
    method: "post",
    data: formdata,
  });
};








