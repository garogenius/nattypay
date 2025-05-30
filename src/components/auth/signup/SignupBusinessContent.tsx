/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useBusinessRegister, useRegister } from "@/api/auth/auth.queries";
import { motion } from "framer-motion";
import images from "../../../../public/images";
import Image from "next/image";
import AuthInput from "../AuthInput";
import CustomButton from "@/components/shared/Button";
import Link from "next/link";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import useNavigate from "@/hooks/useNavigate";
import { useRef, useState } from "react";
import icons from "../../../../public/icons";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import { useTheme } from "@/store/theme.store";
import DatePicker from "react-datepicker";
import useAuthEmailStore from "@/store/authEmail.store";

const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
  fullname: yup.string().required("Full Name is required"),
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

    companyRegistrationNumber: yup
    .string()
 
    .required("Company Registration Number is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),

  dateOfBirth: yup.string().required("Date of birth is required"),

  countryCode: yup.string().required("Account type is required"),
  referralCode: yup.string(),
});

type RegisterFormData = yup.InferType<typeof schema>;

const CurrencyOptions = [
  {
    value: "NGN",
    label: "NGN",
    available: true,
  },
  {
    value: "USD",
    label: "USD",
    available: false,
  },
  {
    value: "GBP",
    label: "GBP",
    available: false,
  },
  {
    value: "EUR",
    label: "EUR",
    available: false,
  },
];

const SignupBusinessContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setAuthEmail } = useAuthEmailStore();
  const [currencyState, setCurrencyState] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
companyRegistrationNumber: "",
      dateOfBirth: "",
      countryCode: "NGN",
      referralCode: "",
    },
    resolver: yupResolver(schema),
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
  } = form;
  const { errors, isValid } = formState;


  const watchedDateOfBirth = watch("dateOfBirth");
  const watchedCurrency = watch("countryCode");

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

  const onSuccess = (data:any) => {
    const user = data?.data?.user;
    setAuthEmail(user?.email);
    SuccessToast({
      title: "Registration successful!",
      description:
        "Congratulations on your successful registration! 🎉. We are excited to have you onboard!",
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
    signup(data);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => {
    setCurrencyState(false);
  });
  return (
    <div className="relative flex justify-center items-center w-full bg-bg-400 dark:bg-black">
      <div className="flex flex-col justify-center items-center w-full gap-8 mt-32 sm:mt-36 lg:mt-40 xl:mt-48 mb-12 sm:mb-14 lg:mb-16 xl:mb-20">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, type: "tween" }}
          className="flex flex-col justify-start items-start w-full xs:w-[90%] md:w-[80%] lg:w-[65%] xl:w-[55%] 2xl:w-[45%]  bg-transparent xs:bg-bg-600 xs:dark:bg-bg-1100 dark:xs:border dark:border-border-600 rounded-2xl px-6 2xs:px-8 sm:px-10 py-2.5 2xs:py-4 sm:py-6 gap-6 2xs:gap-8 sm:gap-10 md:gap-12"
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
              Create New Account{" "}
            </h2>
          </div>
          <form
            className="flex flex-col justify-start items-start w-full gap-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="w-full flex flex-col md:flex-row gap-4 items-start justify-start ">
              <AuthInput
                id="fullname"
                label="Company Name"
                htmlFor="fullname"
                placeholder="Company Name"
                icon={
                  <Image
                    src={
                      theme === "dark"
                        ? icons.authIcons.userLeftDark
                        : icons.authIcons.userLeft
                    }
                    alt="user"
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                }
                error={errors.fullname?.message}
                {...register("fullname")}
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

            <div
              ref={dropdownRef}
              className="relative w-full flex flex-col gap-1"
            >
              <label
                htmlFor="currencyCode"
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
                          {watchedCurrency} Account
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
                <div className="absolute top-full my-2.5 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
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
                              {currency.label} Account
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
                          className={`w-5 h-5 sm:w-6 sm:h-6 border-2 ${
                            watchedCurrency === currency.value
                              ? "border-primary"
                              : "border-border-200 dark:border-border-100"
                          } rounded-full flex items-center justify-center`}
                        >
                          <div
                            className={`w-3 h-3 bg-primary rounded-full ${
                              watchedCurrency === currency.value
                                ? "block"
                                : "hidden"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                    onSelect={(currency) => {
                      if (currency.available) {
                        setValue("countryCode", currency.value);
                        clearErrors("countryCode");
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

            <AuthInput
              id="email"
              label="Email"
              type="email"
              htmlFor="email"
              placeholder="Email"
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
                                dropdownMode="select" // This enables selecting the year directly
                                openToDate={new Date(2000, 0, 1)} // Opens to year 2000 by default
                              />
                            </div>
                          )}
                        </div>
            
<AuthInput
              id="companyRegistrationNumber"
              label="Company Registration Number"
              htmlFor="companyRegistrationNumber"
              placeholder="Company Registration Number"
              type="text"
              error={errors.companyRegistrationNumber?.message}
              {...register("companyRegistrationNumber")}
            />
            <AuthInput
              id="referralCode"
              label="Referral Code"
              htmlFor="referralCode"
              placeholder="Referral Code"
              type="text"
              error={errors.referralCode?.message}
              {...register("referralCode")}
            />

            <CustomButton
              type="submit"
              disabled={!isValid || registerLoading}
              isLoading={registerLoading}
              className="w-full  border-2 border-primary text-black text-base 2xs:text-lg max-2xs:px-6 py-3.5 xs:py-4"
            >
              Sign Up{" "}
            </CustomButton>

            <p className="w-full flex justify-center items-center gap-1 my-2 xs:my-4 text-base sm:text-lg text-text-200 dark:text-white ">
              Already have an account?{" "}
              <Link className="text-primary" href="/login">
                Login
              </Link>
            </p>
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

export default SignupBusinessContent;
