/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import React, { useState, useRef } from "react";
import Link from "next/link";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import useAuthEmailStore from "@/store/authEmail.store";
import useRegistrationStore from "@/store/registration.store";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const schema = yup.object().shape({
  tab: yup.string().oneOf(["mobile", "email"]).required(),
  mobileNumber: yup.string().when("tab", {
    is: "mobile",
    then: (schema) => schema.required("Mobile number is required"),
    otherwise: (schema) => schema.optional(),
  }),
  email: yup.string().when("tab", {
    is: "email",
    then: (schema) => schema.email("Email format is not valid").required("Email is required"),
    otherwise: (schema) => schema.optional(),
  }),
  username: yup.string().required("Username is required"),
  fullname: yup.string().required("Full name is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  companyRegistrationNumber: yup.string().required("Company registration number is required"),
  invitationCode: yup.string().optional(),
  termsAccepted: yup.boolean().oneOf([true], "You must accept the terms and conditions"),
});

type CreateAccountFormData = yup.InferType<typeof schema> & { tab: "mobile" | "email" };

const CreateAccountBusinessContent = () => {
  const navigate = useNavigate();
  const authEmailStore = useAuthEmailStore();
  const { setAuthEmail, setRegistrationMethod } = authEmailStore;
  const { setRegistrationData } = useRegistrationStore();
  const [activeTab, setActiveTab] = useState<"mobile" | "email">("mobile");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInvitationCode, setShowInvitationCode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(datePickerRef as React.RefObject<HTMLElement>, () =>
    setShowDatePicker(false)
  );

  const form = useForm<CreateAccountFormData>({
    defaultValues: {
      tab: "mobile",
      mobileNumber: "",
      email: "",
      username: "",
      fullname: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      companyRegistrationNumber: "",
      invitationCode: "",
      termsAccepted: false,
    },
    resolver: yupResolver(schema) as any,
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const watchedDateOfBirth = watch("dateOfBirth");
  const watchedTerms = watch("termsAccepted");

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

  const onSubmit = async (data: CreateAccountFormData) => {
    try {
      // Store registration data temporarily (without currency)
      const registrationData: any = {
        username: data.username,
        fullname: data.fullname,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        accountType: "BUSINESS",
        companyRegistrationNumber: data.companyRegistrationNumber,
      };

      // Add email or phoneNumber based on active tab
      if (data.tab === "email") {
        registrationData.email = data.email;
        setAuthEmail(data.email || "");
        setRegistrationMethod("email");
      } else {
        // Format phone number with country code if not already formatted
        let phoneNumber = data.mobileNumber || "";
        if (phoneNumber && !phoneNumber.startsWith("+")) {
          // Add +234 prefix if not present
          phoneNumber = phoneNumber.startsWith("234") ? `+${phoneNumber}` : `+234${phoneNumber}`;
        }
        registrationData.phoneNumber = phoneNumber;
        setAuthEmail(phoneNumber);
        setRegistrationMethod("phone");
      }

      setRegistrationData(registrationData);

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to currency selection page
      navigate("/currency-selection");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full overflow-hidden">
      {/* Left Panel - Yellow/Gold Background */}
      <div className="hidden lg:flex lg:w-[40%] bg-[#D4B139] relative items-center justify-center">
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Business Account Icon */}
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Business Account</h1>
          <p className="text-lg text-white/90 text-center max-w-md">
            Create a business account to manage your company finances, accept payments, and access business banking features.
          </p>
        </div>
      </div>

      {/* Right Panel - White Background with Form */}
      <div className="w-full lg:w-[60%] bg-white flex flex-col items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h2>
            <p className="text-sm text-gray-600 mb-6">You Can Use Your Email or Mobile Number</p>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("mobile");
                  setValue("tab", "mobile");
                }}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "mobile"
                    ? "text-[#D4B139] border-b-2 border-[#D4B139]"
                    : "text-gray-600"
                }`}
              >
                Mobile Number
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("email");
                  setValue("tab", "email");
                }}
                className={`pb-2 text-sm font-medium ${
                  activeTab === "email"
                    ? "text-[#D4B139] border-b-2 border-[#D4B139]"
                    : "text-gray-600"
                }`}
              >
                Email
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Mobile Number or Email */}
              {activeTab === "mobile" ? (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="Enter your number"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("mobileNumber")}
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              )}

              {/* Username and Full Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("fullname")}
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>
                  )}
                </div>
              </div>

              {/* Company Registration Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Company Registration Number</label>
                <input
                  type="text"
                  placeholder="Enter company registration number"
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                  {...register("companyRegistrationNumber")}
                />
                {errors.companyRegistrationNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyRegistrationNumber.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1 relative">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <div
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="cursor-pointer w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                >
                  {watchedDateOfBirth || "Select Date of Birth"}
                </div>
                {showDatePicker && (
                  <div ref={datePickerRef} className="absolute z-10 mt-1">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      maxDate={new Date()}
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
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Pass code</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 Characters"
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Confirm Passcode</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Pass code"
                      className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Invitation Code - Collapsible */}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setShowInvitationCode(!showInvitationCode)}
                  className="flex items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span>Invitation Code</span>
                  {showInvitationCode ? (
                    <FiChevronUp className="w-5 h-5" />
                  ) : (
                    <FiChevronDown className="w-5 h-5" />
                  )}
                </button>
                {showInvitationCode && (
                  <input
                    type="text"
                    placeholder="INVITATION CODE"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder:text-gray-400 uppercase focus:outline-none focus:ring-2 focus:ring-[#D4B139] focus:border-transparent"
                    {...register("invitationCode")}
                  />
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-[#D4B139] border-gray-300 rounded focus:ring-[#D4B139]"
                  {...register("termsAccepted")}
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I have read, understand, and agreed to Terms & Conditions and Privacy Policy
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs">{errors.termsAccepted.message}</p>
              )}

              {/* Proceed Button */}
              <CustomButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3.5 rounded-lg text-base mt-4"
              >
                Proceed
              </CustomButton>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 mt-4">
                Already have NattyPay account?{" "}
                <Link href="/login" className="text-[#D4B139] font-medium">
                  Login
                </Link>
              </p>
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

export default CreateAccountBusinessContent;

