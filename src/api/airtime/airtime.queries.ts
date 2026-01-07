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
  if (currency === "NGN") {
    // Accept 10 digits (without leading 0) or 11 digits (with leading 0)
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length === 11 || cleaned.length === 10;
  }
  return false;
};

// Format phone number for API: ensure local format with leading 0
// e.g., +2347043742886 -> 07043742886 or 7043742886 -> 07043742886
const formatPhoneForAPI = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 234 (international format without +), remove it
  let localPhone = cleaned;
  if (cleaned.startsWith("234") && cleaned.length === 13) {
    localPhone = cleaned.slice(3);
  }
  
  // Ensure it has leading 0 (should be 11 digits total)
  if (!localPhone.startsWith("0") && localPhone.length === 10) {
    localPhone = `0${localPhone}`;
  }
  
  // Return in local format (07043742886)
  return localPhone;
};

export const useGetAirtimePlan = (payload: IAirtimePlan) => {
  const formattedPhone = formatPhoneForAPI(payload.phone);
  return useQuery({
    queryKey: ["airtime-plan", formattedPhone],
    queryFn: () => airtimePlanRequest({ ...payload, phone: formattedPhone }),
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
