/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  gcPaymentRequest,
  getGCCategoriesRequest,
  getGCProductsByCurrencyRequest,
  getGCRedeemCodeRequest,
  getGCFxRateRequest,
} from "./gift-card.apis";
import { GiftCardCategory, GiftCardProduct } from "@/constants/types";

export const useGetGCCategories = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gc-categories"],
    queryFn: () => getGCCategoriesRequest(),
  });

  const categories: GiftCardCategory[] = data?.data;

  return { categories, isLoading, isError };
};

export const useGetGCProductsByCurrency = (payload: { currency: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gc-products-by-currency", payload],
    queryFn: () => getGCProductsByCurrencyRequest(payload),
    enabled: !!payload.currency,
  });

  const products: GiftCardProduct[] = data?.data?.data;

  return { products, isLoading, isError };
};

export const useGetGCRedeemCode = (payload: { transactionId: number }) => {
  const { data, isLoading, isError, refetch, error, isSuccess } = useQuery({
    queryKey: ["gc-redeem-code", payload],
    queryFn: () => getGCRedeemCodeRequest(payload),
    enabled: false,
  });

  const response: {
    cardNumber: string;
    pinCode: string;
  }[] = data?.data?.data;

  return { response, isLoading, error, isError, refetch, isSuccess };
};

export const usePayForGiftCard = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: gcPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetGCFxRate = (payload: { amount: number; currency: string }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["gc-fx-rate", payload],
    queryFn: () => getGCFxRateRequest(payload),
    enabled: !!payload.amount && !!payload.currency,
  });

  const fxRate: any = data?.data?.data;
  return { fxRate, isLoading, isError };
};
