"use client";

import React, { useEffect } from "react";
import { CgClose } from "react-icons/cg";
import OtpInput from "react-otp-input";
import { useVerifyContact } from "@/api/auth/auth.queries";
import { useUpdateUser } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";

interface VerifyPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
}

const VerifyPhoneModal: React.FC<VerifyPhoneModalProps> = ({ isOpen, onClose, phone }) => {
  const { user } = useUserStore();
  const [otp, setOtp] = React.useState("");

  useEffect(() => {
    if (isOpen) {
      setOtp("");
    }
  }, [isOpen]);

  const onVerifyError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to verify phone number"];

    ErrorToast({
      title: "Verification Failed",
      descriptions,
    });
  };

  const onUpdateError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to update phone number"];

    ErrorToast({
      title: "Update Failed",
      descriptions,
    });
  };

  const onUpdateSuccess = () => {
    SuccessToast({
      title: "Phone Updated",
      description: "Your phone number has been updated successfully",
    });
    onClose();
  };

  const onVerifySuccess = () => {
    // After verification succeeds, update the profile with the new phone number
    if (!user) {
      ErrorToast({
        title: "Error",
        descriptions: ["User not found"],
      });
      return;
    }

    // Create FormData for updateUser API
    const formData = new FormData();
    formData.append("fullname", user.fullname || "");
    formData.append("phoneNumber", phone);
    formData.append("dateOfBirth", user.dateOfBirth || "");

    updateUser(formData);
  };

  const { mutate: verifyContact, isPending: verifying } = useVerifyContact(onVerifyError, onVerifySuccess);
  const { mutate: updateUser, isPending: updating } = useUpdateUser(onUpdateError, onUpdateSuccess);

  if (!isOpen) return null;

  const valid = otp.length === 4;
  const isProcessing = verifying || updating;

  const handleSubmit = async () => {
    if (!valid || isProcessing) return;

    // Use verifyContact with identifier (phone number) instead of email
    verifyContact({
      identifier: phone,
      otpCode: otp.trim(),
    });
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3">
          <h2 className="text-white text-base sm:text-lg font-semibold">Verify Phone Number</h2>
          <p className="text-white/60 text-sm">Enter the code sent to {phone}</p>
        </div>

        <div className="px-5 sm:px-6 pb-2">
          <label className="block text-sm text-white/80 mb-1.5">Enter Code</label>
          <div className="flex items-center justify-center">
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={4}
              renderSeparator={<span className="w-2"></span>}
              containerStyle={{}}
              skipDefaultStyles
              inputType="number"
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-md text-base sm:text-lg text-white text-center font-medium outline-none focus:border-[#D4B139]"
                />
              )}
            />
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-2 flex gap-3">
          <CustomButton
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
            disabled={!valid || isProcessing}
            isLoading={isProcessing}
            className="flex-1 rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Verify
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhoneModal;
