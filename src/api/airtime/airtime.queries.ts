/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  airtimeNetworkProviderRequest,
  airtimePaymentRequest,
  airtimePlanRequest,
  airtimeVariationRequest,
  internationalAirtimeFxRateRequest,
  internationalAirtimePlanRequest,
  internationalAirtimePaymentRequest,
} from "./airtime.apis";
import {
  IAirtimePlan,
  IAirtimeVariation,
  IInternationalAirtimeFxRate,
  IInternationalAirtimePlan,
} from "./airtime.types";

const validatePhone = (phone: string, currency: string) => {
  if (phone.length === 11 && currency === "NGN") {
    return true;
  }
  return false;
};

export const useGetAirtimePlan = (payload: IAirtimePlan) => {
  return useQuery({
    queryKey: ["airtime-plan", payload.phone],
    queryFn: () => airtimePlanRequest(payload),
    enabled: validatePhone(payload.phone, payload.currency),
  });
};

export const useGetInternationalAirtimePlan = (
  payload: IInternationalAirtimePlan
) => {
  return useQuery({
    queryKey: ["international-airtime-plan", payload],
    queryFn: () => internationalAirtimePlanRequest(payload),
    enabled: !!payload.phone,
  });
};

export const useGetInternationalAirtimeFxRate = (
  payload: IInternationalAirtimeFxRate
) => {
  return useQuery({
    queryKey: ["international-airtime-fx-rate", payload],
    queryFn: () => internationalAirtimeFxRateRequest(payload),
    enabled: !!payload.operatorId && !!payload.amount,
  });
};

export const useGetAirtimeVariation = (payload: IAirtimeVariation) => {
  return useQuery({
    queryKey: ["airtime-variation"],
    queryFn: () => airtimeVariationRequest(payload),
  });
};

export const usePayForAirtime = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: airtimePaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetAirtimeNetWorkProvider = () => {
  return useQuery({
    queryKey: ["airtime-network-provider"],
    queryFn: airtimeNetworkProviderRequest,
  });
};

export const usePayForInternationalAirtime = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: internationalAirtimePaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};
