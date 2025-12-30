/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dataPaymentRequest,
  dataPlanNetworkRequest,
  dataPlanRequest,
  dataVariationRequest,
} from "./data.apis";
import { IDataPlan, IDataVariationPayload } from "./data.types";
import { NetworkPlan } from "@/constants/types";

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

export const useGetDataPlan = (payload: IDataPlan) => {
  const formattedPhone = formatPhoneForAPI(payload.phone);
  const { isLoading, isError, data } = useQuery({
    queryKey: ["data-plan", formattedPhone],
    queryFn: () => dataPlanRequest({ ...payload, phone: formattedPhone }),
    enabled: validatePhone(payload.phone, payload.currency),
  });

  const res = data?.data?.data;

  const network: string = res?.network;
  const networkPlans: NetworkPlan[] = res?.plan;

  return { isLoading, isError, network, networkPlans };
};

export const useGetDataVariation = (payload: IDataVariationPayload) => {
  const { isPending, isError, data } = useQuery({
    queryKey: ["data-variation", payload],
    queryFn: () => dataVariationRequest(payload),
    enabled: !!payload.operatorId,
  });

  const variations: {
    [price: string]: string;
  } = data?.data?.data?.fixedAmountsDescriptions;
  return { isPending, isError, variations };
};

export const usePayForData = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dataPaymentRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetDataPlanByNetwork = (network: string) => {
  return useQuery({
    queryKey: ["data-plan-by-network", network],
    queryFn: () => dataPlanNetworkRequest(network),
    enabled: !!network,
  });
};
