/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useBusinessRegister } from "@/api/auth/auth.queries";
import { motion } from "framer-motion";
import Image from "next/image";
import AuthInput from "../AuthInput";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { useRef, useState } from "react";
import icons from "../../../../public/icons";
import images from "../../../../public/images";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import { useTheme } from "@/store/theme.store";
import useAuthEmailStore from "@/store/authEmail.store";
import DatePicker from "react-datepicker";
import AccountTypeDescription from "@/components/auth/accountType/AccountTypeDescription";

const schema = yup.object().shape({
  businessName: yup.string().required("Business name is required"),
  currency: yup.string().required("Currency is required"),
  isBusinessRegistered: yup.boolean().required("Please select if your business is registered"),
  email: yup.string().email("Email format is not valid").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords do not match").required("Please confirm your password"),
  username: yup.string().required("Username is required"),
  fullname: yup.string().optional(),
  dateOfBirth: yup.string().optional(),
});

type RegisterFormData = yup.InferType<typeof schema>;

const CurrencyOptions = [
  {
    value: "NGN",
    label: "NGN Account",
    available: true,
  },
  {
    value: "USD",
    label: "USD Account",
    available: false,
  },
  {
    value: "GBP",
    label: "GBP Account",
    available: false,
  },
  {
    value: "EUR",
    label: "EUR Account",
    available: false,
  },
];

