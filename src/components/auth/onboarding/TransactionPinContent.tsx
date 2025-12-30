"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import OtpInput from "react-otp-input";
import { useCreatePin } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { isTokenExpired } from "@/utils/tokenChecker";

const schema = yup.object().shape({
  pin: yup.string().length(4, "PIN must be 4 digits").required("PIN is required"),
  confirmPin: yup
    .string()
    .oneOf([yup.ref("pin")], "PINs do not match")
    .required("Please confirm your PIN"),
});

type TransactionPinFormData = yup.InferType<typeof schema>;

const TransactionPinContent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const form = useForm<TransactionPinFormData>({
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const onPinError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create transaction PIN"];

    ErrorToast({
      title: "PIN Creation Failed",
      descriptions,
    });
  };

  const onPinSuccess = async () => {
    SuccessToast({
      title: "Transaction PIN Created!",
      description: "Your transaction PIN has been set successfully.",
    });
    
    // Refetch user data to update isWalletPinSet status
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    await queryClient.refetchQueries({ queryKey: ["user"] });
    
    // Check if user is authenticated (has valid token)
    const token = Cookies.get("accessToken");
    const hasValidToken = token && !isTokenExpired(token);
    
    // Navigate based on authentication status
    setTimeout(() => {
      if (hasValidToken) {
        // User is logged in - navigate to dashboard
        navigate("/user/dashboard", "replace");
      } else {
        // User is not logged in - navigate to login page
        navigate("/login", "replace");
      }
    }, 100);
  };

  const {
    mutate: createPin,
    isPending: pinPending,
    isError: pinError,
  } = useCreatePin(onPinError, onPinSuccess);

  const pinLoading = pinPending && !pinError;

  const onSubmit = (data: TransactionPinFormData) => {
    // Create PIN via API
    createPin({
      pin: data.pin,
    });
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    setValue("pin", value, { shouldValidate: true });
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
    setValue("confirmPin", value, { shouldValidate: true });
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
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Currency</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Secure your future with simple, flexible investment plans and opportunities
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Transaction Pin</h2>
            <p className="text-sm text-gray-600 mb-6">
              Create a secure 4-digit PIN to always authorize your transactions safely
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Transaction PIN */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Transaction Pin</label>
                <div className="flex items-center justify-center">
                  <OtpInput
                    value={pin}
                    onChange={handlePinChange}
                    numInputs={4}
                    renderSeparator={<span className="w-2"></span>}
                    containerStyle={{}}
                    skipDefaultStyles
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139]"
                      />
                    )}
                  />
                  <span className="text-red-500 ml-2">*</span>
                </div>
                {errors.pin && (
                  <p className="text-red-500 text-xs mt-1">{errors.pin.message}</p>
                )}
              </div>

              {/* Confirm Transaction PIN */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Confirm Transaction Pin</label>
                <div className="flex items-center justify-center">
                  <OtpInput
                    value={confirmPin}
                    onChange={handleConfirmPinChange}
                    numInputs={4}
                    renderSeparator={<span className="w-2"></span>}
                    containerStyle={{}}
                    skipDefaultStyles
                    inputType="number"
                    renderInput={(props) => (
                      <input
                        {...props}
                        className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139]"
                      />
                    )}
                  />
                  <span className="text-red-500 ml-2">*</span>
                </div>
                {errors.confirmPin && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPin.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <CustomButton
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-white font-medium py-3 rounded-lg"
                >
                  Back
                </CustomButton>
                <CustomButton
                  type="submit"
                  disabled={pinLoading}
                  isLoading={pinLoading}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-white font-medium py-3 rounded-lg"
                >
                  Proceed
                </CustomButton>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-8">
                <p>
                  Licenced by CBN a{" "}
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>{" "}
                  Deposits Insured by{" "}
                  <span className="text-blue-600 underline">NDIC</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPinContent;

