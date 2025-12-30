"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";
import {
  handleNumericKeyDown,
  handleNumericPaste,
} from "@/utils/utilityFunctions";
import DatePicker from "react-datepicker";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { ChangeEvent, useEffect, useRef } from "react";
import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { BsCamera } from "react-icons/bs";
import { FiUpload, FiTrash2, FiEdit2, FiChevronRight, FiKey, FiLock, FiShield, FiCreditCard } from "react-icons/fi";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import ChangeEmailModal from "@/components/modals/settings/ChangeEmailModal";
import VerifyEmailModal from "@/components/modals/settings/VerifyEmailModal";
import ChangePhoneInfoModal from "@/components/modals/settings/ChangePhoneInfoModal";
import ChangePhoneEnterModal from "@/components/modals/settings/ChangePhoneEnterModal";
import UpdateUsernameModal from "@/components/modals/settings/UpdateUsernameModal";
import UpdateAddressModal from "@/components/modals/settings/UpdateAddressModal";
import ChangeTransactionPinModal from "@/components/modals/settings/ChangeTransactionPinModal";
import ChangePasswordModal from "@/components/modals/settings/ChangePasswordModal";
import ChangePasscodeModal from "@/components/modals/settings/ChangePasscodeModal";
import SetSecurityQuestionsModal from "@/components/modals/settings/SetSecurityQuestionsModal";
import LinkedAccountsModal from "@/components/modals/settings/LinkedAccountsModal";
import DeleteAccountModal from "@/components/modals/settings/DeleteAccountModal";
import PersonalTab from "@/components/user/settings/tabs/PersonalTab";
import SecurityPrivacyTab from "@/components/user/settings/tabs/SecurityPrivacyTab";
import PreferencesTab from "@/components/user/settings/tabs/PreferencesTab";
import useNavigate from "@/hooks/useNavigate";
import { useUpdateUser } from "@/api/user/user.queries";
import { CURRENCY } from "@/constants/types";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import VerifyWalletPinModal from "@/components/modals/settings/VerifyWalletPinModal";
import { isFingerprintPaymentAvailable } from "@/services/fingerprintPayment.service";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import {
  clearBiometricCredentials,
  getBiometricType,
  hasBiometricCredential,
  isPlatformAuthenticatorAvailable,
  isWebAuthnSupported,
  registerBiometric,
} from "@/services/webauthn.service";
import { getDeviceId, getDeviceInfo } from "@/services/fcm.service";
import {
  useBiometricDisableV1,
  useBiometricEnrollV1,
  useBiometricStatusV1,
} from "@/api/auth/auth.queries";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email format is not valid")
    .required("Email is required"),
  username: yup.string().required("Username is required"),
  fullname: yup.string().required("Full Name is required"),
  businessName: yup.string().optional(),
  phoneNumber: yup.string().optional(),
  dateOfBirth: yup.string().required("Date of birth is required"),
  referralCode: yup.string().optional(),
  accountTier: yup.string().optional(),
  accountNumber: yup.string().optional(),
});

type UserFormData = yup.InferType<typeof schema>;