const RegisteredOptions = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const SignupBusinessContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [currencyState, setCurrencyState] = useState(false);
  const [registeredState, setRegisteredState] = useState(false);
  const { setAuthEmail } = useAuthEmailStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      businessName: "",
      currency: "NGN",
      isBusinessRegistered: false,
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      fullname: "",
      dateOfBirth: "",
    },
    resolver: yupResolver(schema) as any,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    clearErrors,
    formState,
    reset,
    watch,
    setValue,
    trigger,
  } = form;
  const { errors, isValid } = formState;

  const watchedCurrency = watch("currency");
  const watchedRegistered = watch("isBusinessRegistered");
  const watchedDateOfBirth = watch("dateOfBirth");

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

  const onSuccess = () => {
    SuccessToast({
      title: "Registration successful!",
      description:
        "Congratulations on your successful registration! 🎉. We are excited to have you onboard!",
    });
    navigate("/verify-email");
    reset();
  };

  const {
    mutate: signup,
    isPending: registerPending,
    isError: registerError,
  } = useBusinessRegister(onError, onSuccess);

  const registerLoading = registerPending && !registerError;

  const onSubmit = async (data: RegisterFormData) => {
    setAuthEmail(data?.email);
    // Exclude confirmPassword, businessName, fullname, and dateOfBirth from API request
    const { confirmPassword, businessName, currency, fullname, dateOfBirth, ...restData } = data;
    const registerData: any = {
      ...restData,
      countryCode: currency,
      accountType: "BUSINESS" as const,
      companyRegistrationNumber: businessName || "",
    };
    // Only include fullname and dateOfBirth if they have values
    if (fullname && fullname.trim()) {
      registerData.fullname = fullname.trim();
    }
    if (dateOfBirth && dateOfBirth.trim()) {
      registerData.dateOfBirth = dateOfBirth.trim();
    }
    signup(registerData);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      const newDate = new Date(date);
      const day = newDate.getDate();
      const month = newDate.toLocaleString("en-US", { month: "short" });
      const year = newDate.getFullYear();
      setValue("dateOfBirth", `${day}-${month}-${year}`);
      setShowDatePicker(false);
    }
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => {
    setCurrencyState(false);
    setRegisteredState(false);
    setShowDatePicker(false);
  });

  // Validate required fields for the current step before moving forward
  const stepFields: (keyof RegisterFormData)[][] = [
    ["businessName", "fullname", "username", "currency"],
    ["email", "password", "confirmPassword"],
    ["dateOfBirth"],
    ["isBusinessRegistered"],
  ];

  const handleNext = async () => {
    const fields = stepFields[activeStep] || [];
    if (fields.length === 0) {
      setActiveStep((s) => Math.min(3, s + 1));
      return;
    }
    const valid = await trigger(fields as any, { shouldFocus: true });
    if (valid) setActiveStep((s) => Math.min(3, s + 1));
  };

  return (
    <div className="relative w-full flex flex-col lg:flex-row">
      {/* Left: Hidden on mobile, visible on large screens */}
      <div className="hidden lg:block lg:w-1/2 relative">
        {/* Desktop Logo at top-left */}
        <div className="absolute top-6 left-6 z-50">
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="NattyPay Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
        <AccountTypeDescription />
      </div>
      {/* Right: Form panel. On mobile, full height; on desktop, half width */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-black min-h-screen lg:min-h-0">
        <div className="w-full max-w-xl px-4 sm:px-8 pt-20 pb-8 lg:pt-8">
          {/* Mobile Header: App logo and name (fixed at top-left) */}

          <div className="text-text-200 dark:text-text-400 flex flex-col self-start justify-start items-start gap-2 md:gap-4 mb-6">
            <h1 className="text-xl lg:text-3xl font-bold">Create Business Account</h1>
            <p className="text-base xs:text-lg font-light">Follow the steps below to create your account</p>
          </div>
          {/* Top Progress Stepper */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[
                { title: 'Step 1', desc: 'Details' },
                { title: 'Step 2', desc: 'Security' },
                { title: 'Step 3', desc: 'DOB' },
                { title: 'Step 4', desc: 'Registration' },
              ].map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={async () => {
                    if (i <= activeStep) {
                      setActiveStep(i);
                    } else {
                      await handleNext();
                    }
                  }}
                  className="flex-1 flex flex-col items-center text-xs sm:text-sm"
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center ${activeStep >= i ? 'border-primary' : 'border-border-400 dark:border-border-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${activeStep >= i ? 'bg-primary' : 'bg-transparent'}`} />
                  </div>
                  <p className={`mt-1 font-medium ${activeStep === i ? 'text-primary' : 'text-text-400'}`}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Form Card */}
          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="bg-black dark:bg-black dark:border dark:border-border-600 rounded-2xl p-5 sm:p-7 shadow-lg"
          >
            <div className="text-white flex flex-col gap-1 mb-4">
              {/* <h2 className="text-xl xs:text-2xl lg:text-3xl text-text-200 dark:text-white font-semibold">Create New Account</h2>
              <p className="text-sm text-text-400">Provide your details to continue</p> */}
            </div>
            <form
              className="flex flex-col justify-start items-start w-full gap-4"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Step 1: Business Name, Username, Currency */}
              {activeStep === 0 && (
                <>
                  <div className="w-full flex flex-col md:flex-row gap-4 items-start justify-start ">
                    <AuthInput
                      id="businessName"
                      label="Name of business"
                      htmlFor="businessName"
                      placeholder="Business name"
                      icon={
                        <Image
                          src={
                            theme === "dark"
                              ? icons.authIcons.userLeftDark
                              : icons.authIcons.userLeft
                          }
                          alt="business"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      }
                      error={errors.businessName?.message}
                      {...register("businessName")}
                    />
                    <AuthInput
                      id="username"
                      label="Username"
                      htmlFor="username"
                      placeholder="Username"
                      icon={
                        <Image
                          src={
                            theme === "dark"
                              ? icons.authIcons.userRightDark
                              : icons.authIcons.userRight
                          }
                          alt="user"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      }
                      error={errors.username?.message}
                      {...register("username")}
                    />
                  </div>
                  
                  <AuthInput
                    id="fullname"
                    label="Full Name"
                    htmlFor="fullname"
                    placeholder="Enter your full name"
                    icon={
                      <Image
                        src={
                          theme === "dark"
                            ? icons.authIcons.userLeftDark
                            : icons.authIcons.userLeft
                        }
                        alt="fullname"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    error={errors.fullname?.message}
                    {...register("fullname")}
                  />

                  <div
                    ref={dropdownRef}
                    className="relative w-full flex flex-col gap-1"
                  >
                    <label
                      htmlFor="currency"
                      className="text-base text-text-800 mb-1 flex items-start w-full"
                    >
                      Choose a currency{" "}
                    </label>
                    <div
                      onClick={() => {
                        setCurrencyState(!currencyState);
                      }}
                      className="w-full flex gap-2 justify-center items-center bg-bg-2000 border border-border-600 rounded-lg py-3 px-3"
                    >
                      <div className="w-full flex items-center justify-between ">
                        {!watchedCurrency ? (
                          <p className="text-text-700 dark:text-text-1000 text-sm 2xs:text-base">
                            Select Currency
                          </p>
                        ) : (
                          <div className="flex items-center gap-4">
                            <Image
                              src={
                                getCurrencyIconByString(
                                  watchedCurrency.toLowerCase()
                                ) || ""
                              }
                              alt="currency"
                              className="w-8 h-8 sm:w-9 sm:h-9"
                            />
                            <div className="flex flex-col gap-0 text-text-700 dark:text-text-1000">
                              <p className="2xs:text-base text-sm font-medium">
                                {CurrencyOptions.find(opt => opt.value === watchedCurrency)?.label}
                              </p>
                              <p className="text-[10px] 3xs:text-xs ">
                                Available for everyone
                              </p>
                            </div>
                          </div>
                        )}

                        <motion.svg
                          animate={{
                            rotate: currencyState ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-4 h-4 text-text-700 dark:text-text-1000 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      </div>
                    </div>

                    {currencyState && (
                      <div className="absolute top-full my-2.5 px-1 py-2 overflow-y-auto overscroll-contain h-fit max-h-[60vh] w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-50">
                        <SearchableDropdown
                          items={CurrencyOptions}
                          searchKey="value"
                          showSearch={false}
                          displayFormat={(currency) => (
                            <div className="w-full flex items-center justify-between gap-2">
                              <div className="flex items-center gap-4">
                                <Image
                                  src={
                                    getCurrencyIconByString(
                                      currency.value.toLowerCase()
                                    ) || ""
                                  }
                                  alt="currency"
                                  className="w-8 h-8 sm:w-9 sm:h-9"
                                />
                                <div className="flex flex-col text-text-700 dark:text-text-1000">
                                  <p className="text-sm 2xs:text-base  font-medium">
                                    {currency.label}
                                  </p>
                                  {currency.available ? (
                                    <p className="text-[10px] 3xs:text-xs">
                                      Available for everyone
                                    </p>
                                  ) : (
                                    <p className="text-[10px] 3xs:text-xs text-red-500">
                                      Unavailable
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 sm:w-6 sm:h-6 border-2 ${watchedCurrency === currency.value
                                  ? "border-primary"
                                  : "border-border-200 dark:border-border-100"
                                  } rounded-full flex items-center justify-center`}
                              >
                                <div
                                  className={`w-3 h-3 bg-primary rounded-full ${watchedCurrency === currency.value
                                    ? "block"
                                    : "hidden"
                                    }`}
                                />
                              </div>
                            </div>
                          )}
                          onSelect={(currency) => {
                            if (currency.available) {
                              setValue("currency", currency.value);
                              clearErrors("currency");
                              setCurrencyState(false);
                            } else {
                              setCurrencyState(false);
                              ErrorToast({
                                title: "Currency not available",
                                descriptions: [
                                  "This currency is not available for registration",
                                ],
                              });
                            }
                          }}
                          isOpen={currencyState}
                          onClose={() => setCurrencyState(false)}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 2: Email, Passwords */}
              {activeStep === 1 && (
                <>
                  <AuthInput
                    id="email"
                    label="Email"
                    type="email"
                    htmlFor="email"
                    placeholder="Business email"
                    icon={
                      <Image
                        src={
                          theme === "dark"
                            ? icons.authIcons.mailDark
                            : icons.authIcons.mail
                        }
                        alt="email"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    }
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <div className="w-full flex flex-col md:flex-row gap-4 items-start justify-start ">
                    <AuthInput
                      id="password"
                      label="Password"
                      type="password"
                      htmlFor="password"
                      placeholder="Password"
                      autoComplete="off"
                      icon={
                        <Image
                          src={
                            theme === "dark"
                              ? icons.authIcons.lockDark
                              : icons.authIcons.lock
                          }
                          alt="password"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      }
                      error={errors.password?.message}
                      {...register("password")}
                    />

                    <AuthInput
                      id="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      htmlFor="confirmPassword"
                      placeholder="Confirm Password"
                      icon={
                        <Image
                          src={
                            theme === "dark"
                              ? icons.authIcons.lockDark
                              : icons.authIcons.lock
                          }
                          alt="password"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        />
                      }
                      error={errors.confirmPassword?.message}
                      autoComplete="off"
                      {...register("confirmPassword")}
                    />
                  </div>
                </>
              )}

              {/* Step 3: Date of Birth */}
              {activeStep === 2 && (
                <>
                  <div className="w-full relative">
                    <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                      <label
                        className="w-full text-base text-text-800 mb-1 flex items-start "
                        htmlFor={"dateOfBirth"}
                      >
                        Date of Birth
                      </label>
                      <div
                        onClick={() => setShowDatePicker(true)}
                        className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2000 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                      >
                        {watchedDateOfBirth ? (
                          <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-700 dark:placeholder:text-text-1000 placeholder:text-sm">
                            {watchedDateOfBirth}
                          </div>
                        ) : (
                          <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-700 dark:placeholder:text-text-1000 placeholder:text-sm">
                            Select Date of Birth
                          </div>
                        )}
                      </div>

                      {errors.dateOfBirth?.message ? (
                        <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                          {errors.dateOfBirth?.message}
                        </p>
                      ) : null}
                    </div>

                    {showDatePicker && (
                      <div ref={datePickerRef} className="absolute z-10 mt-1">
                        <DatePicker
                          selected={startDate}
                          onChange={handleDateChange}
                          inline
                          calendarClassName="custom-calendar"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          dropdownMode="select"
                          openToDate={new Date(2000, 0, 1)}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Business Registered */}
              {activeStep === 3 && (
                <div ref={dropdownRef} className="relative w-full flex flex-col gap-1">
                  <label htmlFor="isBusinessRegistered" className="text-base text-text-800 mb-1 flex items-start w-full">
                    Is your business registered
                  </label>
                  <div
                    onClick={() => setRegisteredState(!registeredState)}
                    className="w-full flex gap-2 justify-center items-center bg-bg-2000 border border-border-600 rounded-lg py-3 px-3 cursor-pointer"
                  >
                    <div className="w-full flex items-center justify-between ">
                      <p className="text-text-700 dark:text-text-1000 text-sm 2xs:text-base">
                        {watchedRegistered === true ? "Yes" : watchedRegistered === false ? "No" : "Select"}
                      </p>
                      <motion.svg
                        animate={{ rotate: registeredState ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-4 h-4 text-text-700 dark:text-text-1000 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </motion.svg>
                    </div>
                  </div>
                  {registeredState && (
                    <div className="absolute top-full my-2.5 px-1 py-2 overflow-y-auto h-fit max-h-40 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                      {RegisteredOptions.map((option) => (
                        <div
                          key={option.label}
                          className={`w-full px-3 py-2 cursor-pointer hover:bg-bg-200 dark:hover:bg-bg-900 rounded ${watchedRegistered === option.value ? "bg-primary/10" : ""}`}
                          onClick={() => {
                            setValue("isBusinessRegistered", option.value);
                            clearErrors("isBusinessRegistered");
                            setRegisteredState(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="w-full flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  className={`px-4 py-2 rounded-md border ${activeStep === 0 ? 'opacity-40 cursor-not-allowed' : ''} text-white border-white/30`}
                  disabled={activeStep === 0}
                >
                  Back
                </button>
                {activeStep < 3 ? (
                  <CustomButton
                    type="button"
                    onClick={handleNext}
                    className="min-w-32 border-2 border-primary text-black"
                  >
                    Continue
                  </CustomButton>
                ) : (
                  <CustomButton
                    type="submit"
                    disabled={registerLoading}
                    isLoading={registerLoading}
                    className="min-w-32 border-2 border-primary text-black"
                  >
                    Sign Up
                  </CustomButton>
                )}
              </div>
              {/* Footer */}
              <p className="mt-6 text-base sm:text-lg text-text-200 dark:text-white w-full text-center">
                Already have an account? <Link className="text-primary" href="/login">Login</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupBusinessContent;
