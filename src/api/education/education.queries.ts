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

  // Handle nested data structure: data.data.data
  const responseData = data?.data?.data?.data || data?.data?.data || [];
  const rawBillers: any[] = Array.isArray(responseData) ? responseData : [];
  
  // Map API response fields to component-expected fields
  // API returns: billerId, billerName, billerShortName
  // Component expects: billerCode, name, shortName
  const billers: any[] = rawBillers.map((biller: any) => ({
    ...biller,
    billerCode: biller.billerCode || biller.billerId,
    name: biller.name || biller.billerName,
    shortName: biller.shortName || biller.billerShortName || biller.billerName,
  }));

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

  // Ensure items is always an array
  const itemsData = data?.data?.data;
  const items: any[] = Array.isArray(itemsData) ? itemsData : [];
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