const ProfileContent = () => {
  const { user } = useUserStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imgUrl, setImgUrl] = useState(user?.profileImageUrl || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tab, setTab] = useState<"personal" | "security" | "preferences">("personal");
  const [openChangeEmail, setOpenChangeEmail] = useState(false);
  const [openVerifyEmail, setOpenVerifyEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [openChangePhone, setOpenChangePhone] = useState(false);
  const [openEnterPhone, setOpenEnterPhone] = useState(false);
  const [openUpdateUsername, setOpenUpdateUsername] = useState(false);
  const [openUpdateAddress, setOpenUpdateAddress] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState<string>((user as any)?.address || "");
  const [openChangePin, setOpenChangePin] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openChangePasscode, setOpenChangePasscode] = useState(false);
  const [openSetSecurity, setOpenSetSecurity] = useState(false);
  const [openLinked, setOpenLinked] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openVerifyPinForFingerprint, setOpenVerifyPinForFingerprint] = useState(false);
  const [pendingFingerprintEnable, setPendingFingerprintEnable] = useState(false);
  const navigate = useNavigate();
  const currentPhone = user?.phoneNumber || "";
  
  const { fingerprintPaymentEnabled, setFingerprintPaymentEnabled } = usePaymentSettingsStore();
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [isBiometricLoginAvailable, setIsBiometricLoginAvailable] = useState(false);
  const [openDisableBiometricLogin, setOpenDisableBiometricLogin] = useState(false);
  const [biometricDeviceId] = useState(() => getDeviceId());

  useEffect(() => {
    // Check if fingerprint payment is available
    isFingerprintPaymentAvailable().then(setIsFingerprintAvailable);
  }, []);

  useEffect(() => {
    const check = async () => {
      if (!isWebAuthnSupported()) {
        setIsBiometricLoginAvailable(false);
        return;
      }
      const available = await isPlatformAuthenticatorAvailable();
      setIsBiometricLoginAvailable(available);
    };
    check();
  }, []);

  const {
    data: biometricStatusResp,
    isFetching: biometricStatusLoading,
    refetch: refetchBiometricStatus,
  } = useBiometricStatusV1(biometricDeviceId);
  const biometricStatus = (biometricStatusResp as any)?.data as any;
  const biometricEnabledOnServer = !!biometricStatus?.enabled;
  const biometricLocked = !!biometricStatus?.locked;
  const biometricFailedAttempts =
    typeof biometricStatus?.failedAttempts === "number" ? biometricStatus.failedAttempts : undefined;
  const hasLocalCredential = hasBiometricCredential();

  const onBiometricEnrollError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Unable to enable biometric login"];
    ErrorToast({ title: "Biometric Setup Failed", descriptions });
  };

  const onBiometricEnrollSuccess = () => {
    SuccessToast({
      title: "Biometric Login Enabled",
      description: "You can now log in using fingerprint or Face ID on this device.",
    });
    refetchBiometricStatus();
  };

  const { mutate: enrollBiometric, isPending: enrollingBiometric } = useBiometricEnrollV1(
    onBiometricEnrollError,
    onBiometricEnrollSuccess
  );

  const onBiometricDisableError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Unable to disable biometric login"];
    ErrorToast({ title: "Biometric Disable Failed", descriptions });
  };

  const onBiometricDisableSuccess = () => {
    SuccessToast({
      title: "Biometric Login Disabled",
      description: "Biometric login has been disabled on this device.",
    });
    refetchBiometricStatus();
  };

  const { mutate: disableBiometric, isPending: disablingBiometric } = useBiometricDisableV1(
    onBiometricDisableError,
    onBiometricDisableSuccess
  );

  useOnClickOutside(datePickerRef as React.RefObject<HTMLElement>, () =>
    setShowDatePicker(false)
  );
  const accountNumber = user?.wallet?.find(
    (w) => w.currency === CURRENCY.NGN
  )?.accountNumber;
  const isBusinessAccount = user?.accountType === "BUSINESS" || user?.isBusiness === true;
  
  const form = useForm<UserFormData>({
    defaultValues: {
      email: user?.email,
      username: user?.username,
      fullname: user?.fullname,
      businessName: user?.businessName || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: user?.dateOfBirth || "",
      referralCode: user?.referralCode || "",
      accountTier: `Tier ${user?.tierLevel}` || "",
      accountNumber: accountNumber || "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, watch, setValue, reset } = form;
  const { errors, isValid } = formState;
  const watchedDateOfBirth = watch("dateOfBirth");

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const newDate = new Date(date);
      const day = newDate.getDate();
      const month = newDate.toLocaleString("en-US", { month: "short" });
      const year = newDate.getFullYear();
      setValue("dateOfBirth", `${day}-${month}-${year}`);
      setShowDatePicker(false);
    }
  };
  
  useEffect(() => {
    if (user?.profileImageUrl) {
      setImgUrl(user.profileImageUrl);
    }
  }, [user]);

  // Update form values when user data changes (e.g., after phone number update)
  useEffect(() => {
    if (user) {
      const accountNumber = user?.wallet?.find(
        (w) => w.currency === CURRENCY.NGN
      )?.accountNumber;
      
      reset({
        email: user?.email || "",
        username: user?.username || "",
        fullname: user?.fullname || "",
        businessName: user?.businessName || "",
        phoneNumber: user?.phoneNumber || "",
        dateOfBirth: user?.dateOfBirth || "",
        referralCode: user?.referralCode || "",
        accountTier: `Tier ${user?.tierLevel}` || "",
        accountNumber: accountNumber || "",
      }, { keepDefaultValues: false });
    }
  }, [user, reset]);

  const onError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error updating profile",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Update successful!",
      description: "Profile updated successfully",
    });
  };

  const {
    mutate: update,
    isPending: updatePending,
    isError: updateError,
  } = useUpdateUser(onError, onSuccess);

  const updateLoading = updatePending && !updateError;

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (
        extension &&
        (extension === "jpg" ||
          extension === "jpeg" ||
          extension === "png" ||
          extension === "webp")
      ) {
        const fileSize = file.size / 1024; // Convert to KB
        const maxSizeKB = 500; // Maximum size in KB

        if (fileSize <= maxSizeKB) {
          const imageUrl = URL.createObjectURL(file);
          setImgUrl(imageUrl);
          setSelectedFile(file); // Store the file for form submission
        } else {
          toast.error("Selected file size exceeds the limit (500KB).", {
            duration: 3000,
          });
        }
      } else {
        toast.error(
          "Selected file is not a supported image format (JPEG, JPG, PNG, or WebP).",
          {
            duration: 3000,
          }
        );
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: UserFormData) => {
    const formData = new FormData();

    // Add only the required fields from IUpdateUser
    formData.append("fullName", data.fullname);
    formData.append("phoneNumber", data.phoneNumber || "");

    // Add business name if it's a business account
    if (isBusinessAccount && data.businessName) {
      formData.append("businessName", data.businessName);
    }

    // Add the profile image if one was selected
    if (selectedFile) {
      formData.append("profile-image", selectedFile);
    }

    // Call the update mutation with the FormData
    update(formData);
  };

  return (
    <>
    <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
      <div className="flex flex-col gap-5">
        {/* Page Header */}
        <div className="w-full">
          <h1 className="text-white text-xl sm:text-2xl font-semibold">Profile & Settings</h1>
          <p className="text-white/60 text-sm mt-1">Manage your personal information and preferences</p>
        </div>

        {/* Segmented Tabs (responsive) */}
        <div className="w-full bg-white/10 rounded-full p-1.5 sm:p-2 overflow-x-auto sm:overflow-visible">
          <div className="flex sm:grid sm:grid-cols-3 gap-1.5 sm:gap-2 min-w-max sm:min-w-0 max-w-xl">
            {[{key:"personal",label:"Personal"},{key:"security",label:"Security & Privacy"},{key:"preferences",label:"Preferences"}].map((t:any)=> (
              <button
                key={t.key}
                onClick={()=> setTab(t.key)}
                type="button"
                className={`rounded-full px-3 py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${tab===t.key?"bg-white/15 text-white":"text-white/70 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "personal" ? (
        <>
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white/5">
              {imgUrl ? (
                <Image src={imgUrl} alt="profile" fill className="object-cover" />
              ) : (
                <div className="uppercase w-full h-full flex justify-center items-center text-text-200 dark:text-text-400 text-2xl sm:text-3xl">
                  {user?.fullname.slice(0, 2)}
                </div>
              )}
              <button
                type="button"
                onClick={handleFileUpload}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-secondary text-white text-base shadow"
                title="Upload photo"
              >
                <BsCamera />
              </button>
              <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileSelected} />
            </div>
            <div className="flex-1 w-full">
              <p className="text-white font-semibold text-base sm:text-lg">
                {isBusinessAccount && user?.businessName ? user.businessName : user?.fullname}
              </p>
              <p className="text-white/70 text-sm">{user?.email}</p>
              {isBusinessAccount && user?.businessName && (
                <p className="text-white/60 text-xs mt-1">Representative: {user?.fullname}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm inline-flex items-center gap-2"
                >
                  <FiUpload className="text-base" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setImgUrl(""); setSelectedFile(null); }}
                  className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-sm inline-flex items-center gap-2"
                >
                  <FiTrash2 className="text-base" />
                  <span>Remove Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-8">
          <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {isBusinessAccount ? (
              <>
                <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                  <label
                    className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                    htmlFor={"businessName"}
                  >
                    Business Name{" "}
                  </label>
                  <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                    <input
                      className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                      placeholder="Business name"
                      type="text"
                      {...register("businessName")}
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                      <FiEdit2 className="text-xs" />
                    </button>
                  </div>

                  {errors?.businessName?.message ? (
                    <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                      {errors?.businessName?.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                  <label
                    className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                    htmlFor={"fullname"}
                  >
                    Representative Name{" "}
                  </label>
                  <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                    <input
                      className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                      placeholder="Representative name"
                      type="text"
                      {...register("fullname")}
                    />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                      <FiEdit2 className="text-xs" />
                    </button>
                  </div>

                  {errors?.fullname?.message ? (
                    <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                      {errors?.fullname?.message}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                  htmlFor={"fullname"}
                >
                  Full Name{" "}
                </label>
                <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Full name"
                    type="text"
                    {...register("fullname")}
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                    <FiEdit2 className="text-xs" />
                  </button>
                </div>

                {errors?.fullname?.message ? (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors?.fullname?.message}
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"username"}
              >
                Nickname{" "}
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Username"
                  disabled
                  type="text"
                  {...register("username")}
                />
                <button type="button" onClick={()=> setOpenUpdateUsername(true)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>

              {errors?.username?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.username?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"email"}
              >
                Email address{" "}
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Email"
                  type="email"
                  disabled
                  {...register("email")}
                />
                <button type="button" onClick={()=> setOpenChangeEmail(true)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>

              {errors?.email?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.email?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"phoneNumber"}
              >
                Mobile Number{" "}
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Phone Number"
                  type="text"
                  disabled
                  {...register("phoneNumber")}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                />
                <button type="button" onClick={()=> setOpenChangePhone(true)} className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>

              {errors?.phoneNumber?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.phoneNumber?.message}
                </p>
              ) : null}
            </div>

            <div className="w-full relative">
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                  htmlFor={"dateOfBirth"}
                >
                  Date Of Birth
                </label>
                <div
                  onClick={() => setShowDatePicker((v) => !v)}
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
                    selected={
                      watchedDateOfBirth ? new Date(watchedDateOfBirth) : null
                    }
                    onChange={handleDateChange}
                    inline
                    calendarClassName="custom-calendar"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dropdownMode="select"
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"referralCode"}
              >
                Referral Code{" "}
              </label>
              <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Referral Code"
                  disabled
                  type="text"
                  {...register("referralCode")}
                />
              </div>

              {errors?.referralCode?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.referralCode?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"accountTier"}
              >
                Account Type{" "}
              </label>
              <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Account type"
                  disabled
                  type="text"
                  {...register("accountTier")}
                />
              </div>

              {errors?.accountTier?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.accountTier?.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium  text-text-200 dark:text-text-800 mb-0 flex items-start "
                htmlFor={"accountNumber"}
              >
                Account Number{" "}
              </label>
              <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="disabled:opacity-60 w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Account number"
                  disabled
                  type="text"
                  {...register("accountNumber")}
                />
              </div>

              {errors?.accountNumber?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.accountNumber?.message}
                </p>
              ) : null}
            </div>
            </div>
          </div>
          <div className="w-full">
            <CustomButton
              type="submit"
              disabled={!isValid || updateLoading}
              isLoading={updateLoading}
              className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold text-base sm:text-lg py-3 rounded-xl"
            >
              Save
            </CustomButton>
          </div>
        </form>
        </>
        ) : null}

        {tab === "security" ? (
          <div className="flex flex-col gap-4">
            {/* Security */}
            <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
              <p className="text-white font-semibold mb-3">Security</p>
              <div className="divide-y divide-white/10">
                {[{
                  icon: <FiKey className="text-[#D4B139]" />, title: "Change Transaction PIN", desc: "Secure your payments by updating your transaction PIN", onClick: () => setOpenChangePin(true)
                },{
                  icon: <FiLock className="text-[#D4B139]" />, title: "Change Password", desc: "Protect your account by setting a new, stronger password", onClick: () => setOpenChangePassword(true)
                },{
                  icon: <FiLock className="text-[#D4B139]" />, title: "Change Login Passcode", desc: "Update your 6-digit login passcode", onClick: () => setOpenChangePasscode(true)
                },{
                  icon: <FiShield className="text-[#D4B139]" />, title: "Set Security Question", desc: "Add an extra layer of protection with a security question", onClick: () => setOpenSetSecurity(true)
                }].map((it, i)=> (
                  <button key={i} onClick={it.onClick} className="w-full flex items-center justify-between gap-3 py-3 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white">{it.icon}</div>
                      <div>
                        <p className="text-white text-sm sm:text-base font-medium">{it.title}</p>
                        <p className="text-white/60 text-xs sm:text-sm">{it.desc}</p>
                      </div>
                    </div>
                    <FiChevronRight className="text-white/60" />
                  </button>
                ))}

                {/* Fingerprint toggle */}
                <div className="w-full flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiShield className="text-[#D4B139]" /></div>
                    <div>
                      <p className="text-white text-sm sm:text-base font-medium">Use Fingerprint for Payment</p>
                      <p className="text-white/60 text-xs sm:text-sm">
                        {!isFingerprintAvailable
                          ? "Biometric authentication is not available on this device"
                          : "Enable quick and secure payments with your fingerprint."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!isFingerprintAvailable) {
                        ErrorToast({
                          title: "Not Available",
                          descriptions: ["Biometric authentication is not available on this device"],
                        });
                        return;
                      }
                      if (!fingerprintPaymentEnabled) {
                        // Require PIN verification before enabling
                        setPendingFingerprintEnable(true);
                        setOpenVerifyPinForFingerprint(true);
                      } else {
                        // Disable directly
                        setFingerprintPaymentEnabled(false);
                        SuccessToast({
                          title: "Fingerprint Payment Disabled",
                          description: "You can still use your PIN for payments",
                        });
                      }
                    }}
                    disabled={!isFingerprintAvailable}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      !isFingerprintAvailable
                        ? "bg-white/10 cursor-not-allowed"
                        : fingerprintPaymentEnabled
                        ? "bg-[#D4B139]"
                        : "bg-white/20"
                    }`}
                  >
                    <span className={`absolute top-0.5 ${fingerprintPaymentEnabled ? "right-0.5" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`} />
                  </button>
                </div>

                {/* Biometric login toggle */}
                <div className="w-full flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white">
                      <FiShield className="text-[#D4B139]" />
                    </div>
                    <div>
                      <p className="text-white text-sm sm:text-base font-medium">
                        Biometric Login
                      </p>
                      <p className="text-white/60 text-xs sm:text-sm">
                        {!isBiometricLoginAvailable
                          ? "Biometric login is not available on this device."
                          : biometricLocked
                          ? "Biometric login is temporarily locked due to multiple failed attempts."
                          : biometricEnabledOnServer
                          ? hasLocalCredential
                            ? "Enabled on this device. Use fingerprint or Face ID to log in."
                            : "Enabled on your account, but this device is not enrolled. Disable and re-enable to set it up again."
                          : "Enable fingerprint or Face ID login on this device."}
                        {typeof biometricFailedAttempts === "number" && biometricFailedAttempts > 0
                          ? ` (Failed attempts: ${biometricFailedAttempts})`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!isBiometricLoginAvailable) {
                        ErrorToast({
                          title: "Not Available",
                          descriptions: ["Biometric login is not available on this device"],
                        });
                        return;
                      }
                      if (biometricLocked) {
                        ErrorToast({
                          title: "Biometric Login Locked",
                          descriptions: ["Biometric login is locked. Please try again later or use password login."],
                        });
                        return;
                      }
                      if (biometricStatusLoading || enrollingBiometric || disablingBiometric) return;

                      if (biometricEnabledOnServer) {
                        setOpenDisableBiometricLogin(true);
                        return;
                      }

                      if (!user?.id) {
                        ErrorToast({
                          title: "Error",
                          descriptions: ["User ID not found"],
                        });
                        return;
                      }

                      try {
                        const deviceInfo = getDeviceInfo();
                        const credential = await registerBiometric({
                          userId: user.id,
                          username: user?.email || user?.phoneNumber || user?.username || "user",
                          displayName:
                            (user as any)?.businessName ||
                            user?.fullname ||
                            user?.username ||
                            "NattyPay User",
                        });

                        const type = await getBiometricType();
                        const biometricType =
                          type === "face" ? ("faceid" as const) : ("fingerprint" as const);

                        enrollBiometric({
                          deviceId: biometricDeviceId,
                          publicKey: credential.publicKey, // Already in PEM format from webauthn.service
                          biometricType,
                          deviceName: deviceInfo?.deviceName || "Web Browser",
                        });
                      } catch (e: any) {
                        ErrorToast({
                          title: "Biometric Setup Failed",
                          descriptions: [e?.message || "Unable to enable biometric login"],
                        });
                      }
                    }}
                    disabled={
                      !isBiometricLoginAvailable ||
                      biometricLocked ||
                      biometricStatusLoading ||
                      enrollingBiometric ||
                      disablingBiometric
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      !isBiometricLoginAvailable || biometricLocked
                        ? "bg-white/10 cursor-not-allowed"
                        : biometricEnabledOnServer
                        ? "bg-[#D4B139]"
                        : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 ${
                        biometricEnabledOnServer ? "right-0.5" : "left-0.5"
                      } w-5 h-5 rounded-full bg-white transition-all`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
              <p className="text-white font-semibold mb-3">Privacy</p>
              <div className="divide-y divide-white/10">
                <button onClick={()=> setOpenLinked(true)} className="w-full flex items-center justify-between gap-3 py-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiCreditCard className="text-[#D4B139]" /></div>
                    <div>
                      <p className="text-white text-sm sm:text-base font-medium">Linked Cards/ Account</p>
                      <p className="text-white/60 text-xs sm:text-sm">View, add, or remove your linked accounts and cards</p>
                    </div>
                  </div>
                  <FiChevronRight className="text-white/60" />
                </button>

                <div className="w-full flex items-center justify-between gap-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiTrash2 className="text-red-400" /></div>
                    <div>
                      <p className="text-white text-sm sm:text-base font-medium">Delete Account</p>
                      <p className="text-white/60 text-xs sm:text-sm">Permanently delete your NattyPay account</p>
                    </div>
                  </div>
                  <button onClick={()=> setOpenDelete(true)} className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/20 text-red-300 text-sm font-medium">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "preferences" ? (
          <PreferencesTab />
        ) : null}

        {/* Change Email Modal */}
        <ChangeEmailModal
          isOpen={openChangeEmail}
          onClose={() => setOpenChangeEmail(false)}
          onSubmit={(newEmail: string) => {
            setPendingEmail(newEmail);
            setOpenChangeEmail(false);
            setOpenVerifyEmail(true);
          }}
        />
        <VerifyEmailModal
          isOpen={openVerifyEmail}
          onClose={() => setOpenVerifyEmail(false)}
          email={pendingEmail || user?.email || "your email"}
          onSubmit={(code: string) => {
            // TODO: call verify API with code + pendingEmail if available
            setValue("email", pendingEmail || user?.email || "");
            setOpenVerifyEmail(false);
            SuccessToast({ title: "Email verified", description: "Your email has been updated successfully." });
          }}
        />
        <ChangePhoneInfoModal
          isOpen={openChangePhone}
          onClose={() => setOpenChangePhone(false)}
          onNext={() => { setOpenChangePhone(false); setOpenEnterPhone(true); }}
        />
        <ChangePhoneEnterModal
          isOpen={openEnterPhone}
          onClose={() => setOpenEnterPhone(false)}
          currentPhone={currentPhone}
          onValidateSuccess={() => {
            // Phone number is already updated, just close the modal
            setOpenEnterPhone(false);
          }}
        />

        {/* Username & Address Modals */}
        <UpdateUsernameModal
          isOpen={openUpdateUsername}
          onClose={()=> setOpenUpdateUsername(false)}
          onSubmit={(username: string)=> { setValue("username", username); setOpenUpdateUsername(false); SuccessToast({ title: "Username updated" }); }}
        />
        <UpdateAddressModal
          isOpen={openUpdateAddress}
          onClose={()=> setOpenUpdateAddress(false)}
          onSubmit={(addr: string)=> { setAddressDisplay(addr); setOpenUpdateAddress(false); SuccessToast({ title: "Address updated" }); }}
        />

        {/* Security & Privacy Modals */}
        <ChangeTransactionPinModal isOpen={openChangePin} onClose={()=> setOpenChangePin(false)} />
        <ChangePasswordModal isOpen={openChangePassword} onClose={()=> setOpenChangePassword(false)} />
        <ChangePasscodeModal isOpen={openChangePasscode} onClose={()=> setOpenChangePasscode(false)} />
        <SetSecurityQuestionsModal isOpen={openSetSecurity} onClose={()=> setOpenSetSecurity(false)} onSubmit={()=> { setOpenSetSecurity(false); SuccessToast({ title: "Security questions saved" }); }} />
        <LinkedAccountsModal isOpen={openLinked} onClose={()=> setOpenLinked(false)} />
        <DeleteAccountModal isOpen={openDelete} onClose={()=> setOpenDelete(false)} />
        <VerifyWalletPinModal
          isOpen={openVerifyPinForFingerprint}
          onClose={() => {
            setOpenVerifyPinForFingerprint(false);
            setPendingFingerprintEnable(false);
          }}
          onSuccess={() => {
            if (pendingFingerprintEnable) {
              setFingerprintPaymentEnabled(true);
              SuccessToast({
                title: "Fingerprint Payment Enabled",
                description: "You can now use fingerprint or Face ID for payments",
              });
              setPendingFingerprintEnable(false);
            }
            setOpenVerifyPinForFingerprint(false);
          }}
        />

        {/* Disable Biometric Login Confirmation */}
        <ConfirmDialog
          isOpen={openDisableBiometricLogin}
          title="Disable Biometric Login?"
          description="You will need to use password login on this device. You can enable biometric login again anytime."
          confirmText="Disable"
          cancelText="Cancel"
          isLoading={disablingBiometric}
          onCancel={() => setOpenDisableBiometricLogin(false)}
          onConfirm={() => {
            setOpenDisableBiometricLogin(false);
            disableBiometric({ deviceId: biometricDeviceId });
            clearBiometricCredentials();
          }}
        />
      </div>
    </div>
    </>
  );
};

export default ProfileContent;
