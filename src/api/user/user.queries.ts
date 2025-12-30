/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePasswordRequest,
  changePasswordWithOtpRequest,
  changePasscodeRequest,
  changePinRequest,
  createAccountRequest,
  createBusinessAccountRequest,
  createForeignAccountRequest,
  createPinRequest,
  deleteAccountRequest,
  getBeneficiariesRequest,
  getUser,
  getUserStatisticsLineChartRequest,
  getUserStatisticsPieChartRequest,
  reportScamRequest,
  requestChangePasswordRequest,
  resetOtpRequest,
  resetPinRequest,
  tier2VerificationRequest,
  tier3VerificationRequest,
  updateUserRequest,
  validatePhoneNumberRequest,
  verifyNinRequest,
  verifyPhoneNumberRequest,
  verifyWalletPinRequest,
} from "./user.apis";
import {
  BENEFICIARY_TYPE,
  BeneficiaryProps,
  BILL_TYPE,
  TRANSFER_TYPE,
  User,
} from "@/constants/types";
import Cookies from "js-cookie";

export const useGetUser = () => {
  const token = Cookies.get("accessToken");
  
  const { data, isError, isSuccess, error } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    // Only run when token exists
    enabled: !!token,
    // Run in the background
    refetchOnWindowFocus: true,
    // Refetch every 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Keep fetching even when window/tab is not active
    refetchIntervalInBackground: true,
    // Prevent unnecessary loading states
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    // If error occurs, retry once
    retry: 1,
  });
  const user: User = data?.data;

  return { user, isError, isSuccess, error };
};

export const useUpdateUser = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useCreatePin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPinRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useResetOtp = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resetOtpRequest,
    onError,
    onSuccess,
  });
};

export const useResetPin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resetPinRequest,
    onError,
    onSuccess,
  });
};

export const useChangePassword = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: changePasswordRequest,
    onError,
    onSuccess,
  });
};

export const useReportScam = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: reportScamRequest,
    onError,
    onSuccess,
  });
};

export const useTier2Verification = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tier2VerificationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useTier3Verification = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tier3VerificationRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useGetBeneficiaries = ({
  category,
  transferType,
  billType,
}: {
  category: BENEFICIARY_TYPE;
  transferType?: TRANSFER_TYPE;
  billType?: BILL_TYPE;
}) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["get-beneficiaries", { category, transferType, billType }],

    queryFn: () =>
      getBeneficiariesRequest({ category, transferType, billType }),
  });

  const beneficiaries: BeneficiaryProps[] = data?.data?.data;

  return { beneficiaries, isPending, isError };
};

export const useValidatePhoneNumber = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: validatePhoneNumberRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyPhoneNumber = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyPhoneNumberRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyNin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyNinRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

// Password Change with OTP
export const useRequestChangePassword = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: requestChangePasswordRequest,
    onError,
    onSuccess,
  });
};

export const useChangePasswordWithOtp = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePasswordWithOtpRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

// Login Passcode
export const useChangePasscode = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePasscodeRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

// Wallet PIN
export const useVerifyWalletPin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyWalletPinRequest,
    onError,
    onSuccess,
  });
};

export const useChangePin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePinRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

// Account Creation
export const useCreateAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccountRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useCreateBusinessAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusinessAccountRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

export const useCreateForeignAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createForeignAccountRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onSuccess(data);
    },
  });
};

// Delete Account
export const useDeleteAccount = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAccountRequest,
    onError,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.clear(); // Clear all queries on account deletion
      onSuccess(data);
    },
  });
};

// User Statistics
export const useGetUserStatisticsLineChart = (params?: { period?: string }) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["user-statistics-line-chart", params],
    queryFn: () => getUserStatisticsLineChartRequest(params),
  });

  return {
    data: data?.data?.data,
    isPending,
    isError,
  };
};

export const useGetUserStatisticsPieChart = (params?: { period?: string }) => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["user-statistics-pie-chart", params],
    queryFn: () => getUserStatisticsPieChartRequest(params),
  });

  return {
    data: data?.data?.data,
    isPending,
    isError,
  };
};
