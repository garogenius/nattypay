/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import useAuthEmailStore from "@/store/authEmail.store";
import { useValidatePhoneNumber } from "@/api/user/user.queries";
import { useRouter } from "next/navigation";
import AuthInput from "./AuthInput";
import useUserStore from "@/store/user.store";

const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\d{11}$/, "Phone number must be 11 digits"),
});

type AddPhoneNumberFormData = yup.InferType<typeof schema>;

const AddPhoneNumberContent = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const { authEmail, setAuthPhoneNumber } = useAuthEmailStore();
  const router = useRouter();

  const form = useForm<AddPhoneNumberFormData>({
    defaultValues: {
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
      title: "Error adding phone number",
      descriptions,
    });
  };

  const onSuccess = (data: any) => {
    const phoneNumber = form.getValues("phoneNumber");
    setAuthPhoneNumber(phoneNumber);
    SuccessToast({
      title: "Phone number added!",
      description:
        "Check your phone number for verification code to verify your phone number",
    });

    navigate("/validate-phoneNumber");
  };

  const {
    mutate: validatePhoneNumber,
    isPending: validatePhoneNumberPending,
    isError: validatePhoneNumberError,
  } = useValidatePhoneNumber(onError, onSuccess);

  const validatePhoneNumberLoading =
    validatePhoneNumberPending && !validatePhoneNumberError;

  const onSubmit = async (data: AddPhoneNumberFormData) => {
    const email = authEmail || user?.email;
    if (!email) {
      ErrorToast({
        title: "Error",
        descriptions: ["Email is required. Please login again."],
      });
      router.push("/login");
      return;
    }

    validatePhoneNumber({
      email,
      phoneNumber: data.phoneNumber,
    });
  };

  const handleSkip = () => {
    // Navigate to dashboard if user wants to skip
    navigate("/user/dashboard");
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Phone Icon */}
          <div className="w-full max-w-md mb-8 flex items-center justify-center">
            <div className="w-48 h-48 flex items-center justify-center">
              <svg
                className="w-full h-full text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Stay Connected</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Add your phone number to receive important updates and secure your account
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Phone Number</h2>
            <p className="text-sm text-gray-600 mb-6">
              Add your phone number to receive verification codes and important updates
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AuthInput
                id="phoneNumber"
                label="Phone Number"
                type="text"
                maxLength={11}
                htmlFor="phoneNumber"
                placeholder="Enter 11-digit phone number"
                error={errors.phoneNumber?.message}
                {...register("phoneNumber")}
              />

              <div className="flex gap-4">
                <CustomButton
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
                >
                  Skip
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={!isValid || validatePhoneNumberLoading}
                  isLoading={validatePhoneNumberLoading}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Continue
                </CustomButton>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p>
                Licenced by CBN a{" "}
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>{" "}
                Deposits Insured by{" "}
                <span className="text-blue-600 underline">NDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPhoneNumberContent;





