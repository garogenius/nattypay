/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTransportPlansRequest,
  getTransportBillInfoRequest,
  transportPaymentRequest,
} from "./transport.apis";
import {
  IGetTransportPlans,
  IGetTransportBillInfo,
} from "./transport.types";

export const useGetTransportPlans = (payload: IGetTransportPlans) => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["transport-plan", payload],
    queryFn: () => getTransportPlansRequest(payload),
    enabled: payload.isEnabled !== false,
  });

  // Handle nested data structure: data.data.data or data.data
  const responseData = data?.data?.data?.data || data?.data?.data || data?.data || [];
  const rawPlans: any[] = Array.isArray(responseData) ? responseData : [];
  
  // Map API response fields to component-expected fields
  // API might return: billerId, billerName, billerShortName, billerCode, name, shortName
  const transportPlans: any[] = rawPlans.map((plan: any) => ({
    ...plan,
    billerCode: plan.billerCode || plan.billerId || plan.code,
    name: plan.name || plan.billerName || plan.billerShortName,
    shortName: plan.shortName || plan.billerShortName || plan.billerName || plan.name,
  }));

  return { isPending, isError, transportPlans };
};

export const useGetTransportBillInfo = (payload: IGetTransportBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["transport-bill-info", payload],
    queryFn: () => getTransportBillInfoRequest(payload),
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
    amount: item.isAmountFixed ? item.amount : (item.amount || item.payAmount || undefined),
    payAmount: item.isAmountFixed ? item.amount : (item.amount || item.payAmount || undefined),
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

export const usePayForTransport = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transportPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};






