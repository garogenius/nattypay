import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBettingPlatformsRequest,
  getBettingWalletRequest,
  fundBettingPlatformRequest,
  fundBettingWalletRequest,
  withdrawBettingWalletRequest,
  getBettingWalletTransactionsRequest,
} from "./betting.apis";
import {
  IFundBettingPlatform,
  IFundBettingWallet,
  IWithdrawBettingWallet,
} from "./betting.types";

export const useGetBettingPlatforms = () => {
  return useQuery({
    queryKey: ["betting-platforms"],
    queryFn: getBettingPlatformsRequest,
  });
};

export const useGetBettingWallet = () => {
  return useQuery({
    queryKey: ["betting-wallet"],
    queryFn: getBettingWalletRequest,
  });
};

export const useGetBettingWalletTransactions = (params?: { limit?: number }) => {
  return useQuery({
    queryKey: ["betting-wallet-transactions", params],
    queryFn: () => getBettingWalletTransactionsRequest(params),
  });
};

export const useFundBettingPlatform = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IFundBettingPlatform) => fundBettingPlatformRequest(data),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["betting-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["betting-wallet-transactions"] });
      onSuccess(data);
    },
  });
};

export const useFundBettingWallet = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IFundBettingWallet) => fundBettingWalletRequest(data),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["betting-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["betting-wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      onSuccess(data);
    },
  });
};

export const useWithdrawBettingWallet = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IWithdrawBettingWallet) => withdrawBettingWalletRequest(data),
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["betting-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["betting-wallet-transactions"] });
      onSuccess(data);
    },
  });
};





























































