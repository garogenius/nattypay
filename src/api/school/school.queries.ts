/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSchoolPlansRequest,
  getSchoolBillInfoRequest,
  verifySchoolBillerNumberRequest,
  schoolPaymentRequest,
} from "./school.apis";
import {
  IGetSchoolPlans,
  IGetSchoolBillInfo,
  IVerifySchoolBillerNumber,
} from "./school.types";

export const useGetSchoolPlans = (payload: IGetSchoolPlans) => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["school-plan", payload],
    queryFn: () => getSchoolPlansRequest(payload),
    enabled: !!payload.currency,
  });

  const schoolPlans: any[] = data?.data?.data || [];

  return { isPending, isError, schoolPlans };
};

export const useGetSchoolBillInfo = (payload: IGetSchoolBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["school-bill-info", payload],
    queryFn: () => getSchoolBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  const billInfo: any = data?.data?.data;

  return { isLoading, isError, billInfo };
};

export const useVerifySchoolBillerNumber = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifySchoolBillerNumberRequest,
    onError,
    onSuccess,
  });
};

export const usePayForSchool = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: schoolPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};








