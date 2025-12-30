/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFixedDepositRequest,
  getFixedDepositsRequest,
  getFixedDepositByIdRequest,
  getFixedDepositPlansRequest,
  earlyWithdrawFixedDepositRequest,
  rolloverFixedDepositRequest,
  payoutFixedDepositRequest,
} from "./fixed-deposits.apis";
import { FixedDeposit, FixedDepositPlan } from "./fixed-deposits.types";

export const useCreateFixedDeposit = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFixedDepositRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetFixedDeposits = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["fixed-deposits"],
    queryFn: getFixedDepositsRequest,
  });

  // Ensure fixed deposits is always an array
  const fixedDepositsData = data?.data?.data;
  const fixedDeposits: FixedDeposit[] = Array.isArray(fixedDepositsData) ? fixedDepositsData : [];

  return { fixedDeposits, isPending, isError, refetch };
};

export const useGetFixedDepositPlans = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["fixed-deposit-plans"],
    queryFn: getFixedDepositPlansRequest,
  });

  const plansData = data?.data?.data;
  const plans: FixedDepositPlan[] = Array.isArray(plansData) ? plansData : [];
  return { plans, isPending, isError, refetch };
};

export const useGetFixedDepositById = (fixedDepositId: string | null) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["fixed-deposit", fixedDepositId],
    queryFn: () => getFixedDepositByIdRequest(fixedDepositId!),
    enabled: !!fixedDepositId,
  });

  const fixedDeposit: FixedDeposit | null = data?.data?.data || null;

  return { fixedDeposit, isPending, isError };
};

export const usePayoutFixedDeposit = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fixedDepositId }: { fixedDepositId: string }) =>
      payoutFixedDepositRequest(fixedDepositId),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["fixed-deposit"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useEarlyWithdrawFixedDeposit = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: earlyWithdrawFixedDepositRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["fixed-deposit"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useRolloverFixedDeposit = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolloverFixedDepositRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["fixed-deposit"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};



















