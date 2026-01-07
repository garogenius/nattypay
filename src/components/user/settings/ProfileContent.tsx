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
import PassportUploadModal from "@/components/modals/settings/PassportUploadModal";
import BankStatementUploadModal from "@/components/modals/settings/BankStatementUploadModal";
import UtilityBillUploadModal from "@/components/modals/settings/UtilityBillUploadModal";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import ChangeTransactionPinModal from "@/components/modals/settings/ChangeTransactionPinModal";
import ChangePasswordModal from "@/components/modals/settings/ChangePasswordModal";
import ChangePasscodeModal from "@/components/modals/settings/ChangePasscodeModal";
import SetSecurityQuestionsModal from "@/components/modals/settings/SetSecurityQuestionsModal";
import LinkedAccountsModal from "@/components/modals/settings/LinkedAccountsModal";
import DeleteAccountModal from "@/components/modals/settings/DeleteAccountModal";
import BiometricTypeSelectionModal from "@/components/modals/settings/BiometricTypeSelectionModal";
import PersonalTab from "@/components/user/settings/tabs/PersonalTab";
import SecurityPrivacyTab from "@/components/user/settings/tabs/SecurityPrivacyTab";
import PreferencesTab from "@/components/user/settings/tabs/PreferencesTab";
import useNavigate from "@/hooks/useNavigate";
import { useUpdateUser, useCreateOvalPerson, useUploadDocument } from "@/api/user/user.queries";
import { updateUserRequest } from "@/api/user/user.apis";
import { CURRENCY } from "@/constants/types";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

