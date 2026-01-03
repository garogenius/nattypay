"use client";

import React, { useState } from "react";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import useRegistrationStore from "@/store/registration.store";
import { useRegister, useBusinessRegister } from "@/api/auth/auth.queries";
import { useCreateCurrencyAccount } from "@/api/currency/currency.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useAuthEmailStore from "@/store/authEmail.store";
import images from "../../../../public/images";

const currencies = [
  {
    code: "NGN",
    label: "NGN Account",
    description: "For transactions in Naira",
    flag: "🇳🇬",
    available: true,
  },
  {
    code: "USD",
    label: "USD Account",
    description: "For transactions in Dollars",
    flag: "🇺🇸",
    available: true,
  },
  {
    code: "GBP",
    label: "GBP Account",
    description: "For transactions in Pounds",
    flag: "🇬🇧",
    available: true,
  },
  {
    code: "EUR",
    label: "EUR Account",
    description: "For transactions in Euro",
    flag: "🇪🇺",
    available: true,
  },
];

const PreRegisterCurrencyContent = () => {
  const navigate = useNavigate();
  const { registrationData, setCountryCode, setCurrency, clearRegistrationData, selectedAccountType, setSelectedAccountType, currency: storedCurrency } = useRegistrationStore();
  const { setAuthEmail } = useAuthEmailStore();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(storedCurrency || "NGN");

  // Update selected currency when stored currency changes
  React.useEffect(() => {
    if (storedCurrency && (storedCurrency === "NGN" || storedCurrency === "USD" || storedCurrency === "EUR" || storedCurrency === "GBP")) {
      setSelectedCurrency(storedCurrency);
    }
  }, [storedCurrency]);

  // If no account type selected, redirect to account type selection
  React.useEffect(() => {
    if (!selectedAccountType && !registrationData) {
      navigate("/account-type");
    }
  }, [selectedAccountType, registrationData, navigate]);

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error during registration",
      descriptions,
    });
  };

  const onCreateAccountSuccess = () => {
    SuccessToast({
      title: "Currency account created!",
      description: `Your ${selectedCurrency} account has been created successfully.`,
    });
    
    // Navigate to email verification if email was used
    if (registrationData?.email) {
      navigate("/verify-email");
    } else {
      navigate("/verify-phoneNumber");
    }
  };

  const onCreateAccountError = (error: any) => {
    // If account already exists (409), that's okay - just proceed
    if (error?.response?.status === 409) {
      onCreateAccountSuccess();
      return;
    }
    
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Account creation failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage || "Could not create currency account"],
    });
    
    // Still proceed to verification even if account creation fails
    if (registrationData?.email) {
      navigate("/verify-email");
    } else {
      navigate("/verify-phoneNumber");
    }
  };

  const {
    mutate: createCurrencyAccount,
    isPending: createAccountPending,
  } = useCreateCurrencyAccount(onCreateAccountError, onCreateAccountSuccess);

  const onSuccess = (data: any) => {
    const user = data?.data?.user;
    if (user?.email) {
      setAuthEmail(user.email);
    }

    SuccessToast({
      title: "Registration successful!",
      description: "Congratulations on your successful registration! 🎉",
    });

    clearRegistrationData();

    // If selected currency is USD, EUR, or GBP, create a multi-currency account
    if (selectedCurrency === "USD" || selectedCurrency === "EUR" || selectedCurrency === "GBP") {
      createCurrencyAccount({
        currency: selectedCurrency as "USD" | "EUR" | "GBP",
        label: `My ${selectedCurrency} Account`,
      });
    } else {
      // For NGN, proceed directly to verification
      if (registrationData?.email) {
        navigate("/verify-email");
      } else {
        navigate("/verify-phoneNumber");
      }
    }
  };

  const {
    mutate: signupPersonal,
    isPending: registerPersonalPending,
  } = useRegister(onError, onSuccess);

  const {
    mutate: signupBusiness,
    isPending: registerBusinessPending,
  } = useBusinessRegister(onError, onSuccess);

  const registerPending = registerPersonalPending || registerBusinessPending || createAccountPending;

  const handleProceed = () => {
    // If no registration data, navigate to registration form with account type and currency
    if (!registrationData) {
      if (!selectedAccountType) {
        navigate("/account-type");
        return;
      }
      
      // Store currency in store for registration form to use
      setCurrency(selectedCurrency);
      setCountryCode(selectedCurrency);
      
      // Navigate to registration form with account type pre-selected
      navigate(`/signup/${selectedAccountType.toLowerCase()}?currency=${selectedCurrency}`);
      return;
    }

    // Ensure selectedCurrency is a valid currency code (NGN, USD, EUR, GBP)
    // API expects currency codes, not country codes like "NG"
    const validCurrency = (selectedCurrency === "NGN" || selectedCurrency === "USD" || selectedCurrency === "EUR" || selectedCurrency === "GBP") 
      ? selectedCurrency 
      : "NGN"; // Default to NGN if invalid

    // Set currency and countryCode in store
    setCurrency(validCurrency);
    setCountryCode(validCurrency);

    // Prepare registration data
    const registrationPayload: any = {
      username: registrationData.username,
      fullname: registrationData.fullname,
      password: registrationData.password,
      countryCode: validCurrency, // Use currency code as countryCode (NGN, USD, EUR, GBP) - NOT "NG"
      accountType: registrationData.accountType,
      dateOfBirth: "", // Will be set in later steps
      referralCode: registrationData.invitationCode || "",
    };

    // Use appropriate registration function based on account type
    if (registrationData.accountType === "BUSINESS") {
      // Business registration payload
      const businessPayload: any = {
        username: registrationData.username,
        fullname: registrationData.fullname,
        password: registrationData.password,
        accountType: "BUSINESS",
        dateOfBirth: "",
        referralCode: registrationData.invitationCode || "",
        countryCode: validCurrency, // Use currency code as countryCode (NGN, USD, EUR, GBP)
      };
      
      if (registrationData.email) {
        businessPayload.email = registrationData.email;
      } else if (registrationData.phoneNumber) {
        businessPayload.email = registrationData.phoneNumber;
      }
      
      signupBusiness(businessPayload);
    } else {
      // Personal registration
      if (registrationData.email) {
        registrationPayload.email = registrationData.email;
      } else if (registrationData.phoneNumber) {
        registrationPayload.email = registrationData.phoneNumber;
      }
      
      signupPersonal(registrationPayload);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
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
            Select your preferred currency for transactions
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Currency & Country Code</h2>
              <p className="text-sm text-gray-600">Choose your preferred currency for transactions</p>
            </div>

            {/* Currency Options */}
            <div className="space-y-4 mb-6">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(currency.code);
                    setCurrency(currency.code); // Store in registration store immediately
                    setCountryCode(currency.code); // Also set countryCode
                  }}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    selectedCurrency === currency.code
                      ? "border-[#D4B139] bg-[#D4B139]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{currency.flag}</div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{currency.label}</p>
                      <p className="text-sm text-gray-600">{currency.description}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedCurrency === currency.code
                        ? "border-[#D4B139] bg-[#D4B139]"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedCurrency === currency.code && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <CustomButton
                type="button"
                onClick={() => {
                  if (registrationData) {
                    navigate(-1);
                  } else {
                    navigate("/account-type");
                  }
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg"
              >
                Back
              </CustomButton>
              <CustomButton
                type="button"
                onClick={handleProceed}
                disabled={registerPending}
                isLoading={registerPending}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                {registrationData ? "Complete Registration" : "Continue to Registration"}
              </CustomButton>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p className="flex items-center justify-center gap-2 flex-wrap">
                <span>Licenced by CBN</span>
                <Image
                  src={images.cbnLogo}
                  alt="CBN Logo"
                  width={40}
                  height={20}
                  className="h-5 w-auto object-contain"
                />
                <span>Deposits Insured by</span>
                <span className="text-blue-600 underline">NDIC</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreRegisterCurrencyContent;

