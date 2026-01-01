"use client";

import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useCreateAccount, useCreateBusinessAccount, useCreateForeignAccount } from "@/api/user/user.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import ProfileInfoRequiredModal from "@/components/modals/ProfileInfoRequiredModal";
import useUserStore from "@/store/user.store";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountType: "personal" | "business" | "foreign";
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, accountType }) => {
  const { user } = useUserStore();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "GBP">("USD");
  const [label, setLabel] = useState("");
  const [showProfileInfoModal, setShowProfileInfoModal] = useState(false);
  const [missingInfo, setMissingInfo] = useState<"phone" | "email" | "both">("both");

  useEffect(() => {
    if (isOpen) {
      setBusinessName("");
      setBusinessType("");
      setRegistrationNumber("");
      setCurrency("USD");
      setLabel("");
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const errorMessages = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create account"];

      // Check if the error is about ID validation (tier verification required) - only for foreign accounts
      if (accountType === "foreign") {
        // Check if the error is about missing KYC documents (passport, bank statement, etc.)
        const hasKycError = errorMessages.some((msg: string) =>
          msg.toLowerCase().includes("passport") || 
          msg.toLowerCase().includes("kyc") ||
          msg.toLowerCase().includes("document") ||
          msg.toLowerCase().includes("international passport") ||
          msg.toLowerCase().includes("utilities bill") ||
          msg.toLowerCase().includes("bank statement")
        );

        if (hasKycError) {
          ErrorToast({
            title: "KYC Profile Incomplete",
            descriptions: [
              "To create a foreign currency account, you need to complete your KYC profile.",
              "Please go to Profile Settings and complete your KYC information."
            ],
          });
          return;
        }

        const hasIdValidationError = errorMessages.some((msg: string) =>
          msg.toLowerCase().includes("unable to validate") || 
          msg.toLowerCase().includes("verify provided id") ||
          msg.toLowerCase().includes("invalid id number")
        );

        if (hasIdValidationError) {
          ErrorToast({
            title: "Tier Verification Required",
            descriptions: [
              "To create a foreign currency account, you need to complete tier verification.",
              "Please upgrade your tier by verifying your identity in Settings."
            ],
          });
          return;
        }

      // Check if the error is about missing phone number or email
      const hasPhoneError = errorMessages.some((msg: string) =>
        msg.toLowerCase().includes("phone number") && msg.toLowerCase().includes("required")
      );
      const hasEmailError = errorMessages.some((msg: string) =>
        msg.toLowerCase().includes("email") && msg.toLowerCase().includes("required")
      );

      if (hasPhoneError || hasEmailError) {
        // Determine what's missing based on user data and error message
        const hasPhone = !!user?.phoneNumber;
        const hasEmail = !!user?.email;

        if (hasPhoneError && !hasEmailError) {
          setMissingInfo("phone");
        } else if (hasEmailError && !hasPhoneError) {
          setMissingInfo("email");
        } else {
          // Both are missing or error is ambiguous
          if (!hasPhone && !hasEmail) {
            setMissingInfo("both");
          } else if (!hasPhone) {
            setMissingInfo("phone");
          } else if (!hasEmail) {
            setMissingInfo("email");
          } else {
            setMissingInfo("both");
          }
        }
        setShowProfileInfoModal(true);
        return;
      }
    }

    ErrorToast({
      title: "Creation Failed",
      descriptions: errorMessages,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Account Created",
      description: "Your account has been created successfully",
    });
    onClose();
  };

  const { mutate: createAccount, isPending: creatingPersonal } = useCreateAccount(onError, onSuccess);
  const { mutate: createBusiness, isPending: creatingBusiness } = useCreateBusinessAccount(onError, onSuccess);
  const { mutate: createForeign, isPending: creatingForeign } = useCreateForeignAccount(onError, onSuccess);

  const creating = creatingPersonal || creatingBusiness || creatingForeign;

  const handleSubmit = () => {
    if (accountType === "personal") {
      createAccount({ accountType: "PERSONAL" });
    } else if (accountType === "business") {
      if (!businessName || !businessType) {
        ErrorToast({
          title: "Validation Error",
          descriptions: ["Business name and type are required"],
        });
        return;
      }
      createBusiness({
        businessName,
        businessType,
        registrationNumber: registrationNumber || undefined,
      });
    } else if (accountType === "foreign") {
      if (!label) {
        ErrorToast({
          title: "Validation Error",
          descriptions: ["Account label is required"],
        });
        return;
      }
      createForeign({ currency, label });
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (accountType === "personal") return "Create NGN Personal Account";
    if (accountType === "business") return "Create NGN Business Account";
    return "Create Foreign Currency Account";
  };

  const isValid = () => {
    if (accountType === "personal") return true;
    if (accountType === "business") return !!businessName && !!businessType;
    return !!label;
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
          <h2 className="text-white text-base sm:text-lg font-semibold">{getTitle()}</h2>
          <p className="text-white/60 text-sm">
            {accountType === "personal" && "Create a new NGN personal account"}
            {accountType === "business" && "Create a new NGN business account"}
            {accountType === "foreign" && "Create a new foreign currency account"}
          </p>
        </div>

        <div className="px-5 sm:px-6 space-y-3">
          {accountType === "business" && (
            <>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Business Name *</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="text"
                    placeholder="Enter business name"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Business Type *</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="text"
                    placeholder="Enter business type"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Registration Number (Optional)</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="text"
                    placeholder="Enter registration number"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {accountType === "foreign" && (
            <>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Currency *</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <select
                    className="w-full bg-transparent outline-none border-none text-white text-sm"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "USD" | "EUR" | "GBP")}
                  >
                    <option value="USD" className="bg-bg-600">USD</option>
                    <option value="EUR" className="bg-bg-600">EUR</option>
                    <option value="GBP" className="bg-bg-600">GBP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1.5">Account Label *</label>
                <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                  <input
                    type="text"
                    placeholder="e.g., Personal USD Account"
                    className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-5 sm:px-6 pt-3 flex gap-3">
          <CustomButton
            onClick={onClose}
            className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
            disabled={!isValid() || creating}
            isLoading={creating}
            className="flex-1 rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black"
          >
            Create Account
          </CustomButton>
        </div>
      </div>

      <ProfileInfoRequiredModal
        isOpen={showProfileInfoModal}
        onClose={() => setShowProfileInfoModal(false)}
        missingInfo={missingInfo}
      />
    </div>
  );
};

export default CreateAccountModal;

