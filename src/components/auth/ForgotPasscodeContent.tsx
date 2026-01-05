"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import useNavigate from "@/hooks/useNavigate";
import { useForgotPassword } from "@/api/auth/auth.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useAuthEmailStore from "@/store/authEmail.store";
import images from "../../../public/images";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),
});

type ForgotPasscodeFormData = yup.InferType<typeof schema>;

const ForgotPasscodeContent = () => {
  const navigate = useNavigate();
  const { setAuthEmail } = useAuthEmailStore();
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");

  const form = useForm<ForgotPasscodeFormData>({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, setValue } = form;
  const { errors, isValid } = formState;

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Error during sending password reset otp",
      descriptions,
    });
  };

  const onSuccess = () => {
    const email = form.getValues("email");
    setAuthEmail(email);
    SuccessToast({
      title: "Password reset otp sent!",
      description: "Check your email for verification code to continue with resetting your password",
    });
    navigate("/enter-code");
  };

  const {
    mutate: forgotPassword,
    isPending: forgotPasswordPending,
    isError: forgotPasswordError,
  } = useForgotPassword(onError, onSuccess);

  const forgotPasswordLoading = forgotPasswordPending && !forgotPasswordError;

  const onSubmit = async (data: ForgotPasscodeFormData) => {
    forgotPassword(data);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Illustration placeholder */}
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center">
              <svg
                className="w-48 h-48 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Transfers</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Send and receive money locally or globally with ease and speed.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Passcode</h2>
            <p className="text-sm text-gray-600 mb-6">
              {activeTab === "email" ? "Enter your email address" : "Enter your phone number"}
            </p>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("email");
                  setValue("email", "");
                }}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "email"
                    ? "text-[#D4B139] border-b-2 border-[#D4B139]"
                    : "text-gray-600"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("phone");
                  setValue("email", "");
                }}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "phone"
                    ? "text-[#D4B139] border-b-2 border-[#D4B139]"
                    : "text-gray-600"
                }`}
              >
                Phone Number
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {activeTab === "email" ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 bg-gray-50">
                      <span className="text-2xl">🇳🇬</span>
                      <span className="text-gray-700">+234</span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      className="flex-1 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <CustomButton
                type="submit"
                disabled={!isValid || forgotPasswordLoading}
                isLoading={forgotPasswordLoading}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Proceed
              </CustomButton>
            </form>

            {/* Account Options */}
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-600 text-center">Switch account</p>
              <Link href="/login" className="text-sm text-gray-600 text-center block">
                Login with Finger Print or Face ID
              </Link>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] xs:text-xs text-gray-500 mt-8 px-2">
              <p className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 flex-nowrap whitespace-nowrap">
                <span>Licenced by CBN</span>
                <Image
                  src={images.cbnLogo}
                  alt="CBN Logo"
                  width={40}
                  height={20}
                  className="h-3 xs:h-4 sm:h-5 w-auto object-contain"
                />
                <span>Deposits Insured by</span>
                <span className="text-purple-600">NDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasscodeContent;






