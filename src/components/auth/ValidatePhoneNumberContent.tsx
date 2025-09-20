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
              Validate Phone Number{" "}
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

export default ValidatePhoneNumberContent;
