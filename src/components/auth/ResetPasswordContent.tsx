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
    <div className="relative flex justify-center items-center w-full bg-bg-400 dark:bg-black">
      <div className="absolute top-4 left-4 z-20 hidden sm:block">
        <Image src={images.logo2} alt="logo" className="w-30 h-20 cursor-pointer" onClick={() => navigate("/")} />
      </div>
      <div className="flex flex-col justify-center items-center w-full gap-8 mt-20 sm:mt-36 lg:mt-40 xl:mt-48 mb-12 sm:mb-14 lg:mb-16 xl:mb-20">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="z-10 flex flex-col justify-start items-start w-full xs:w-[90%] md:w-[80%] lg:w-[55%] xl:w-[45%] 2xl:w-[35%]  bg-transparent xs:bg-bg-600 xs:dark:bg-bg-1100 dark:xs:border dark:border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-10 py-2.5 2xs:py-4 sm:py-6 gap-6 2xs:gap-8 sm:gap-10 md:gap-12"
        >
          <div className="text-white flex flex-col items-center justify-center w-full text-center">
            <Image
              className="w-20 2xs:w-24 xs:w-28 "
              src={images.singleLogo}
              alt="logo"
              onClick={() => {
                navigate("/");
              }}
            />{" "}
            <h2 className="text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">
              Reset Your Password{" "}
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
      <div
        className=" absolute bottom-0 left-0 inset-[60rem] opacity-60"
        style={{
          background: `
                radial-gradient(
                  circle at bottom left,
                  rgba(212, 177, 57, 0.4) 0%,
                  rgba(212, 177, 57, 0.2) 40%,
                  rgba(212, 177, 57, 0.1) 60%,
                  rgba(212, 177, 57, 0) 80%
                )
              `,
          filter: "blur(60px)",
          transform: "scale(1.1)",
        }}
      />
    </div>
  );
};

export default ResetPasswordContent;
