import { request } from "@/utils/axios-utils";
import {
  IGetEducationBillers,
  IGetEducationBillerItems,
  IVerifyEducationCustomer,
  IPayEducation,
} from "./education.types";

export const getEducationBillersRequest = async () => {
  return request({
    url: `/bill/education/billers`,
    method: "get",
  });
};

export const getEducationBillerItemsRequest = async (
  formdata: IGetEducationBillerItems
) => {
  return request({
    url: `/bill/education/biller-items?billerCode=${formdata.billerCode}`,
    method: "get",
  });
};

export const verifyEducationCustomerRequest = async (
  formdata: IVerifyEducationCustomer
) => {
  return request({
    url: `/bill/education/verify-customer`,
    method: "post",
    data: formdata,
  });
};

export const payEducationRequest = async (formdata: IPayEducation) => {
  return request({
    url: `/bill/education/school-fee/pay`,
    method: "post",
    data: formdata,
  });
};






