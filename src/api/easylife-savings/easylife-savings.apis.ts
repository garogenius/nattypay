import { request } from "@/utils/axios-utils";
import { ICreateEasyLifePlan, IFundEasyLifePlan } from "./easylife-savings.types";

export const createEasyLifePlanRequest = async (formdata: ICreateEasyLifePlan) => {
  return request({
    url: "/easylife-savings/plans",
    method: "post",
    data: formdata,
  });
};

export const getEasyLifePlansRequest = async () => {
  return request({
    url: "/easylife-savings/plans",
    method: "get",
  });
};

export const getEasyLifePlanByIdRequest = async (planId: string) => {
  return request({
    url: `/easylife-savings/plans/${planId}`,
    method: "get",
  });
};

export const fundEasyLifePlanRequest = async (formdata: IFundEasyLifePlan) => {
  return request({
    url: "/easylife-savings/plans/fund",
    method: "post",
    data: formdata,
  });
};

export const withdrawEasyLifePlanRequest = async (planId: string) => {
  return request({
    url: `/easylife-savings/plans/${planId}/withdraw`,
    method: "post",
  });
};






























































































