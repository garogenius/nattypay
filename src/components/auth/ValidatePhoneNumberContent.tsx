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
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import useAuthEmailStore from "@/store/authEmail.store";
import { useValidatePhoneNumber } from "@/api/user/user.queries";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\d{11}$/, "Phone number must be 11 digits"),
});

type ValidatePhoneNumberFormData = yup.InferType<typeof schema>;

const ValidatePhoneNumberContent = () => {
  const navigate = useNavigate();
  const { setAuthEmail, setAuthPhoneNumber } = useAuthEmailStore();
  const router = useRouter();

  const { authEmail } = useAuthEmailStore();
  const form = useForm<ValidatePhoneNumberFormData>({
    defaultValues: {
      email: authEmail,
      phoneNumber: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error during validating phone number",
      descriptions,
    });
  };

  const onSuccess = () => {
    setAuthEmail(form.getValues("email"));
    setAuthPhoneNumber(form.getValues("phoneNumber"));
    SuccessToast({
      title: "Phone number validated!",
      description:
        "Check your phone number for verification code to verify your phone number",
    });

    navigate("/verify-phoneNumber");
  };

  useEffect(() => {
    if (!authEmail) {
      ErrorToast({
        title: "Error",
        descriptions: ["No email found. Please try again."],
      });
      router.back();
    }
  }, [authEmail, router, navigate]);

  const {
    mutate: validatePhoneNumber,
    isPending: validatePhoneNumberPending,
    isError: validatePhoneNumberError,
  } = useValidatePhoneNumber(onError, onSuccess);

  const validatePhoneNumberLoading =
    validatePhoneNumberPending && !validatePhoneNumberError;

  const onSubmit = async (data: ValidatePhoneNumberFormData) => {
    validatePhoneNumber(data);
  };

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
              Validate Phone Number
            </h1>
            <p className="text-base 2xs:text-lg xl:text-xl text-gray-200 leading-relaxed max-w-xl">
              Enter your phone number to receive a verification code.
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
              Validate Phone Number
            </h2>
          </div>
          <form
            className="flex flex-col justify-start items-start w-full gap-7"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <AuthInput
              id="phoneNumber"
              label="Phone Number"
              type="text"
              maxLength={11}
              htmlFor="phoneNumber"
              placeholder="Phone Number"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />

            <CustomButton
              type="submit"
              disabled={!isValid || validatePhoneNumberLoading}
              isLoading={validatePhoneNumberLoading}
              className="mb-4  w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4"
            >
              Validate Phone Number{" "}
            </CustomButton>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ValidatePhoneNumberContent;
