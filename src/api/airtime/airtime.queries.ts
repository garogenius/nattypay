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

// Format phone number for API: convert to +234 format
// e.g., 07043742886 -> +2347043742886 or 7043742886 -> +2347043742886
const formatPhoneForAPI = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  // Remove leading 0 if present (11 digits -> 10 digits)
  const phoneWithoutLeadingZero = cleaned.startsWith("0") && cleaned.length === 11
    ? cleaned.slice(1)
    : cleaned;
  // Add +234 prefix
  return `+234${phoneWithoutLeadingZero}`;
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
