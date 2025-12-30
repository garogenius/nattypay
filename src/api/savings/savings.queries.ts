/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSavingsPlanRequest,
  fundSavingsPlanRequest,
  getSavingsPlanByIdRequest,
  getSavingsPlansRequest,
  withdrawSavingsPlanRequest,
} from "./savings.apis";
import { SavingsPlan } from "./savings.types";

export const useCreateSavingsPlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavingsPlanRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-plans"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetSavingsPlans = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["savings-plans"],
    queryFn: getSavingsPlansRequest,
  });

  // Ensure plans is always an array
  const plansData = data?.data?.data;
  const plans: SavingsPlan[] = Array.isArray(plansData) ? plansData : [];

  return { plans, isPending, isError, refetch };
};

export const useGetSavingsPlanById = (planId: string | null) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["savings-plan", planId],
    queryFn: () => getSavingsPlanByIdRequest(planId!),
    enabled: !!planId,
  });

  const plan: SavingsPlan | null = data?.data?.data || null;

  return { plan, isPending, isError };
};

export const useFundSavingsPlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundSavingsPlanRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-plans"] });
      queryClient.invalidateQueries({ queryKey: ["savings-plan"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};

export const useWithdrawSavingsPlan = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId }: { planId: string }) => withdrawSavingsPlanRequest(planId),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-plans"] });
      queryClient.invalidateQueries({ queryKey: ["savings-plan"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};


