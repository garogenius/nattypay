/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvestmentRequest,
  getInvestmentsRequest,
  getInvestmentByIdRequest,
  payoutInvestmentRequest,
} from "./investments.apis";
import { Investment } from "./investments.types";

export const useCreateInvestment = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvestmentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetInvestments = () => {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["investments"],
    queryFn: getInvestmentsRequest,
  });

  // Ensure investments is always an array
  const investmentsData = data?.data?.data;
  const investments: Investment[] = Array.isArray(investmentsData) ? investmentsData : [];

  return { investments, isPending, isError, refetch };
};

export const useGetInvestmentById = (investmentId: string | null) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["investment", investmentId],
    queryFn: () => getInvestmentByIdRequest(investmentId!),
    enabled: !!investmentId,
  });

  const investment: Investment | null = data?.data?.data || null;

  return { investment, isPending, isError };
};

export const usePayoutInvestment = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ investmentId, formdata }: { investmentId: string; formdata: any }) =>
      payoutInvestmentRequest(investmentId, formdata),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["investment"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess(data);
    },
  });
};











