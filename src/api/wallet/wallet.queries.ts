/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bvnFaceVerificationRequest,
  getAllBanks,
  getQrCode,
  getTransactions,
  getTransferFee,
  initiateBvnVerificationRequest,
  initiateTransferRequest,
  validateBvnVerificationRequest,
  verifyAccountRequest,
} from "./wallet.apis";
import {
  BankProps,
  Transaction,
  TRANSACTION_TYPE,
  TRANSACTION_CATEGORY,
  TRANSACTION_STATUS,
} from "@/constants/types";

export const useInitiateBvnVerification = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initiateBvnVerificationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useValidateBvnVerification = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateBvnVerificationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useVerifyAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyAccountRequest,
    onError,
    onSuccess,
  });
};

export const useInitiateTransfer = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initiateTransferRequest,
    onError,
    onSuccess: async (data) => {
      console.log('Transfer Success Response:', data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["get-beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      const latestTransactions = await queryClient.fetchQuery({
        queryKey: ["transactions", { page: 1, limit: 1 }],
        queryFn: () => getTransactions({ page: 1, limit: 1 })
      });

      // Get the most recent transaction
      const latestTransaction = latestTransactions?.data?.transactions?.[0];
      // console.log('Latest Transaction:', latestTransaction);
    onSuccess({data, transaction: latestTransaction});
    },
  });
};

export const useGetAllBanks = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["banks"],
    queryFn: getAllBanks,
  });

  const banks: BankProps[] = data?.data?.data;

  return { banks, isPending, isError };
};

export const useGetTransferFee = ({
  currency,
  amount,
  active,
}: {
  currency: string;
  amount: number;
  active: boolean;
}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["transferFee", { currency, amount, active }],
    queryFn: () => getTransferFee({ currency, amount }),
    enabled: active,
  });

  const fee: number[] = data?.data?.data?.fee;

  return { fee, isPending, isError };
};

export const useGetTransactions = ({
  page,
  limit,
  search,
  type,
  category,
  status,
}: {
  page: number;
  limit: number;
  search?: string;
  type?: TRANSACTION_TYPE;
  category?: TRANSACTION_CATEGORY;
  status?: TRANSACTION_STATUS;
}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["transactions", { page, limit, search, type, category, status }],
    queryFn: () =>
      getTransactions({ page, limit, search, type, category, status }),
  });

  const transactionsData: {
    transactions: Transaction[];
    totalCount: number;
    totalPages: number;
    message: string;
    statusCode: number;
  } = data?.data;

  return { transactionsData, isPending, isError };
};

export const useGetQrCode = ({ amount }: { amount: number }) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["qrCode", { amount }],
    queryFn: () => getQrCode({ amount }),
    enabled: amount !== undefined && amount !== 0,
  });

  const qrCode: string = data?.data?.data;

  return { qrCode, isPending, isError };
};

export const useBvnFaceVerification = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bvnFaceVerificationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};
