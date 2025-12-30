/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWaecPlansRequest,
  getWaecBillInfoRequest,
  verifyWaecBillerNumberRequest,
  waecPaymentRequest,
} from "./waec.apis";
import {
  IGetWaecBillInfo,
  IVerifyWaecBillerNumber,
} from "./waec.types";

export const useGetWaecPlans = () => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["waec-plan"],
    queryFn: () => getWaecPlansRequest(),
  });

  // Ensure we always return an array
  const responseData = data?.data?.data;
  const waecPlans: any[] = Array.isArray(responseData) ? responseData : [];

  return { isPending, isError, waecPlans };
};

export const useGetWaecBillInfo = (payload: IGetWaecBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["waec-bill-info", payload],
    queryFn: () => getWaecBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  const billInfo: any = data?.data?.data;

  return { isLoading, isError, billInfo };
};

export const useVerifyWaecBillerNumber = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyWaecBillerNumberRequest,
    onError,
    onSuccess,
  });
};

export const usePayForWaec = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: waecPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};


