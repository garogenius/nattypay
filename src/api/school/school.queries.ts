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

  // Handle nested data structure: data.data.data
  const responseData = data?.data?.data?.data || data?.data?.data || [];
  const rawPlans: any[] = Array.isArray(responseData) ? responseData : [];
  
  // Map API response fields to component-expected fields
  // API returns: billerId, billerName, billerShortName
  // Component expects: billerCode, name, shortName
  const schoolPlans: any[] = rawPlans.map((plan: any) => ({
    ...plan,
    billerCode: plan.billerCode || plan.billerId,
    name: plan.name || plan.billerName,
    shortName: plan.shortName || plan.billerShortName || plan.billerName,
  }));

  return { isPending, isError, schoolPlans };
};

export const useGetSchoolBillInfo = (payload: IGetSchoolBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["school-bill-info", payload],
    queryFn: () => getSchoolBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  // Extract products/items from nested response structure
  // Response structure could be: data.data.data.products or data.data.data.items or data.data.data
  const responseData = data?.data?.data?.data || data?.data?.data || {};
  
  // Try to get items from different possible locations
  const products = responseData?.products || responseData?.items || [];
  const rawItems = Array.isArray(products) ? products : (Array.isArray(responseData) ? responseData : []);
  
  // Map products/items to items format expected by component
  const items = rawItems.map((item: any) => ({
    itemName: item.billPaymentProductName || item.itemName || item.name || item.short_name,
    name: item.billPaymentProductName || item.itemName || item.name || item.short_name,
    short_name: item.short_name || item.billPaymentProductName || item.itemName || item.name,
    itemCode: item.billPaymentProductId || item.itemCode || item.item_code,
    item_code: item.billPaymentProductId || item.itemCode || item.item_code,
    amount: item.isAmountFixed ? item.amount : (item.amount || undefined),
    isAmountFixed: item.isAmountFixed,
    currency: item.currency,
    metadata: item.metadata,
  }));

  const billInfo: any = {
    ...responseData,
    items,
    products: rawItems,
  };

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








