import { request } from "@/utils/axios-utils";
import {
  IRegister,
  ILogin,
  IForgotPassword,
  IVerifyEmail,
  IResendVerificationCode,
  IResetPassword,
  IBusinessRegister,
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

export const verify2faCodeRequest = async (formdata: IVerifyEmail) => {
  return request({
    url: "/auth/verify-2fa-code",
    method: "post",
    data: formdata,
  });
};

export const resend2faCodeRequest = async (
  formdata: IResendVerificationCode
) => {
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
