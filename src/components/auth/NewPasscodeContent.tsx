"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import useNavigate from "@/hooks/useNavigate";
import OtpInput from "react-otp-input";
import { useResetPassword } from "@/api/auth/auth.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useAuthEmailStore from "@/store/authEmail.store";
import PasscodeChangedSuccessModal from "@/components/modals/PasscodeChangedSuccessModal";
import images from "../../../public/images";

const schema = yup.object().shape({
  newPasscode: yup.string().length(4, "Passcode must be 4 digits").required("New passcode is required"),
  confirmPasscode: yup
    .string()
    .oneOf([yup.ref("newPasscode")], "Passcodes do not match")
    .required("Please confirm your passcode"),
});

type NewPasscodeFormData = yup.InferType<typeof schema>;

const NewPasscodeContent = () => {
  const navigate = useNavigate();
  const { authEmail, authCode } = useAuthEmailStore();
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<NewPasscodeFormData>({
    defaultValues: {
      newPasscode: "",
      confirmPasscode: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];

    ErrorToast({
      title: "Error during password reset",
      descriptions,
    });
  };

  const onSuccess = () => {
    setShowSuccessModal(true);
  };

  const {
    mutate: resetPassword,
    isPending: resetPasswordPending,
    isError: resetPasswordError,
  } = useResetPassword(onError, onSuccess);

  const resetPasswordLoading = resetPasswordPending && !resetPasswordError;

  const onSubmit = (data: NewPasscodeFormData) => {
    // Convert 4-digit PIN to password format (or use as-is if backend accepts PIN)
    resetPassword({
      email: authEmail,
      password: data.newPasscode, // Backend should accept this as passcode/PIN
      confirmPassword: data.confirmPasscode,
    });
  };

  const handleNewPasscodeChange = (value: string) => {
    setNewPasscode(value);
    setValue("newPasscode", value, { shouldValidate: true });
  };

  const handleConfirmPasscodeChange = (value: string) => {
    setConfirmPasscode(value);
    setValue("confirmPasscode", value, { shouldValidate: true });
  };

  return (
    <>
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

        {/* Right Panel - Light Gray Background with Form */}
        <div className="w-full lg:w-[60%] bg-gray-100 flex flex-col items-center justify-center px-6 sm:px-8 py-12">
          <div className="w-full max-w-md">
            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">New passcode.</h2>
              <p className="text-sm text-gray-600 mb-6">Enter the new passcode.</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* New Passcode */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    New passcode <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center">
                    <OtpInput
                      value={newPasscode}
                      onChange={handleNewPasscodeChange}
                      numInputs={4}
                      renderSeparator={<span className="w-2"></span>}
                      containerStyle={{}}
                      skipDefaultStyles
                      inputType="number"
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139] text-[#141414] dark:text-white"
                        />
                      )}
                    />
                    <span className="text-red-500 ml-2">*</span>
                  </div>
                  {errors.newPasscode && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPasscode.message}</p>
                  )}
                </div>

                {/* Confirm New Passcode */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm New passcode <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center justify-center">
                    <OtpInput
                      value={confirmPasscode}
                      onChange={handleConfirmPasscodeChange}
                      numInputs={4}
                      renderSeparator={<span className="w-2"></span>}
                      containerStyle={{}}
                      skipDefaultStyles
                      inputType="number"
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="w-12 h-12 bg-transparent border-b-2 border-gray-300 text-center text-xl font-medium outline-none focus:border-[#D4B139] text-[#141414] dark:text-white"
                        />
                      )}
                    />
                    <span className="text-red-500 ml-2">*</span>
                  </div>
                  {errors.confirmPasscode && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPasscode.message}</p>
                  )}
                </div>

                {/* Proceed Button */}
                <CustomButton
                  type="submit"
                  disabled={resetPasswordLoading}
                  isLoading={resetPasswordLoading}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
                >
                  Proceed
                </CustomButton>
              </form>

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
                  <span className="text-blue-600 underline">NDIC</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PasscodeChangedSuccessModal
        isOpen={showSuccessModal}
        onLogin={() => {
          setShowSuccessModal(false);
          navigate("/login");
        }}
      />
    </>
  );
};

export default NewPasscodeContent;

