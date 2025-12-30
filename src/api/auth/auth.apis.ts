import { request } from "@/utils/axios-utils";
import {
  IRegister,
  ILogin,
  IForgotPassword,
  IVerifyEmail,
  IResendVerificationCode,
  IResetPassword,
  IBusinessRegister,
  IBiometricLogin,
  IBiometricRegister,
  ICreatePasscode,
  IPasscodeLogin,
  IVerifyEmailPreRegister,
  IResendVerifyEmailPreRegister,
  IVerify2FA,
  IResend2faEmail,
  IBiometricChallenge,
  IVerifyContact,
  IResendVerifyContact,
} from "./auth.types";

export const registerRequest = async (formdata: IRegister) => {
  return request({ url: "/auth/register", method: "post", data: formdata });
};


export const registerBusinessRequest = async (formdata: IBusinessRegister) => {
  return request({ url: "/auth/register-business", method: "post", data: formdata });
};

export const loginRequest = async (formdata: ILogin) => {
  return request({ url: "/auth/login", method: "post", data: formdata });
};

export const verifyEmailRequest = async (formdata: IVerifyEmail) => {
  return request({ url: "/auth/verify-email", method: "post", data: formdata });
};

export const verifyResetEmailRequest = async (formdata: IVerifyEmail) => {
  return request({
    url: "/auth/verify-forgot-password",
    method: "post",
    data: formdata,
  });
};

export const resendVerificationCodeRequest = async (
  formdata: IResendVerificationCode
) => {
  return request({
    url: "/auth/resend-verify-email",
    method: "post",
    data: formdata,
  });
};

export const verifyEmailPreRegisterRequest = async (
  formdata: IVerifyEmailPreRegister
) => {
  return request({
    url: "/auth/verify-email",
    method: "post",
    data: formdata,
  });
};

export const resendVerifyEmailPreRegisterRequest = async (
  formdata: IResendVerifyEmailPreRegister
) => {
  return request({
    url: "/auth/resend-verify-email",
    method: "post",
    data: formdata,
  });
};

export const verify2faCodeRequest = async (formdata: IVerify2FA) => {
  return request({
    url: "/auth/verify-2fa-code",
    method: "post",
    data: formdata,
  });
};

export const resend2faCodeRequest = async (formdata: IResend2faEmail) => {
  // Resend 2FA email - requires email parameter
  return request({
    url: "/auth/resend-2fa-email",
    method: "post",
    data: formdata,
  });
};

export const forgotPasswordRequest = async (formdata: IForgotPassword) => {
  return request({
    url: "/auth/forgot-password",
    method: "post",
    data: formdata,
  });
};

export const resetPasswordRequest = async (formdata: IResetPassword) => {
  return request({
    url: "/auth/reset-password",
    method: "post",
    data: formdata,
  });
};

export const getBiometricChallengeRequest = async (credentialId?: string) => {
  // Get challenge from backend for secure biometric authentication
  return request({
    url: "/auth/biometric-challenge",
    method: "post",
    data: credentialId ? { credentialId } : {},
  });
};

export const biometricLoginRequest = async (formdata: IBiometricLogin) => {
  return request({
    url: "/auth/biometric-login",
    method: "post",
    data: formdata,
  });
};

export const registerBiometricRequest = async (formdata: IBiometricRegister) => {
  return request({
    url: "/auth/register-biometric",
    method: "post",
    data: formdata,
  });
};

export const createPasscodeRequest = async (formdata: ICreatePasscode) => {
  return request({
    url: "/auth/create-passcode",
    method: "post",
    data: formdata,
  });
};

export const passcodeLoginRequest = async (formdata: IPasscodeLogin) => {
  return request({
    url: "/auth/passcode-login",
    method: "post",
    data: formdata,
  });
};

export const verifyContactRequest = async (formdata: IVerifyContact) => {
  return request({
    url: "/auth/verify-contact",
    method: "post",
    data: formdata,
  });
};

export const resendVerifyContactRequest = async (formdata: IResendVerifyContact) => {
  return request({
    url: "/auth/resend-verify-contact",
    method: "post",
    data: formdata,
  });
};
