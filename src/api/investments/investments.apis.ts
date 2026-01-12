import { request } from "@/utils/axios-utils";
import {
  ICreateInvestment,
  IPayoutInvestment,
} from "./investments.types";

export const createInvestmentRequest = async (
  formdata: ICreateInvestment
) => {
  return request({
    url: "/investments",
    method: "post",
    data: formdata,
  });
};

export const getInvestmentsRequest = async () => {
  return request({
    url: "/investments",
    method: "get",
  });
};

export const getInvestmentByIdRequest = async (investmentId: string) => {
  return request({
    url: `/investments/${investmentId}`,
    method: "get",
  });
};

export const payoutInvestmentRequest = async (
  investmentId: string,
  formdata: IPayoutInvestment
) => {
  return request({
    url: `/investments/${investmentId}/payout`,
    method: "post",
    data: formdata,
  });
};









































































































































