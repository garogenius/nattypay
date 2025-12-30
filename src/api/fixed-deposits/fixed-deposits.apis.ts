import { request } from "@/utils/axios-utils";
import {
  ICreateFixedDeposit,
  IFixedDepositEarlyWithdrawal,
  IFixedDepositRollover,
} from "./fixed-deposits.types";

export const createFixedDepositRequest = async (
  formdata: ICreateFixedDeposit
) => {
  return request({
    url: "/fixed-deposits",
    method: "post",
    data: formdata,
  });
};

export const getFixedDepositsRequest = async () => {
  return request({
    url: "/fixed-deposits",
    method: "get",
  });
};

export const getFixedDepositByIdRequest = async (fixedDepositId: string) => {
  return request({
    url: `/fixed-deposits/${fixedDepositId}`,
    method: "get",
  });
};

export const getFixedDepositPlansRequest = async () => {
  return request({
    url: "/fixed-deposits/plans",
    method: "get",
  });
};

export const payoutFixedDepositRequest = async (fixedDepositId: string) => {
  return request({
    url: `/fixed-deposits/${fixedDepositId}/payout`,
    method: "post",
  });
};

export const earlyWithdrawFixedDepositRequest = async (formdata: IFixedDepositEarlyWithdrawal) => {
  return request({
    url: "/fixed-deposits/early-withdrawal",
    method: "post",
    data: formdata,
  });
};

export const rolloverFixedDepositRequest = async (formdata: IFixedDepositRollover) => {
  return request({
    url: "/fixed-deposits/rollover",
    method: "post",
    data: formdata,
  });
};



















