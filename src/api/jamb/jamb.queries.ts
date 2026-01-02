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

  // Handle nested data structure: data.data.data
  const responseData = data?.data?.data?.data || data?.data?.data || [];
  const rawPlans: any[] = Array.isArray(responseData) ? responseData : [];
  
  // Map API response fields to component-expected fields
  // API returns: billerId, billerName, billerShortName
  // Component expects: billerCode, name, shortName
  const jambPlans: any[] = rawPlans.map((plan: any) => ({
    ...plan,
    billerCode: plan.billerCode || plan.billerId,
    name: plan.name || plan.billerName,
    shortName: plan.shortName || plan.billerShortName || plan.billerName,
  }));

  return { isPending, isError, jambPlans };
};

export const useGetJambBillInfo = (payload: IGetJambBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["jamb-bill-info", payload],
    queryFn: () => getJambBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  // Extract products from nested response structure
  // Response structure: data.data.data.products
  const responseData = data?.data?.data?.data || data?.data?.data || {};
  const products = responseData?.products || [];
  
  // Map products to items format expected by component
  const items = products.map((product: any) => ({
    itemName: product.billPaymentProductName,
    name: product.billPaymentProductName,
    itemCode: product.billPaymentProductId,
    item_code: product.billPaymentProductId,
    amount: product.isAmountFixed ? product.amount : undefined,
    isAmountFixed: product.isAmountFixed,
    currency: product.currency,
    metadata: product.metadata,
  }));

  const billInfo: any = {
    ...responseData,
    items,
    products,
  };

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


