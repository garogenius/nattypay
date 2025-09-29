/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { motion } from "framer-motion";
import images from "../../../public/images";
import Image from "next/image";
import AuthInput from "./AuthInput";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { useEffect } from "react";
import icons from "../../../public/icons";
import { useTheme } from "@/store/theme.store";
import useAuthEmailStore from "@/store/authEmail.store";
import { useResetPassword } from "@/api/auth/auth.queries";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

type ResetPasswordFormData = yup.InferType<typeof schema>;

const ResetPasswordContent = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const theme = useTheme();
  const { authCode, authEmail } = useAuthEmailStore();

  const form = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isValid } = formState;

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error during login",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Password reset successful!",
      description: "Your password has been reset successfully",
    });
    navigate("/login");

    reset();
  };

  const {
    mutate: resetPassword,
    isPending: resetPasswordPending,
    isError: resetPasswordError,
  } = useResetPassword(onError, onSuccess);

  const resetPasswordLoading = resetPasswordPending && !resetPasswordError;

  const onSubmit = async (data: ResetPasswordFormData) => {
    resetPassword({
      email: authEmail,
      ...data,
    });
  };

  useEffect(() => {
    if (!authEmail || !authCode) {
      ErrorToast({
        title: "Error",
        descriptions: ["No email or code found. Please try again."],
      });
      router.back();
    }
  }, [authEmail, authCode, router, navigate]);

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden bg-black">
      {/* Mobile Logo */}
      <div className="absolute top-6 left-6 z-50 lg:hidden">
        <Image
          src={images.logo2}
          alt="logo"
          className="w-24 h-12 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Left side - Image with overlay and content */}
      <div className="hidden lg:block lg:w-7/12 relative">
        {/* Desktop Logo at top-left */}
        <div className="absolute top-6 left-6 z-50 hidden lg:block">
          <Image
            src={images.logo2}
            alt="logo"
            className="w-28 h-14 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={images.auth.accountTypeDescription}
            alt="auth background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        {/* Overlay text */}
        <div className="relative z-10 h-full w-full flex items-center">
          <div className="px-6 2xs:px-8 sm:px-12 md:px-16 lg:px-20 py-20 max-w-2xl">
            <h1 className="text-3xl 2xs:text-4xl xs:text-5xl md:text-6xl font-bold text-white mb-4">
              Reset your password
            </h1>
            <p className="text-base 2xs:text-lg xl:text-xl text-gray-200 leading-relaxed max-w-xl">
              Create a new password to secure your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full flex-col items-center justify-center bg-black p-6 sm:p-8 lg:w-5/12 lg:overflow-y-auto">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="z-10 w-full max-w-md sm:max-w-lg flex flex-col justify-start items-start bg-bg-600 dark:bg-bg-1100 border border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-8 py-6 2xs:py-8 gap-6 2xs:gap-8"
        >
          <div className="text-white flex flex-col items-center justify-center w-full text-center">
            <h2 className="text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">
              Reset Your Password
            </h2>
          </div>
          <form
            className="flex flex-col justify-start items-start w-full gap-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <AuthInput
              id="password"
              label="Password"
              type="password"
              htmlFor="password"
              placeholder="Password"
              autoComplete="off"
              icon={
                <Image
                  src={
                    theme === "dark"
                      ? icons.authIcons.lockDark
                      : icons.authIcons.lock
                  }
                  alt="password"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.password?.message}
              {...register("password")}
            />

            <AuthInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              htmlFor="confirmPassword"
              placeholder="Confirm Password"
              icon={
                <Image
                  src={
                    theme === "dark"
                      ? icons.authIcons.lockDark
                      : icons.authIcons.lock
                  }
                  alt="password"
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              }
              error={errors.confirmPassword?.message}
              autoComplete="off"
              {...register("confirmPassword")}
            />

            <p className="w-full flex justify-center items-center gap-1 text-base sm:text-lg text-text-200 dark:text-white ">
              Back to{" "}
              <Link className="text-primary" href="/login">
                Login{" "}
              </Link>
            </p>

            <CustomButton
              type="submit"
              disabled={!isValid || resetPasswordLoading}
              isLoading={resetPasswordLoading}
              className="mb-4  w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4"
            >
              Reset Password{" "}
            </CustomButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordContent;