// Countries list with ISO codes
const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "EG", name: "Egypt" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "TH", name: "Thailand" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "VN", name: "Vietnam" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "VE", name: "Venezuela" },
  { code: "EC", name: "Ecuador" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panama" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "NI", name: "Nicaragua" },
  { code: "SV", name: "El Salvador" },
  { code: "DO", name: "Dominican Republic" },
  { code: "CU", name: "Cuba" },
  { code: "JM", name: "Jamaica" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "BB", name: "Barbados" },
  { code: "BS", name: "Bahamas" },
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BN", name: "Brunei Darussalam" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CV", name: "Cape Verde" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos (Keeling) Islands" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo, The Democratic Republic of the" },
  { code: "CK", name: "Cook Islands" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "TL", name: "East Timor" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FO", name: "Faroe Islands" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "GI", name: "Gibraltar" },
  { code: "GL", name: "Greenland" },
  { code: "GP", name: "Guadeloupe" },
  { code: "GU", name: "Guam" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "GN", name: "Guinea" },
  { code: "HT", name: "Haiti" },
  { code: "VA", name: "Holy See (Vatican City State)" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IR", name: "Iran, Islamic Republic of" },
  { code: "IQ", name: "Iraq" },
  { code: "IL", name: "Israel" },
  { code: "IM", name: "Isle of Man" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea, Democratic People's Republic of" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Lao People's Democratic Republic" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libyan Arab Jamahiriya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MK", name: "North Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "FM", name: "Micronesia, Federated States of" },
  { code: "MD", name: "Moldova, Republic of" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NC", name: "New Caledonia" },
  { code: "NE", name: "Niger" },
  { code: "NU", name: "Niue" },
  { code: "NF", name: "Norfolk Island" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestinian Territory, Occupied" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PN", name: "Pitcairn" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russian Federation" },
  { code: "RW", name: "Rwanda" },
  { code: "SH", name: "Saint Helena" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SZ", name: "Swaziland" },
  { code: "SY", name: "Syrian Arab Republic" },
  { code: "TW", name: "Taiwan, Province of China" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania, United Republic of" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VG", name: "Virgin Islands, British" },
  { code: "VI", name: "Virgin Islands, U.S." },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
].sort((a, b) => a.name.localeCompare(b.name));

// Employment Status Options
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "employed", label: "Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "homemaker", label: "Homemaker" },
  { value: "other", label: "Other" },
];

// Primary Purpose Options
const PRIMARY_PURPOSE_OPTIONS = [
  { value: "personal", label: "Personal" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "savings", label: "Savings" },
  { value: "trading", label: "Trading" },
  { value: "remittance", label: "Remittance" },
  { value: "other", label: "Other" },
];

// Source of Funds Options
const SOURCE_OF_FUNDS_OPTIONS = [
  { value: "salary", label: "Salary" },
  { value: "business_income", label: "Business Income" },
  { value: "investment_returns", label: "Investment Returns" },
  { value: "savings", label: "Savings" },
  { value: "gift", label: "Gift" },
  { value: "inheritance", label: "Inheritance" },
  { value: "loan", label: "Loan" },
  { value: "other", label: "Other" },
];

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
  // KYC Fields for USD accounts
  name_first: yup.string().optional(),
  name_last: yup.string().optional(),
  name_other: yup.string().optional(),
  id_level: yup.string().optional(),
  id_number: yup.string().optional(),
  id_country: yup.string().optional(),
  bank_id_number: yup.string().optional(),
  // Address fields - matching actual user response structure
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  // Background information - matching actual user response structure
  employmentStatus: yup.string().optional(),
  occupation: yup.string().optional(),
  primaryPurpose: yup.string().optional(),
  sourceOfFunds: yup.string().optional(),
  expectedMonthlyInflow: yup.number().optional(),
});

type UserFormData = yup.InferType<typeof schema>;

const ProfileContent = () => {
  const { user } = useUserStore();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassportIssueDatePicker, setShowPassportIssueDatePicker] = useState(false);
  const [showPassportExpiryDatePicker, setShowPassportExpiryDatePicker] = useState(false);
  const [showBankStatementIssueDatePicker, setShowBankStatementIssueDatePicker] = useState(false);
  const [showBankStatementExpiryDatePicker, setShowBankStatementExpiryDatePicker] = useState(false);
  const [showUtilityBillIssueDatePicker, setShowUtilityBillIssueDatePicker] = useState(false);
  const [showUtilityBillExpiryDatePicker, setShowUtilityBillExpiryDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const passportIssueDatePickerRef = useRef<HTMLDivElement>(null);
  const passportExpiryDatePickerRef = useRef<HTMLDivElement>(null);
  const bankStatementIssueDatePickerRef = useRef<HTMLDivElement>(null);
  const bankStatementExpiryDatePickerRef = useRef<HTMLDivElement>(null);
  const utilityBillIssueDatePickerRef = useRef<HTMLDivElement>(null);
  const utilityBillExpiryDatePickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imgUrl, setImgUrl] = useState(user?.profileImageUrl || "");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tab, setTab] = useState<"personal" | "security" | "preferences" | "kyc">("personal");
  const [selectedDocumentType, setSelectedDocumentType] = useState<"passport" | "bank_statement" | "utility_bill" | "proof_of_address" | "drivers_license" | "national_id" | "">("passport");
  const [documentTypeDropdownOpen, setDocumentTypeDropdownOpen] = useState(false);
  const documentTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [passportCountryDropdownOpen, setPassportCountryDropdownOpen] = useState(false);
  const passportCountryDropdownRef = useRef<HTMLDivElement>(null);
  const [employmentStatusDropdownOpen, setEmploymentStatusDropdownOpen] = useState(false);
  const employmentStatusDropdownRef = useRef<HTMLDivElement>(null);
  const [primaryPurposeDropdownOpen, setPrimaryPurposeDropdownOpen] = useState(false);
  const primaryPurposeDropdownRef = useRef<HTMLDivElement>(null);
  const [sourceOfFundsDropdownOpen, setSourceOfFundsDropdownOpen] = useState(false);
  const sourceOfFundsDropdownRef = useRef<HTMLDivElement>(null);
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
  const [openBiometricTypeSelection, setOpenBiometricTypeSelection] = useState(false);
  const [selectedBiometricType, setSelectedBiometricType] = useState<"fingerprint" | "faceid" | null>(null);
  const [biometricDeviceId] = useState(() => getDeviceId());
  
  // Document upload modal states
  const [openPassportUpload, setOpenPassportUpload] = useState(false);
  const [openBankStatementUpload, setOpenBankStatementUpload] = useState(false);
  const [openUtilityBillUpload, setOpenUtilityBillUpload] = useState(false);

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

  const handleBiometricTypeSelection = async (type: "fingerprint" | "faceid") => {
    // Validate prerequisites
    if (!user?.id) {
      ErrorToast({
        title: "Error",
        descriptions: ["User ID not found. Please refresh the page and try again."],
      });
      setOpenBiometricTypeSelection(false);
      setSelectedBiometricType(null);
      return;
    }

    if (!biometricDeviceId || biometricDeviceId.trim().length === 0) {
      ErrorToast({
        title: "Error",
        descriptions: ["Device ID is not available. Please refresh the page and try again."],
      });
      setOpenBiometricTypeSelection(false);
      setSelectedBiometricType(null);
      return;
    }

    setOpenBiometricTypeSelection(false);
    setSelectedBiometricType(type);

    try {
      const deviceInfo = getDeviceInfo();
      
      // Register the biometric credential (this will prompt user for their biometric)
      // Note: The actual biometric used will be determined by the device/browser
      // We're just specifying which type we want to register it as
      const credential = await registerBiometric({
        userId: user.id,
        username: user?.email || user?.phoneNumber || user?.username || "user",
        displayName:
          (user as any)?.businessName ||
          user?.fullname ||
          user?.username ||
          "NattyPay User",
      });

      // Validate credential was created successfully
      if (!credential || !credential.publicKey) {
        throw new Error("Failed to create biometric credential");
      }

      // Enroll with the selected type
      enrollBiometric({
        deviceId: biometricDeviceId,
        publicKey: credential.publicKey, // Already in PEM format from webauthn.service
        biometricType: type,
        deviceName: deviceInfo?.deviceName || "Web Browser",
      });
    } catch (e: any) {
      // Handle user cancellation specifically
      const errorMessage = e?.message || "Unable to enable biometric login";
      const isUserCancellation = 
        errorMessage.toLowerCase().includes("notallowed") ||
        errorMessage.toLowerCase().includes("abort") ||
        errorMessage.toLowerCase().includes("cancel") ||
        errorMessage.toLowerCase().includes("user cancelled") ||
        e?.name === "NotAllowedError" ||
        e?.name === "AbortError";

      if (!isUserCancellation) {
        ErrorToast({
          title: "Biometric Setup Failed",
          descriptions: [errorMessage],
        });
      }
      // If user cancelled, silently reset state (no error toast needed)
      setSelectedBiometricType(null);
    }
  };

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
  useOnClickOutside(passportIssueDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowPassportIssueDatePicker(false)
  );
  useOnClickOutside(passportExpiryDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowPassportExpiryDatePicker(false)
  );
  useOnClickOutside(bankStatementIssueDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowBankStatementIssueDatePicker(false)
  );
  useOnClickOutside(bankStatementExpiryDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowBankStatementExpiryDatePicker(false)
  );
  useOnClickOutside(utilityBillIssueDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowUtilityBillIssueDatePicker(false)
  );
  useOnClickOutside(utilityBillExpiryDatePickerRef as React.RefObject<HTMLElement>, () =>
    setShowUtilityBillExpiryDatePicker(false)
  );
  useOnClickOutside(passportCountryDropdownRef as React.RefObject<HTMLElement>, () =>
    setPassportCountryDropdownOpen(false)
  );
  useOnClickOutside(employmentStatusDropdownRef as React.RefObject<HTMLElement>, () =>
    setEmploymentStatusDropdownOpen(false)
  );
  useOnClickOutside(primaryPurposeDropdownRef as React.RefObject<HTMLElement>, () =>
    setPrimaryPurposeDropdownOpen(false)
  );
  useOnClickOutside(sourceOfFundsDropdownRef as React.RefObject<HTMLElement>, () =>
    setSourceOfFundsDropdownOpen(false)
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
      // Address fields - matching actual user response structure
      address: (user as any)?.address || "",
      state: (user as any)?.state || "",
      city: (user as any)?.city || "",
      postalCode: (user as any)?.postalCode || "",
      // Background information - check both top-level and nested
      employmentStatus: (user as any)?.employmentStatus || (user as any)?.background_information?.employment_status || "",
      occupation: (user as any)?.occupation || (user as any)?.background_information?.occupation || "",
      primaryPurpose: (user as any)?.primaryPurpose || (user as any)?.background_information?.primary_purpose || "",
      sourceOfFunds: (user as any)?.sourceOfFunds || (user as any)?.background_information?.source_of_funds || "",
      expectedMonthlyInflow: (user as any)?.expectedMonthlyInflow || (user as any)?.background_information?.expected_monthly_inflow || 0,
      // Additional fields for Oval API
      name_first: (user as any)?.name_first || "",
      name_last: (user as any)?.name_last || "",
      name_other: (user as any)?.name_other || "",
      id_level: (user as any)?.id_level || "primary",
      id_number: (user as any)?.id_number || "",
      id_country: (user as any)?.id_country || "",
      bank_id_number: (user as any)?.bank_id_number || "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { register, handleSubmit, formState, watch, setValue, reset, clearErrors } = form;
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
  
  // Handle click outside for document type dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        documentTypeDropdownRef.current &&
        !documentTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setDocumentTypeDropdownOpen(false);
      }
      if (
        passportCountryDropdownRef.current &&
        !passportCountryDropdownRef.current.contains(event.target as Node)
      ) {
        setPassportCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.profileImageUrl) {
      setImgUrl(user.profileImageUrl);
    }
  }, [user]);

  // Update form values when user data changes (e.g., after phone number update or after save)
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
        // Address fields
        address: (user as any)?.address || "",
        state: (user as any)?.state || "",
        city: (user as any)?.city || "",
        postalCode: (user as any)?.postalCode || "",
        // Background information - check both top-level and nested
        employmentStatus: (user as any)?.employmentStatus || (user as any)?.background_information?.employment_status || "",
        occupation: (user as any)?.occupation || (user as any)?.background_information?.occupation || "",
        primaryPurpose: (user as any)?.primaryPurpose || (user as any)?.background_information?.primary_purpose || "",
        sourceOfFunds: (user as any)?.sourceOfFunds || (user as any)?.background_information?.source_of_funds || "",
        expectedMonthlyInflow: (user as any)?.expectedMonthlyInflow || (user as any)?.background_information?.expected_monthly_inflow || 0,
        // KYC Fields
        name_first: (user as any)?.name_first || "",
        name_last: (user as any)?.name_last || "",
        name_other: (user as any)?.name_other || "",
        id_level: (user as any)?.id_level || "primary",
        id_number: (user as any)?.id_number || "",
        id_country: (user as any)?.id_country || "",
        bank_id_number: (user as any)?.bank_id_number || "",
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

  // Store the last submitted form data to preserve values after save
  const lastSubmittedDataRef = useRef<UserFormData | null>(null);

  const onSuccess = (responseData: any) => {
    SuccessToast({
      title: "Update successful!",
      description: "Profile updated successfully",
    });
    
    // Update user store immediately if response contains user data
    if (responseData?.data?.user) {
      const { setUser } = useUserStore.getState();
      setUser(responseData.data.user);
    }

    // Preserve form values that might not be in the API response
    // This ensures fields like occupation, primaryPurpose, etc. remain visible after save
    if (lastSubmittedDataRef.current) {
      const submittedData = lastSubmittedDataRef.current;
      
      // Update form values for fields that might not be in the API response
      if (submittedData.occupation) {
        setValue("occupation", submittedData.occupation);
      }
      if (submittedData.employmentStatus) {
        setValue("employmentStatus", submittedData.employmentStatus);
      }
      if (submittedData.primaryPurpose) {
        setValue("primaryPurpose", submittedData.primaryPurpose);
      }
      if (submittedData.sourceOfFunds) {
        setValue("sourceOfFunds", submittedData.sourceOfFunds);
      }
      if (submittedData.expectedMonthlyInflow) {
        setValue("expectedMonthlyInflow", submittedData.expectedMonthlyInflow);
      }
      if (submittedData.address) {
        setValue("address", submittedData.address);
      }
      if (submittedData.city) {
        setValue("city", submittedData.city);
      }
      if (submittedData.state) {
        setValue("state", submittedData.state);
      }
      if (submittedData.postalCode) {
        setValue("postalCode", submittedData.postalCode);
      }
      
      // Clear the ref after using it
      lastSubmittedDataRef.current = null;
    }
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

  // Upload document API handlers
  const onUploadDocumentError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to upload document"];

    ErrorToast({
      title: "Upload Failed",
      descriptions,
    });
  };

  const onUploadDocumentSuccess = (responseData: any) => {
    // Update user store with the response data
    if (responseData?.data?.data) {
      const { setUser } = useUserStore.getState();
      const documentData = responseData.data.data;
      const documentType = documentData.documentType;
      const documentUrl = documentData.documentUrl;
      
      // Map the document URL to the appropriate user field based on document type
      const updatedUser: any = { ...user };
      if (documentType === "passport") {
        updatedUser.passportDocumentUrl = documentUrl;
        updatedUser.passportIssueDate = documentData.issueDate;
        updatedUser.passportExpiryDate = documentData.expiryDate;
      } else if (documentType === "bank_statement") {
        updatedUser.bankStatementUrl = documentUrl;
        updatedUser.bankStatementIssueDate = documentData.issueDate;
        updatedUser.bankStatementExpiryDate = documentData.expiryDate;
      } else if (documentType === "utility_bill") {
        updatedUser.utilityBillUrl = documentUrl;
        updatedUser.utilityBillIssueDate = documentData.issueDate;
        updatedUser.utilityBillExpiryDate = documentData.expiryDate;
      }
      
      setUser(updatedUser);
    }
    SuccessToast({
      title: "Document Uploaded!",
      description: responseData?.data?.message || "Your document has been uploaded successfully",
    });
  };

  const { mutate: uploadDocument, isPending: uploadDocumentPending } = useUploadDocument(
    onUploadDocumentError,
    onUploadDocumentSuccess
  );

  // Helper function to normalize date to YYYY-MM-DD format
  const normalizeDate = (date: string): string => {
    if (!date) return "";
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Try to parse and format
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const handlePassportUpload = async (data: {
    passportDocumentUrl: string;
    file: File | null;
  }) => {
    if (!data.file) {
      ErrorToast({
        title: "No File Selected",
        descriptions: ["Please select a file to upload"],
      });
      return;
    }

    // Get all required fields from user data (passport fields not in form schema)
    const currentFormData = watch();
    const documentNumber = (user as any)?.passportNumber || "";
    const documentCountry = (user as any)?.passportCountry || "";
    let issueDate = normalizeDate((user as any)?.passportIssueDate || "");
    let expiryDate = normalizeDate((user as any)?.passportExpiryDate || "");

    if (!documentNumber || !documentCountry) {
      ErrorToast({
        title: "Missing Information",
        descriptions: ["Please provide passport number and country before uploading the document"],
      });
      return;
    }

    if (!issueDate || !expiryDate) {
      ErrorToast({
        title: "Missing Information",
        descriptions: ["Please provide both issue date and expiry date in the form before uploading"],
      });
      return;
    }

    // Ensure dates are in YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Issue date must be in YYYY-MM-DD format"],
      });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Expiry date must be in YYYY-MM-DD format"],
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", data.file);
    formData.append("documentType", "passport");
    formData.append("documentNumber", documentNumber);
    formData.append("documentCountry", documentCountry);
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);

    // Call the new upload-document API
    uploadDocument(formData);
  };

  const handleBankStatementUpload = async (data: {
    bankStatementUrl: string;
    file: File | null;
  }) => {
    if (!data.file) {
      ErrorToast({
        title: "No File Selected",
        descriptions: ["Please select a file to upload"],
      });
      return;
    }

    // Get dates from user data (bank statement fields not in form schema)
    const currentFormData = watch();
    let issueDate = normalizeDate((user as any)?.bankStatementIssueDate || "");
    let expiryDate = normalizeDate((user as any)?.bankStatementExpiryDate || "");

    if (!issueDate || !expiryDate) {
      ErrorToast({
        title: "Missing Information",
        descriptions: ["Please provide both issue date and expiry date in the form before uploading"],
      });
      return;
    }

    // Ensure dates are in YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Issue date must be in YYYY-MM-DD format"],
      });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Expiry date must be in YYYY-MM-DD format"],
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", data.file);
    formData.append("documentType", "bank_statement");
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);

    // Call the new upload-document API
    uploadDocument(formData);
  };

  const handleUtilityBillUpload = async (data: {
    utilityBillUrl: string;
    file: File | null;
  }) => {
    if (!data.file) {
      ErrorToast({
        title: "No File Selected",
        descriptions: ["Please select a file to upload"],
      });
      return;
    }

    // Get dates from form or user data
    const currentFormData = watch();
    let issueDate = normalizeDate((user as any)?.utilityBillIssueDate || "");
    let expiryDate = normalizeDate((user as any)?.utilityBillExpiryDate || "");

    if (!issueDate || !expiryDate) {
      ErrorToast({
        title: "Missing Information",
        descriptions: ["Please provide both issue date and expiry date in the form before uploading"],
      });
      return;
    }

    // Ensure dates are in YYYY-MM-DD format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Issue date must be in YYYY-MM-DD format"],
      });
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
      ErrorToast({
        title: "Invalid Date Format",
        descriptions: ["Expiry date must be in YYYY-MM-DD format"],
      });
      return;
    }

    const formData = new FormData();
    formData.append("document", data.file);
    formData.append("documentType", "utility_bill");
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);

    // Call the new upload-document API
    uploadDocument(formData);
  };

  const onOvalPersonError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create/update person record"];

    ErrorToast({
      title: "KYC Update Failed",
      descriptions,
    });
  };

  const onOvalPersonSuccess = () => {
    SuccessToast({
      title: "KYC Information Updated!",
      description: "Your KYC information has been updated successfully",
    });
  };

  const { mutate: createOvalPerson, isPending: creatingOvalPerson } = useCreateOvalPerson(
    onOvalPersonError,
    onOvalPersonSuccess
  );

  const onSubmit = async (data: UserFormData) => {
    // Store the submitted data to preserve form values after save
    lastSubmittedDataRef.current = data;
    
    const formData = new FormData();

    // Add only the required fields from IUpdateUser (backend only accepts these)
    formData.append("fullName", data.fullname);
    formData.append("phoneNumber", data.phoneNumber || "");

    // Add business name if it's a business account
    if (isBusinessAccount && data.businessName) {
      formData.append("businessName", data.businessName);
    }

    // Add address fields
    if (data.address) {
      formData.append("address", data.address);
    }
    if (data.city) {
      formData.append("city", data.city);
    }
    if (data.state) {
      formData.append("state", data.state);
    }
    if (data.postalCode) {
      formData.append("postalCode", data.postalCode);
    }

    // Add employment information
    if (data.employmentStatus) {
      formData.append("employmentStatus", data.employmentStatus);
    }
    if (data.occupation) {
      formData.append("occupation", data.occupation);
    }
    if (data.primaryPurpose) {
      formData.append("primaryPurpose", data.primaryPurpose);
    }
    if (data.sourceOfFunds) {
      formData.append("sourceOfFunds", data.sourceOfFunds);
    }
    if (data.expectedMonthlyInflow) {
      formData.append("expectedMonthlyInflow", data.expectedMonthlyInflow.toString());
    }

    // Add the profile image if one was selected
    if (selectedFile) {
      formData.append("profile-image", selectedFile);
    }

    // Note: KYC fields (passport, bank statement, address, background info) are handled separately
    // via dedicated update functions to avoid "Unexpected field" errors

    // Call the update mutation with the FormData
    update(formData);

    // If KYC fields are filled, also create/update Oval person record
    if (data.name_first && data.name_last && data.id_number && data.id_country) {
      // Use dateOfBirth field (dob not in schema)
      let dobFormatted = "";
      if (!dobFormatted && data.dateOfBirth) {
        try {
          // Try to parse the date format (could be "15-Jan-1990" or already YYYY-MM-DD)
          const dateParts = data.dateOfBirth.split("-");
          if (dateParts.length === 3) {
            if (dateParts[1].length === 3) {
              // Format: "15-Jan-1990"
              const months: { [key: string]: string } = {
                Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
                Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
              };
              const day = dateParts[0].padStart(2, "0");
              const month = months[dateParts[1]] || "01";
              const year = dateParts[2];
              dobFormatted = `${year}-${month}-${day}`;
            } else {
              // Already in YYYY-MM-DD format
              dobFormatted = data.dateOfBirth;
            }
          }
        } catch (e) {
          // If parsing fails, try to use the date directly
          dobFormatted = data.dateOfBirth;
        }
      }

      // Prepare documents array
      const documents: any[] = [];
      const passportUrl = (user as any)?.passportDocumentUrl;
      if (passportUrl) {
        documents.push({
          type: "passport",
          url: passportUrl, // In production, this should be uploaded to Cloudinary first
          issue_date: "2010-01-01", // These should be actual dates from form
          expiry_date: "2030-01-01",
        });
      }
      const bankStatementUrl = (user as any)?.bankStatementUrl;
      if (bankStatementUrl) {
        documents.push({
          type: "bank_statement",
          url: bankStatementUrl, // In production, this should be uploaded to Cloudinary first
          issue_date: "2010-01-01",
          expiry_date: "2030-01-01",
        });
      }

      const ovalPersonData = {
        id_level: (data.id_level as "primary" | "secondary") || "primary",
        id_type: ((user as any)?.id_type as "passport" | "drivers_license" | "national_id") || "passport",
        kyc_level: "basic" as const,
        name_first: data.name_first || "",
        name_last: data.name_last || "",
        name_other: data.name_other || "",
        phone: data.phoneNumber || "",
        email: data.email || "",
        dob: dobFormatted || "",
        id_number: data.id_number || "",
        id_country: data.id_country || "",
        bank_id_number: data.bank_id_number || "",
        address: {
          line1: data.address || "",
          line2: "",
          city: data.city || "",
          state: data.state || "",
          country: data.id_country || "",
          postal_code: data.postalCode || "",
        },
        ...(data.employmentStatus && {
          background_information: {
            employment_status: data.employmentStatus || "",
            occupation: data.occupation || "",
            primary_purpose: data.primaryPurpose || "",
            source_of_funds: data.sourceOfFunds || "",
            expected_monthly_inflow: data.expectedMonthlyInflow || 0,
          },
        }),
        ...(documents.length > 0 && { documents }),
      };

      createOvalPerson(ovalPersonData);
    }
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
        <div className="w-full bg-white/10 rounded-full p-1 sm:p-1.5 md:p-2 overflow-x-auto sm:overflow-visible">
          <div className="flex sm:grid sm:grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 min-w-max sm:min-w-0">
            {[{key:"personal",label:"Personal"},{key:"kyc",label:"KYC Information"},{key:"security",label:"Security & Privacy"},{key:"preferences",label:"Preferences"}].map((t:any)=> (
              <button
                key={t.key}
                onClick={()=> setTab(t.key)}
                type="button"
                className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
                  tab===t.key
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white"
                }`}
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

            {/* Address */}
            <div className="sm:col-span-2 flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"address"}
              >
                Address
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter your address"
                  type="text"
                  {...register("address")}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.address?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.address?.message}
                </p>
              ) : null}
            </div>

            {/* City */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"city"}
              >
                City
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter your city"
                  type="text"
                  {...register("city")}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.city?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.city?.message}
                </p>
              ) : null}
            </div>

            {/* State */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"state"}
              >
                State
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter your state"
                  type="text"
                  {...register("state")}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.state?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.state?.message}
                </p>
              ) : null}
            </div>

            {/* Postal Code */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"postalCode"}
              >
                Postal Code
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter your postal code"
                  type="text"
                  {...register("postalCode")}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.postalCode?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.postalCode?.message}
                </p>
              ) : null}
            </div>

            {/* Employment Status */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"employmentStatus"}
              >
                Employment Status
              </label>
              <div ref={employmentStatusDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => setEmploymentStatusDropdownOpen(!employmentStatusDropdownOpen)}
                  className="w-full flex gap-2 justify-between items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3 text-left"
                >
                  <span className={`text-base ${watch("employmentStatus") ? "text-text-200 dark:text-white" : "text-text-200 dark:text-text-1000"}`}>
                    {watch("employmentStatus") 
                      ? EMPLOYMENT_STATUS_OPTIONS.find(s => s.value === watch("employmentStatus"))?.label || watch("employmentStatus")
                      : "Select employment status"}
                  </span>
                  <FiChevronRight className={`text-text-200 dark:text-text-400 transition-transform ${employmentStatusDropdownOpen ? "rotate-90" : ""}`} />
                </button>
                {employmentStatusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                    {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
                      <div
                        key={status.value}
                        onClick={() => {
                          setValue("employmentStatus", status.value);
                          clearErrors("employmentStatus");
                          setEmploymentStatusDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">{status.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors?.employmentStatus?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.employmentStatus?.message}
                </p>
              ) : null}
            </div>

            {/* Occupation */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"occupation"}
              >
                Occupation
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter your occupation (e.g., Software Engineer)"
                  type="text"
                  {...register("occupation")}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.occupation?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.occupation?.message}
                </p>
              ) : null}
            </div>

            {/* Primary Purpose */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"primaryPurpose"}
              >
                Primary Purpose
              </label>
              <div ref={primaryPurposeDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => setPrimaryPurposeDropdownOpen(!primaryPurposeDropdownOpen)}
                  className="w-full flex gap-2 justify-between items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3 text-left"
                >
                  <span className={`text-base ${watch("primaryPurpose") ? "text-text-200 dark:text-white" : "text-text-200 dark:text-text-1000"}`}>
                    {watch("primaryPurpose") 
                      ? PRIMARY_PURPOSE_OPTIONS.find(p => p.value === watch("primaryPurpose"))?.label || watch("primaryPurpose")
                      : "Select primary purpose"}
                  </span>
                  <FiChevronRight className={`text-text-200 dark:text-text-400 transition-transform ${primaryPurposeDropdownOpen ? "rotate-90" : ""}`} />
                </button>
                {primaryPurposeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                    {PRIMARY_PURPOSE_OPTIONS.map((purpose) => (
                      <div
                        key={purpose.value}
                        onClick={() => {
                          setValue("primaryPurpose", purpose.value);
                          clearErrors("primaryPurpose");
                          setPrimaryPurposeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">{purpose.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors?.primaryPurpose?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.primaryPurpose?.message}
                </p>
              ) : null}
            </div>

            {/* Source of Funds */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"sourceOfFunds"}
              >
                Source of Funds
              </label>
              <div ref={sourceOfFundsDropdownRef} className="relative w-full">
                <button
                  type="button"
                  onClick={() => setSourceOfFundsDropdownOpen(!sourceOfFundsDropdownOpen)}
                  className="w-full flex gap-2 justify-between items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3 text-left"
                >
                  <span className={`text-base ${watch("sourceOfFunds") ? "text-text-200 dark:text-white" : "text-text-200 dark:text-text-1000"}`}>
                    {watch("sourceOfFunds") 
                      ? SOURCE_OF_FUNDS_OPTIONS.find(s => s.value === watch("sourceOfFunds"))?.label || watch("sourceOfFunds")
                      : "Select source of funds"}
                  </span>
                  <FiChevronRight className={`text-text-200 dark:text-text-400 transition-transform ${sourceOfFundsDropdownOpen ? "rotate-90" : ""}`} />
                </button>
                {sourceOfFundsDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                    {SOURCE_OF_FUNDS_OPTIONS.map((source) => (
                      <div
                        key={source.value}
                        onClick={() => {
                          setValue("sourceOfFunds", source.value);
                          clearErrors("sourceOfFunds");
                          setSourceOfFundsDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">{source.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors?.sourceOfFunds?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.sourceOfFunds?.message}
                </p>
              ) : null}
            </div>

            {/* Expected Monthly Inflow */}
            <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
              <label
                className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start"
                htmlFor={"expectedMonthlyInflow"}
              >
                Expected Monthly Inflow
              </label>
              <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                <input
                  className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                  placeholder="Enter expected monthly inflow (e.g., 5000)"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("expectedMonthlyInflow")}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                  <FiEdit2 className="text-xs" />
                </button>
              </div>
              {errors?.expectedMonthlyInflow?.message ? (
                <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                  {errors?.expectedMonthlyInflow?.message}
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

        {tab === "kyc" ? (
          <>
          <div className="flex flex-col gap-6">
            {/* KYC Content */}
            <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
              {/* Document Type Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Select Document Type <span className="text-red-500 ml-1">*</span>
                </label>
                <div ref={documentTypeDropdownRef} className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setDocumentTypeDropdownOpen(!documentTypeDropdownOpen)}
                    className="w-full flex gap-2 justify-between items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3 text-left"
                  >
                    <span className={`text-base ${selectedDocumentType ? "text-text-200 dark:text-white" : "text-text-200 dark:text-text-1000"}`}>
                      {selectedDocumentType === "passport" 
                        ? "International Passport"
                        : selectedDocumentType === "bank_statement"
                        ? "Bank Statement"
                        : selectedDocumentType === "utility_bill"
                        ? "Utility Bill"
                        : selectedDocumentType === "proof_of_address"
                        ? "Proof of Address"
                        : selectedDocumentType === "drivers_license"
                        ? "Driver's License"
                        : selectedDocumentType === "national_id"
                        ? "National ID"
                        : "Select document type"}
                    </span>
                    <FiChevronRight className={`text-text-200 dark:text-text-400 transition-transform ${documentTypeDropdownOpen ? "rotate-90" : ""}`} />
                  </button>
                  {documentTypeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                      <div
                        onClick={() => {
                          setSelectedDocumentType("passport");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">International Passport</span>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedDocumentType("bank_statement");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">Bank Statement</span>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedDocumentType("utility_bill");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">Utility Bill</span>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedDocumentType("proof_of_address");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">Proof of Address</span>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedDocumentType("drivers_license");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">Driver's License</span>
                      </div>
                      <div
                        onClick={() => {
                          setSelectedDocumentType("national_id");
                          setDocumentTypeDropdownOpen(false);
                        }}
                        className="hover:opacity-80 w-full flex items-center justify-between px-4 py-2 gap-2 cursor-pointer"
                      >
                        <span className="w-full text-sm text-text-200 dark:text-text-400">National ID</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedDocumentType === "passport" && (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">International Passport</h3>
                    <p className="text-white/60 text-sm">Enter your passport details and upload the document</p>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Passport Number */}
                    <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                      <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                        Passport Number <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                        <input
                          className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                          placeholder="Enter passport number"
                          type="text"
                          value={(user as any)?.passportNumber || ""}
                          readOnly
                        />
                        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-md bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30">
                          <FiEdit2 className="text-xs" />
                        </button>
                      </div>
                    </div>

                    {/* Passport Country */}
                    <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                      <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                        Country that Issued Passport <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div ref={passportCountryDropdownRef} className="relative w-full">
                        <button
                          type="button"
                          onClick={() => setPassportCountryDropdownOpen(!passportCountryDropdownOpen)}
                          className="w-full flex gap-2 justify-between items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3 text-left"
                        >
                          <span className={`text-base ${(user as any)?.passportCountry ? "text-text-200 dark:text-white" : "text-text-200 dark:text-text-1000"}`}>
                            {(user as any)?.passportCountry 
                              ? COUNTRIES.find(c => c.code === (user as any)?.passportCountry)?.name || (user as any)?.passportCountry
                              : "Select country"}
                          </span>
                          <FiChevronRight className={`text-text-200 dark:text-text-400 transition-transform ${passportCountryDropdownOpen ? "rotate-90" : ""}`} />
                        </button>
                        {passportCountryDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-10 no-scrollbar">
                            <SearchableDropdown
                              items={COUNTRIES}
                              searchKey="name"
                              displayFormat={(country) => (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-text-200 dark:text-text-400">
                                    {country.name} ({country.code})
                                  </span>
                                </div>
                              )}
                               onSelect={(country) => {
                                 // Passport fields not in form schema - handled via separate API
                                 setPassportCountryDropdownOpen(false);
                               }}
                              showSearch={true}
                              placeholder="Search country..."
                              isOpen={passportCountryDropdownOpen}
                              onClose={() => setPassportCountryDropdownOpen(false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Issue Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Issue Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowPassportIssueDatePicker(!showPassportIssueDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.passportIssueDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.passportIssueDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select issue date
                            </div>
                          )}
                        </div>
                      </div>
                      {showPassportIssueDatePicker && (
                        <div ref={passportIssueDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.passportIssueDate ? new Date((user as any)?.passportIssueDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Passport fields not in form schema - handled via separate API
                                setShowPassportIssueDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            maxDate={new Date()}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Expiry Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowPassportExpiryDatePicker(!showPassportExpiryDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.passportExpiryDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.passportExpiryDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select expiry date
                            </div>
                          )}
                        </div>
                      </div>
                      {showPassportExpiryDatePicker && (
                        <div ref={passportExpiryDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.passportExpiryDate ? new Date((user as any)?.passportExpiryDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Passport fields not in form schema - handled via separate API
                                setShowPassportExpiryDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            minDate={new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload Button */}
                  <div className="flex flex-col gap-3">
                    <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                      Passport Document <span className="text-red-500 ml-1">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenPassportUpload(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30 hover:bg-[#D4B139]/25 transition-colors"
                    >
                      <FiUpload className="text-base" />
                      <span>
                        {(user as any)?.passportDocumentUrl
                          ? `Update Passport Document (${(user as any)?.passportNumber || "Uploaded"})`
                          : "Upload Passport Document"}
                      </span>
                    </button>
                    {(user as any)?.passportDocumentUrl && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>✓ Passport document uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <CustomButton
                      type="button"
                      onClick={async () => {
                        const documentNumber = (user as any)?.passportNumber || "";
                        const documentCountry = (user as any)?.passportCountry || "";
                        let issueDate = normalizeDate((user as any)?.passportIssueDate || "");
                        let expiryDate = normalizeDate((user as any)?.passportExpiryDate || "");

                        if (!documentNumber || !documentCountry) {
                          ErrorToast({
                            title: "Missing Information",
                            descriptions: ["Please provide passport number and country"],
                          });
                          return;
                        }

                        if (!issueDate || !expiryDate) {
                          ErrorToast({
                            title: "Missing Information",
                            descriptions: ["Please provide both issue date and expiry date"],
                          });
                          return;
                        }

                        // Ensure dates are in YYYY-MM-DD format
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Issue date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Expiry date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }

                        // Check if document exists - if not, user must upload via modal first
                        if (!(user as any)?.passportDocumentUrl) {
                          ErrorToast({
                            title: "Document Required",
                            descriptions: ["Please upload a passport document first using the upload button above"],
                          });
                          return;
                        }

                        // Fetch the existing document and re-upload with updated metadata
                        try {
                          const response = await fetch((user as any)?.passportDocumentUrl);
                          const blob = await response.blob();
                          const file = new File([blob], "passport.pdf", { type: blob.type });

                          const formData = new FormData();
                          formData.append("document", file);
                          formData.append("documentType", "passport");
                          formData.append("documentNumber", documentNumber);
                          formData.append("documentCountry", documentCountry);
                          formData.append("issueDate", issueDate);
                          formData.append("expiryDate", expiryDate);
                          // Only send required fields - no extra fields

                          uploadDocument(formData);
                        } catch (error) {
                          ErrorToast({
                            title: "Upload Failed",
                            descriptions: ["Failed to fetch existing document. Please upload a new document."],
                          });
                        }
                      }}
                      disabled={uploadDocumentPending}
                      isLoading={uploadDocumentPending}
                      className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold text-base sm:text-lg py-3 rounded-xl"
                    >
                      Save Passport Information
                    </CustomButton>
                  </div>
                </form>
              )}
              {selectedDocumentType === "bank_statement" && (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Bank Statement</h3>
                    <p className="text-white/60 text-sm">Enter bank statement details and upload the document</p>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Issue Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Issue Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowBankStatementIssueDatePicker(!showBankStatementIssueDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.bankStatementIssueDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.bankStatementIssueDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select issue date
                            </div>
                          )}
                        </div>
                      </div>
                      {showBankStatementIssueDatePicker && (
                        <div ref={bankStatementIssueDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.bankStatementIssueDate ? new Date((user as any)?.bankStatementIssueDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Bank statement fields not in form schema - handled via separate API
                                setShowBankStatementIssueDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            maxDate={new Date()}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Expiry Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowBankStatementExpiryDatePicker(!showBankStatementExpiryDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.bankStatementExpiryDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.bankStatementExpiryDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select expiry date
                            </div>
                          )}
                        </div>
                      </div>
                      {showBankStatementExpiryDatePicker && (
                        <div ref={bankStatementExpiryDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.bankStatementExpiryDate ? new Date((user as any)?.bankStatementExpiryDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Bank statement fields not in form schema - handled via separate API
                                setShowBankStatementExpiryDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            minDate={new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload Button */}
                  <div className="flex flex-col gap-3">
                    <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                      Bank Statement Document <span className="text-red-500 ml-1">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenBankStatementUpload(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30 hover:bg-[#D4B139]/25 transition-colors"
                    >
                      <FiUpload className="text-base" />
                      <span>
                        {(user as any)?.bankStatementUrl ? "Update Bank Statement Document" : "Upload Bank Statement Document"}
                      </span>
                    </button>
                    {(user as any)?.bankStatementUrl && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>✓ Bank statement document uploaded</span>
                        {(user as any)?.isAddressVerified && (
                          <span className="text-green-400 ml-2">• Address Verified</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <CustomButton
                      type="button"
                      onClick={async () => {
                        const currentData = watch();
                        let issueDate = normalizeDate((user as any)?.bankStatementIssueDate || "");
                        let expiryDate = normalizeDate((user as any)?.bankStatementExpiryDate || "");

                        if (!issueDate || !expiryDate) {
                          ErrorToast({
                            title: "Missing Information",
                            descriptions: ["Please provide both issue date and expiry date"],
                          });
                          return;
                        }

                        // Ensure dates are in YYYY-MM-DD format
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Issue date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Expiry date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }

                        // Check if document exists - if not, user must upload via modal first
                         if (!(user as any)?.bankStatementUrl) {
                          ErrorToast({
                            title: "Document Required",
                            descriptions: ["Please upload a bank statement document first using the upload button above"],
                          });
                          return;
                        }

                        // Fetch the existing document and re-upload with updated metadata
                        try {
                          const response = await fetch((user as any)?.bankStatementUrl);
                          const blob = await response.blob();
                          const file = new File([blob], "bank_statement.pdf", { type: blob.type });

                          const formData = new FormData();
                          formData.append("document", file);
                          formData.append("documentType", "bank_statement");
                          formData.append("issueDate", issueDate);
                          formData.append("expiryDate", expiryDate);
                          // Only send required fields - no extra fields

                          uploadDocument(formData);
                        } catch (error) {
                          ErrorToast({
                            title: "Upload Failed",
                            descriptions: ["Failed to fetch existing document. Please upload a new document."],
                          });
                        }
                      }}
                      disabled={uploadDocumentPending}
                      isLoading={uploadDocumentPending}
                      className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold text-base sm:text-lg py-3 rounded-xl"
                    >
                      Save Bank Statement Information
                    </CustomButton>
                  </div>
                </form>
              )}
              {selectedDocumentType === "utility_bill" && (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Utilities Bill</h3>
                    <p className="text-white/60 text-sm">Enter utilities bill details and upload the document</p>
                  </div>
                  
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {/* Issue Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Issue Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowUtilityBillIssueDatePicker(!showUtilityBillIssueDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.utilityBillIssueDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.utilityBillIssueDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select issue date
                            </div>
                          )}
                        </div>
                      </div>
                      {showUtilityBillIssueDatePicker && (
                        <div ref={utilityBillIssueDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.utilityBillIssueDate ? new Date((user as any)?.utilityBillIssueDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Utility bill fields not in form schema - handled via separate API
                                setShowUtilityBillIssueDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            maxDate={new Date()}
                          />
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="w-full relative">
                      <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                        <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                          Expiry Date <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div
                          onClick={() => setShowUtilityBillExpiryDatePicker(!showUtilityBillExpiryDatePicker)}
                          className="cursor-pointer w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3"
                        >
                          {(user as any)?.utilityBillExpiryDate ? (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white">
                              {(user as any)?.utilityBillExpiryDate}
                            </div>
                          ) : (
                            <div className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white/50">
                              Select expiry date
                            </div>
                          )}
                        </div>
                      </div>
                      {showUtilityBillExpiryDatePicker && (
                        <div ref={utilityBillExpiryDatePickerRef} className="absolute z-10 mt-1">
                          <DatePicker
                            selected={(user as any)?.utilityBillExpiryDate ? new Date((user as any)?.utilityBillExpiryDate) : null}
                            onChange={(date: Date | null) => {
                              if (date) {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, "0");
                                const day = String(date.getDate()).padStart(2, "0");
                                // Utility bill fields not in form schema - handled via separate API
                                setShowUtilityBillExpiryDatePicker(false);
                              }
                            }}
                            inline
                            calendarClassName="custom-calendar"
                            minDate={new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Upload Button */}
                  <div className="flex flex-col gap-3">
                    <label className="w-full text-sm font-medium text-text-200 dark:text-text-800 mb-0 flex items-start">
                      Utilities Bill Document <span className="text-red-500 ml-1">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenUtilityBillUpload(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#D4B139]/15 text-[#D4B139] border border-[#D4B139]/30 hover:bg-[#D4B139]/25 transition-colors"
                    >
                      <FiUpload className="text-base" />
                      <span>
                        {(user as any)?.utilityBillUrl ? "Update Utilities Bill Document" : "Upload Utilities Bill Document"}
                      </span>
                    </button>
                    {(user as any)?.utilityBillUrl && (
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <span>✓ Utilities bill document uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <CustomButton
                      type="button"
                      onClick={async () => {
                        let issueDate = normalizeDate((user as any)?.utilityBillIssueDate || "");
                        let expiryDate = normalizeDate((user as any)?.utilityBillExpiryDate || "");

                        if (!issueDate || !expiryDate) {
                          ErrorToast({
                            title: "Missing Information",
                            descriptions: ["Please provide both issue date and expiry date"],
                          });
                          return;
                        }

                        // Ensure dates are in YYYY-MM-DD format
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Issue date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
                          ErrorToast({
                            title: "Invalid Date Format",
                            descriptions: ["Expiry date must be in YYYY-MM-DD format"],
                          });
                          return;
                        }

                        // Check if document exists - if not, user must upload via modal first
                        if (!(user as any)?.utilityBillUrl) {
                          ErrorToast({
                            title: "Document Required",
                            descriptions: ["Please upload a utility bill document first using the upload button above"],
                          });
                          return;
                        }

                        // Fetch the existing document and re-upload with updated metadata
                        try {
                          const response = await fetch((user as any).utilityBillUrl);
                          const blob = await response.blob();
                          const file = new File([blob], "utility_bill.pdf", { type: blob.type });

                          const formData = new FormData();
                          formData.append("document", file);
                          formData.append("documentType", "utility_bill");
                          formData.append("issueDate", issueDate);
                          formData.append("expiryDate", expiryDate);
                          // Only send required fields - no extra fields

                          uploadDocument(formData);
                        } catch (error) {
                          ErrorToast({
                            title: "Upload Failed",
                            descriptions: ["Failed to fetch existing document. Please upload a new document."],
                          });
                        }
                      }}
                      disabled={uploadDocumentPending}
                      isLoading={uploadDocumentPending}
                      className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold text-base sm:text-lg py-3 rounded-xl"
                    >
                      Save Utilities Bill Information
                    </CustomButton>
                  </div>
                </form>
              )}
              {!selectedDocumentType && (
                <div className="text-center py-12">
                  <p className="text-white/60 text-sm">Please select a document type to continue</p>
                </div>
              )}
            </div>
          </div>
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

                {/* Fingerprint toggle - HIDDEN FOR NOW */}
                {/* <div className="w-full flex items-center justify-between gap-3 py-3">
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
                </div> */}

                {/* Biometric login toggle - HIDDEN FOR NOW */}
                {/* <div className="w-full flex items-center justify-between gap-3 py-3">
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
                        // First, detect the biometric type
                        const detectedType = await getBiometricType();
                        const defaultBiometricType = detectedType === "face" ? ("faceid" as const) : ("fingerprint" as const);
                        
                        // Show selection modal to let user choose or confirm the type
                        setSelectedBiometricType(defaultBiometricType);
                        setOpenBiometricTypeSelection(true);
                      } catch (e: any) {
                        ErrorToast({
                          title: "Biometric Setup Failed",
                          descriptions: [e?.message || "Unable to detect biometric type"],
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
                </div> */}
              </div>
            </div>

            {/* Privacy */}
            <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
              <p className="text-white font-semibold mb-3">Privacy</p>
              <div className="divide-y divide-white/10">
                <div className="w-full flex items-center justify-between gap-3 py-3 opacity-60 cursor-not-allowed">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiCreditCard className="text-[#D4B139]" /></div>
                    <div>
                      <p className="text-white text-sm sm:text-base font-medium">Linked Cards/ Account</p>
                      <p className="text-white/60 text-xs sm:text-sm">View, add, or remove your linked accounts and cards</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-[#D4B139]/20 text-[#D4B139] text-xs font-medium">Coming Soon</span>
                </div>

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
          onSubmit={(username: string)=> { setValue("username", username); setOpenUpdateUsername(false); SuccessToast({ title: "Username updated", description: "Your username has been successfully updated." }); }}
        />
        <UpdateAddressModal
          isOpen={openUpdateAddress}
          onClose={()=> setOpenUpdateAddress(false)}
          onSubmit={(addr: string)=> { setAddressDisplay(addr); setOpenUpdateAddress(false); SuccessToast({ title: "Address updated", description: "Your address has been successfully updated." }); }}
        />

        {/* Security & Privacy Modals */}
        <ChangeTransactionPinModal isOpen={openChangePin} onClose={()=> setOpenChangePin(false)} />
        <ChangePasswordModal isOpen={openChangePassword} onClose={()=> setOpenChangePassword(false)} />
        <ChangePasscodeModal isOpen={openChangePasscode} onClose={()=> setOpenChangePasscode(false)} />
        <SetSecurityQuestionsModal 
          isOpen={openSetSecurity} 
          onClose={()=> setOpenSetSecurity(false)} 
        />
        <LinkedAccountsModal isOpen={openLinked} onClose={()=> setOpenLinked(false)} />
        <DeleteAccountModal isOpen={openDelete} onClose={()=> setOpenDelete(false)} />
        
        {/* Document Upload Modals */}
        <PassportUploadModal
          isOpen={openPassportUpload}
          onClose={() => setOpenPassportUpload(false)}
          onSubmit={handlePassportUpload}
          initialData={{
            passportDocumentUrl: (user as any)?.passportDocumentUrl || "",
          }}
          isLoading={uploadDocumentPending}
        />
        <BankStatementUploadModal
          isOpen={openBankStatementUpload}
          onClose={() => setOpenBankStatementUpload(false)}
          onSubmit={handleBankStatementUpload}
          initialData={{
            bankStatementUrl: (user as any)?.bankStatementUrl || "",
          }}
          isLoading={uploadDocumentPending}
        />
        <UtilityBillUploadModal
          isOpen={openUtilityBillUpload}
          onClose={() => setOpenUtilityBillUpload(false)}
          onSubmit={handleUtilityBillUpload}
          initialData={{
            utilityBillUrl: (user as any)?.utilityBillUrl || "",
          }}
          isLoading={uploadDocumentPending}
        />
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
        
        {/* Biometric Type Selection Modal */}
        {selectedBiometricType && (
          <BiometricTypeSelectionModal
            isOpen={openBiometricTypeSelection}
            onClose={() => {
              if (!enrollingBiometric) {
                setOpenBiometricTypeSelection(false);
                setSelectedBiometricType(null);
              }
            }}
            onSelect={handleBiometricTypeSelection}
            detectedType={selectedBiometricType}
            isLoading={enrollingBiometric}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default ProfileContent;
