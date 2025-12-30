/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEducationBillersRequest,
  getEducationBillerItemsRequest,
  verifyEducationCustomerRequest,
  payEducationRequest,
} from "./education.apis";
import {
  IGetEducationBillerItems,
  IVerifyEducationCustomer,
} from "./education.types";

export const useGetEducationBillers = () => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["education-billers"],
    queryFn: () => getEducationBillersRequest(),
  });

  const billers: any[] = data?.data?.data || [];

  return { isPending, isError, billers };
};

export const useGetEducationBillerItems = (
  payload: IGetEducationBillerItems
) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["education-biller-items", payload],
    queryFn: () => getEducationBillerItemsRequest(payload),
    enabled: !!payload.billerCode,
  });

  const items: any[] = data?.data?.data || [];
  return { isLoading, isError, items };
};

export const useVerifyEducationCustomer = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyEducationCustomerRequest,
    onError,
    onSuccess,
  });
};

export const usePayForEducation = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payEducationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};






