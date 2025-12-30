/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forgotPasswordRequest,
  loginRequest,
  registerRequest,
  resendVerificationCodeRequest,
  verifyEmailRequest,
  verify2faCodeRequest,
  resend2faCodeRequest,
  verifyResetEmailRequest,
  resetPasswordRequest,
  registerBusinessRequest,
  biometricLoginRequest,
  registerBiometricRequest,
  createPasscodeRequest,
  passcodeLoginRequest,
  verifyEmailPreRegisterRequest,
  resendVerifyEmailPreRegisterRequest,
  verifyContactRequest,
  resendVerifyContactRequest,
} from "./auth.apis";

export const useLogin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: loginRequest,
    onError,
    onSuccess,
  });
};

export const useRegister = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: registerRequest,
    onError,
    onSuccess,
  });
};

export const useBusinessRegister = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: registerBusinessRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyEmail = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyEmailRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyResetEmail = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyResetEmailRequest,
    onError,
    onSuccess,
  });
};

export const useResendVerificationCode = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resendVerificationCodeRequest,
    onError,
    onSuccess,
  });
};

export const useVerify2faCode = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verify2faCodeRequest,
    onError,
    onSuccess: (data) => {
      console.log("Before invalidation");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      console.log("After invalidation");
      onSuccess(data);
    },
  });
};

export const useResend2faCode = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resend2faCodeRequest,
    onError,
    onSuccess,
  });
};

export const useForgotPassword = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: forgotPasswordRequest,
    onError,
    onSuccess,
  });
};

export const useResetPassword = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resetPasswordRequest,
    onError,
    onSuccess,
  });
};

export const useBiometricLogin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: biometricLoginRequest,
    onError,
    onSuccess,
  });
};

export const useRegisterBiometric = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: registerBiometricRequest,
    onError,
    onSuccess,
  });
};

export const useCreatePasscode = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: createPasscodeRequest,
    onError,
    onSuccess,
  });
};

export const usePasscodeLogin = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: passcodeLoginRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyEmailPreRegister = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyEmailPreRegisterRequest,
    onError,
    onSuccess,
  });
};

export const useResendVerifyEmailPreRegister = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resendVerifyEmailPreRegisterRequest,
    onError,
    onSuccess,
  });
};

export const useVerifyContact = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: verifyContactRequest,
    onError,
    onSuccess,
  });
};

export const useResendVerifyContact = (
  onError: (error: any) => void,
  onSuccess: (data: any) => void
) => {
  return useMutation({
    mutationFn: resendVerifyContactRequest,
    onError,
    onSuccess,
  });
};
