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
    enabled: payload.isEnabled,
  });

  const transportPlans: any[] = data?.data?.data || [];

  return { isPending, isError, transportPlans };
};

export const useGetTransportBillInfo = (payload: IGetTransportBillInfo) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["transport-bill-info", payload],
    queryFn: () => getTransportBillInfoRequest(payload),
    enabled: !!payload.billerCode,
  });

  const billInfo: any = data?.data?.data;
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






