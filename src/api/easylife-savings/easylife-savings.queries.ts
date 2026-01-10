/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEasyLifePlanRequest,
  fundEasyLifePlanRequest,
  getEasyLifePlanByIdRequest,
  getEasyLifePlansRequest,
  withdrawEasyLifePlanRequest,
} from "./easylife-savings.apis";
import { EasyLifePlan } from "./easylife-savings.types";

export const useCreateEasyLifePlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEasyLifePlanRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["easylife-plans"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetEasyLifePlans = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["easylife-plans"],
    queryFn: getEasyLifePlansRequest,
  });

  const plansData = data?.data?.data;
  const plans: EasyLifePlan[] = Array.isArray(plansData) ? plansData : [];

  return { plans, isPending, isError, refetch };
};

export const useGetEasyLifePlanById = (planId: string | null) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["easylife-plan", planId],
    queryFn: () => getEasyLifePlanByIdRequest(planId!),
    enabled: !!planId,
  });

  const plan: EasyLifePlan | null = data?.data?.data || null;
  return { plan, isPending, isError };
};

export const useFundEasyLifePlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundEasyLifePlanRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["easylife-plans"] });
      queryClient.invalidateQueries({ queryKey: ["easylife-plan"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useWithdrawEasyLifePlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId }: { planId: string }) => withdrawEasyLifePlanRequest(planId),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["easylife-plans"] });
      queryClient.invalidateQueries({ queryKey: ["easylife-plan"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};




































































































