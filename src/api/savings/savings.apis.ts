import { request } from "@/utils/axios-utils";
import {
  ICreateSavingsPlan,
  IFundSavingsPlan,
} from "./savings.types";

export const createSavingsPlanRequest = async (
  formdata: ICreateSavingsPlan
) => {
  return request({
    url: "/savings/plans",
    method: "post",
    data: formdata,
  });
};

export const getSavingsPlansRequest = async () => {
  return request({
    url: "/savings/plans",
    method: "get",
  });
};

export const getSavingsPlanByIdRequest = async (planId: string) => {
  return request({
    url: `/savings/plans/${planId}`,
    method: "get",
  });
};

export const fundSavingsPlanRequest = async (formdata: IFundSavingsPlan) => {
  return request({
    url: "/savings/plans/fund",
    method: "post",
    data: formdata,
  });
};

export const withdrawSavingsPlanRequest = async (planId: string) => {
  return request({
    url: `/savings/plans/${planId}/withdraw`,
    method: "post",
  });
};


