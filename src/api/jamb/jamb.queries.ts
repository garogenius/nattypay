/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJambPlansRequest,
  getJambBillInfoRequest,
  verifyJambBillerNumberRequest,
  jambPaymentRequest,
} from "./jamb.apis";
import {
  IGetJambBillInfo,
  IVerifyJambBillerNumber,
} from "./jamb.types";

export const useGetJambPlans = () => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["jamb-plan"],
    queryFn: () => getJambPlansRequest(),
  });

  // Ensure we always return an array
  const responseData = data?.data?.data;
  const jambPlans: any[] = Array.isArray(responseData) ? responseData : [];

  return { isPending, isError, jambPlans };
};

export const useGetJambBillInfo = (payload: IGetJambBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["jamb-bill-info", payload],
    queryFn: () => getJambBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  const billInfo: any = data?.data?.data;

  return { isLoading, isError, billInfo };
};

export const useVerifyJambBillerNumber = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyJambBillerNumberRequest,
    onError,
    onSuccess,
  });
};

export const usePayForJamb = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jambPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};


