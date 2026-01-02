"use client";

import { useState, useEffect } from "react";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import Image from "next/image";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import useRegistrationStore from "@/store/registration.store";
import { useRegister, useBusinessRegister } from "@/api/auth/auth.queries";
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

const CurrencySelectionContent = () => {
  const navigate = useNavigate();
  const { registrationData, clearRegistrationData, selectedAccountType } = useRegistrationStore();
  const { setAuthEmail, setRegistrationMethod } = useAuthEmailStore();
  const [selectedCurrency, setSelectedCurrency] = useState<string>("NGN");
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  // All currencies are now available for selection
  const isCurrencyEnabled = (currencyCode: string) => {
    return currencies.some(currency => currency.code === currencyCode && currency.available);
  };

  // Redirect if no registration data (but not if registration just completed)
  useEffect(() => {
    if (!registrationData && !isRegistrationComplete) {
      navigate("/account-type");
    }
  }, [registrationData, navigate, isRegistrationComplete]);

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

  const onSuccess = (data: any) => {
    const user = data?.data?.user;
    const registrationMethod = registrationData?.email ? "email" : "phone";
    
    if (user?.email) {
      setAuthEmail(user.email);
      setRegistrationMethod("email");
    } else if (user?.phoneNumber) {
      setAuthEmail(user.phoneNumber);
      setRegistrationMethod("phone");
    }

    SuccessToast({
      title: "Registration successful!",
      description:
        "Congratulations on your successful registration! 🎉. Please verify your contact to continue.",
    });

    // Mark registration as complete before clearing data
    setIsRegistrationComplete(true);

    // Navigate to verification page based on registration method
    if (registrationMethod === "email") {
      navigate("/verify-email");
    } else {
      navigate("/verify-phoneNumber");
    }

    // Clear registration data after navigation
    setTimeout(() => {
      clearRegistrationData();
    }, 100);
  };

  const {
    mutate: signupPersonal,
    isPending: registerPersonalPending,
  } = useRegister(onError, onSuccess);

  const {
    mutate: signupBusiness,
    isPending: registerBusinessPending,
  } = useBusinessRegister(onError, onSuccess);

  const registerPending = registerPersonalPending || registerBusinessPending;

  const handleProceed = () => {
    if (!registrationData) {
      navigate("/account-type");
      return;
    }

    // Prepare registration payload
    const registrationPayload: any = {
      username: registrationData.username,
      fullname: registrationData.fullname,
      password: registrationData.password,
      dateOfBirth: registrationData.dateOfBirth,
      accountType: registrationData.accountType,
    };

    // Add email or phoneNumber based on what was provided
    if (registrationData.email) {
      registrationPayload.email = registrationData.email;
    }
    if (registrationData.phoneNumber) {
      registrationPayload.phoneNumber = registrationData.phoneNumber;
    }

    // Call appropriate registration API
    if (registrationData.accountType === "BUSINESS") {
      // Business registration uses countryCode instead of currency
      registrationPayload.companyRegistrationNumber = registrationData.companyRegistrationNumber;
      registrationPayload.countryCode = selectedCurrency;
      signupBusiness(registrationPayload);
    } else {
      // Personal registration uses currency
      registrationPayload.currency = selectedCurrency;
      signupPersonal(registrationPayload);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Currency Icon */}
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
            Select your preferred currency to get started. You can manage multiple currencies and exchange rates in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Currency Type</h2>
              <p className="text-sm text-gray-600">Choose your preferred currency for transactions</p>
            </div>

            {/* Currency Options */}
            <div className="space-y-4 mb-6">
              {currencies.map((currency) => {
                const isEnabled = isCurrencyEnabled(currency.code);
                const isSelected = selectedCurrency === currency.code;
                
                return (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => {
                      if (isEnabled) {
                        setSelectedCurrency(currency.code);
                      }
                    }}
                    disabled={!isEnabled}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                      !isEnabled
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "border-[#D4B139] bg-[#D4B139]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{currency.flag}</div>
                      <div className="text-left">
                        <p className={`font-medium ${!isEnabled ? "text-gray-500" : "text-gray-900"}`}>
                          {currency.label}
                        </p>
                        <p className={`text-sm ${!isEnabled ? "text-gray-400" : "text-gray-600"}`}>
                          {currency.description}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        !isEnabled
                          ? "border-gray-300 bg-gray-100"
                          : isSelected
                          ? "border-[#D4B139] bg-[#D4B139]"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && isEnabled && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <CustomButton
                type="button"
                onClick={() => navigate(-1)}
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
                Proceed
              </CustomButton>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 mt-8">
              <p>
                <span className="flex items-center justify-center gap-2 flex-wrap">
                  <span>Licenced by</span>
                  <Image
                    src={images.cbnLogo}
                    alt="CBN Logo"
                    width={40}
                    height={20}
                    className="h-5 w-auto object-contain"
                  />
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Deposits Insured by</span>
                  <span className="text-blue-600 underline">NDIC</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencySelectionContent;






