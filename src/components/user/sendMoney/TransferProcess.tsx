/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoWalletOutline } from "react-icons/io5";
import { RiBankLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import CustomButton from "@/components/shared/Button";
import {
  formatNumberWithCommas,
  handleNumericKeyDown,
  handleNumericPaste,
} from "@/utils/utilityFunctions";
import {
  useGetAllBanks,
  useGetTransferFee,
  useInitiateTransfer,
  useVerifyAccount,
} from "@/api/wallet/wallet.queries";
import { verifyAccountRequest } from "@/api/wallet/wallet.apis";
import SuccessToast from "@/components/toast/SuccessToast";
import ErrorToast from "@/components/toast/ErrorToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import {
  BankProps,
  BENEFICIARY_TYPE,
  BeneficiaryProps,
  TRANSFER_TYPE,
} from "@/constants/types";
import { Switch } from "@mui/material";
import { addBeneficiaryLabel } from "../bill/bill.data";
import { useTheme } from "@/store/theme.store";
import useUserStore from "@/store/user.store";
import Beneficiaries from "./Beneficiaries";
import { useGetBeneficiaries } from "@/api/user/user.queries";
import Image from "next/image";
import images from "../../../../public/images";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import { verifyPinWithBiometric, isFingerprintPaymentAvailable } from "@/services/fingerprintPayment.service";
import { RiFingerprintLine } from "react-icons/ri";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import { isInsufficientBalanceError, extractBalanceInfo } from "@/utils/errorUtils";



interface TransactionResponse {
  id: string;
  transactionRef: string;
  type: string;
  status: string;
  currency: string;
  description: string;
  previousBalance: number;
  currentBalance: number;
  category: string;
  narration:string
  createdAt: string;
  updatedAt: string;
  transferDetails: {
    fee: number;
    amount: number;
    beneficiaryAccountNumber:string,
    beneficiaryBankName:string,
    beneficiaryName:string,
    sessionId: string;
    amountPaid: number;
    senderName: string;
    senderBankName?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  }

}

const transferMethods = [
  {
    id: 1,
    label: "Send to Nattypay",
    value: "nattypay",
    icon: IoWalletOutline,
  },
  {
    id: 2,
    label: "Send to Bank",
    value: "bank",
    icon: RiBankLine,
  },
];

const schema = yup.object().shape({
  bankCode: yup.string().required("Bank Code is required"),

  accountNumber: yup
    .string()
    .required("Account Number is required")
    .min(10, "Account Number must be 10 digits")
    .max(10, "Account Number must be 10 digits"),

  // amount: yup
  //   .number()
  //   .required("Amount is required")
  //   .typeError("Amount is required")
  //   .min(50, "Minimum amount is ₦50"),

  amount: yup
  .string()
  .required("Amount is required")
  .test("is-number", "Amount must be a valid number", (value) => {
    const numValue = Number(value?.replace(/,/g, ''));
    return !isNaN(numValue);
  })
  .test("min", "Minimum amount is ₦50", (value) => {
    const numValue = Number(value?.replace(/,/g, ''));
    return numValue >= 50;
  }),

  currency: yup.string().required("Currency is required"),
  sessionId: yup.string().required("Session ID is required"),

  description: yup.string().optional(),
});

type TransferFormData = yup.InferType<typeof schema>;

interface BankResponseData {
  responseCode: string;
  responseMessage: string;
  sessionId: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  kycLevel: string;
  bvn: string;
}

const TransferProcess = ({ onStepChange, compact = false, initialType, onBackFirstStep }: { onStepChange?: (step: number) => void; compact?: boolean; initialType?: "nattypay" | "bank"; onBackFirstStep?: () => void }) => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<string>(initialType || "nattypay");
  const [bankData, setBankData] = useState<BankResponseData | null>(null);
  const [bankState, setBankState] = useState(false);
  const [isDetectingBank, setIsDetectingBank] = useState(false);
  const [isBankAutoDetected, setIsBankAutoDetected] = useState(false);
  const detectReqIdRef = useRef(0);
  const [screen, setScreen] = useState<number>(0);
  const goTo = (s: number) => {
    setScreen(s);
    onStepChange && onStepChange(s);
  };

  const buildTransactionFromState = (): TransactionResponse => {
    const now = new Date().toISOString();
    return {
      id: watchedSessionId || String(Date.now()),
      transactionRef: watchedSessionId || String(Date.now()),
      type: "transfer",
      status: "Success",
      currency: "NGN",
      description: watchedDescription || "",
      previousBalance: 0,
      currentBalance: 0,
      category: selectedType === "bank" ? "Inter Bank Transfer" : "Intra Bank Transfer",
      narration: watchedDescription || "",
      createdAt: now,
      updatedAt: now,
      transferDetails: {
        fee: Number(fee || 0),
        amount: watchedAmount,
        beneficiaryAccountNumber: bankData?.accountNumber || "",
        beneficiaryBankName: bankName || (selectedType === "nattypay" ? "Nattypay" : ""),
        beneficiaryName: bankData?.accountName || "",
        sessionId: watchedSessionId || "",
        amountPaid: watchedAmount,
        senderName: "",
      },
    } as TransactionResponse;
  };

  useEffect(() => {
    onStepChange && onStepChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedBank, setSelectedBank] = useState<BankProps>();
  const [pin, setPin] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [isBeneficiaryChecked, setIsBeneficiaryChecked] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'saved'>( 'recent');
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);
  const [isFingerprintAvailable, setIsFingerprintAvailable] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{ requiredAmount?: number; currentBalance?: number }>({});

  const { banks } = useGetAllBanks();

  const { user } = useUserStore();
  const { fingerprintPaymentEnabled } = usePaymentSettingsStore();
  const ngnWallet = user?.wallet?.find((w) => w.currency?.toLowerCase() === 'ngn');
  const availableBalance = ngnWallet?.balance ?? 0;

  useEffect(() => {
    // Check if fingerprint payment is available
    isFingerprintPaymentAvailable().then(setIsFingerprintAvailable);
  }, []);

  const form = useForm<TransferFormData>({
    defaultValues: {
      bankCode: "",
      accountNumber: "",
      amount: undefined,
      currency: "NGN",
      description: "",
      sessionId: "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState,
    reset,
    watch,
    setValue,
    clearErrors,
  } = form;
  const { errors, isValid } = formState;

  const watchedAccountNumber = watch("accountNumber");
  const watchedBankCode = watch("bankCode");
  const watchedAmountValue = watch("amount");
  const watchedAmount = watchedAmountValue && typeof watchedAmountValue === "string" 
    ? Number(watchedAmountValue.replace(/,/g, '')) 
    : typeof watchedAmountValue === "number" 
      ? watchedAmountValue 
      : 0;
  const watchedDescription = watch("description");
  const watchedSessionId = watch("sessionId");

  const { fee: feeArray } = useGetTransferFee({
    currency: "NGN",
    amount: watchedAmount,
    active: selectedType === "bank",
  });
  
  // Extract fee value from array (fee is returned as number[] from API)
  const fee = Array.isArray(feeArray) && feeArray.length > 0 ? feeArray[0] : (typeof feeArray === "number" ? feeArray : 0);

  const onVerifyAccountError = async (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error during Account Verification",
      descriptions,
    });
  };

  const onVerifyAccountSuccess = (data: any) => {
    setBankData(data?.data?.data);
    setValue("sessionId", data?.data?.data?.sessionId);

    if (selectedType === "nattypay") {
      setValue("bankCode", data?.data?.data?.bankCode);
    }
  };

  const {
    mutate: verifyAccount,
    isPending: verifyAccountPending,
    isError: verifyAccountError,
  } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  const verifyLoading = verifyAccountPending && !verifyAccountError;

  const tryAutoDetectBank = async (acctNumber: string) => {
    const reqId = ++detectReqIdRef.current;
    setIsDetectingBank(true);
    try {
      const normalizedBanks = (banks || [])
        .map((b: any) => ({
          bankCode: String(b?.bankCode ?? b?.code ?? b?.bank_code ?? ""),
          name: String(b?.name ?? b?.bankName ?? b?.bank_name ?? ""),
          raw: b,
        }))
        .filter((b: any) => !!b.bankCode);

      for (const b of normalizedBanks) {
        try {
          const res = await verifyAccountRequest({
            accountNumber: acctNumber,
            bankCode: b.bankCode,
          });

          if (detectReqIdRef.current !== reqId) return;

          const responseData = res?.data?.data || res?.data || {};
          const detectedAccountName =
            responseData?.accountName || responseData?.account_name || "";
          const detectedSessionId =
            responseData?.sessionId || responseData?.session_id || "";
          if (detectedAccountName) {
            const detectedBankCode =
              String(responseData?.bankCode || responseData?.bank_code || b.bankCode) || b.bankCode;
            const detectedBankName =
              String(responseData?.bankName || responseData?.bank_name || b.name) || b.name;

            setBankData(responseData);
            setValue("sessionId", detectedSessionId);
            setValue("bankCode", detectedBankCode);
            clearErrors("bankCode");
            setBankName(detectedBankName);
            setIsBankAutoDetected(true);
            setBankState(false);
            const foundBank = (banks || []).find(
              (x: any) => String(x?.bankCode ?? x?.code ?? "") === detectedBankCode
            );
            if (foundBank) setSelectedBank(foundBank);
            return;
          }
        } catch {
          // keep trying other banks
        }
      }

      if (detectReqIdRef.current !== reqId) return;
      ErrorToast({
        title: "Unable to detect bank",
        descriptions: ["Please select the recipient bank manually."],
      });
    } finally {
      if (detectReqIdRef.current === reqId) setIsDetectingBank(false);
    }
  };

  useEffect(() => {
    if (watchedAccountNumber && watchedAccountNumber.length === 10) {
      if (selectedType === "nattypay") {
        verifyAccount({ accountNumber: watchedAccountNumber });
      } else {
        if (watchedBankCode) {
          verifyAccount({
            accountNumber: watchedAccountNumber,
            bankCode: watchedBankCode,
          });
        } else {
          const t = setTimeout(() => {
            tryAutoDetectBank(watchedAccountNumber);
          }, 350);
          return () => clearTimeout(t);
        }
      }
    } else {
      detectReqIdRef.current += 1;
      setIsDetectingBank(false);
    }
  }, [watchedAccountNumber, watchedBankCode, selectedType, verifyAccount]);

  const onError = async (error: any) => {
    // Check if it's an insufficient balance error
    if (isInsufficientBalanceError(error)) {
      const info = extractBalanceInfo(error);
      // If we don't have balance info from error, use the wallet balance
      if (!info.currentBalance && ngnWallet) {
        info.currentBalance = ngnWallet.balance || 0;
      }
      // If we don't have required amount, use the transfer amount + fee
      if (!info.requiredAmount) {
        const feeValue = typeof fee === "number" ? fee : 0;
        const totalAmount = watchedAmount + feeValue;
        info.requiredAmount = totalAmount;
      }
      setBalanceInfo(info);
      setShowInsufficientBalanceModal(true);
      // Don't navigate to error screen, just show the insufficient balance modal
      return;
    }

    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    setPaymentSuccess(false);
    setPaymentError(descriptions[0] || "Payment failed. Please try again.");
    goTo(4); // Navigate to result screen to show failure
  };

  const onSuccess = ({transaction}:any) => {
    console.log('Transaction Data:', transaction);
    setTransaction(transaction);
    setPaymentSuccess(true);
    setPaymentError(null);
    goTo(4); // Navigate to result screen to show success
  };

  const ReceiptTemplate = ({ transaction }: { transaction: TransactionResponse }) => {
    const formattedDate = format(new Date(transaction.createdAt), "EEEE, MMMM d, yyyy h:mm a");
    const formatSenderName = (senderName: string) => {
      return senderName?.replace(/^(NATTYPAY|NATTYPAYGLOBALS)\s*\/\s*/, '') || '';
    };
  
    return (
      <div id="receipt-container" className="flex flex-col max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">
        <div className="bg-amber-100 p-4 rounded-b-2xl relative">
          <div className="absolute -left-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
          <div className="absolute -right-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
          
          <div className="flex items-center justify-between mb-3">
  <div className="flex items-center bg-white p-2 rounded-lg"> {/* Added bg-white, p-2, and rounded-lg */}
  <Image 
    src={images.logo} 
    alt="logo" 
    className="h-10 w-auto font-bold" // Increased height from h-8 to h-10
    style={{ 
      objectFit: 'contain',
      width: 'auto',
      minWidth: '120px' // Added minimum width to ensure logo is not too small
    }}
  />
  </div>
  <div className="text-gray-700 text-sm font-medium">
    Smart Banking
  </div>
</div>
          
          <h1 className="text-xl font-bold text-center text-gray-800 mb-1">Transaction Receipt</h1>
          <p className="text-xs text-center text-gray-500">
            Generated by Nattypay on {formattedDate}
          </p>
        </div>
        <div className="bg-white">
        {[
          { label: "Category",  value: selectedType === "bank" ? "Inter Bank Transfer" : "Intra Bank Transfer"  },
          { label: "Total Amount Paid", value: `₦ ${formatNumberWithCommas(transaction.transferDetails?.amount)}`  },
          { 
            label: "Sender Name", 
            value: formatSenderName(transaction.transferDetails?.senderName), 
            show: !!transaction.transferDetails?.senderBankName 
          },
          { label: "Beneficiary Name", value: transaction.transferDetails?.beneficiaryName },
          { label: "Beneficiary Bank Name", value: transaction.transferDetails?.beneficiaryBankName },
          { label: "Beneficiary Account Number", value: transaction.transferDetails?.beneficiaryAccountNumber },
          { label: "Session ID", value:  transaction.transferDetails?.sessionId  },
          { label: "Narration", value: transaction.description},
          { 
            label: "Date", 
            value: format(new Date(transaction.createdAt), "yyyy-MM-dd '|' h:mm a")
          },
          { label: "Status", value: transaction.status, isStatus: true },
        ]
          .filter(item => item.show !== false)
          .map((detail, index) => (
            <div
              key={index}
              className="border-b border-gray-100 px-4 py-2 w-full flex items-center justify-between"
            >
              <p className="text-amber-300 text-xs font-medium">{detail.label}</p>
              {detail.isStatus ? (
                <span
                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium ${
                    detail.value.toLowerCase() === "success"
                      ? "text-green-600"
                      : detail.value.toLowerCase() === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {detail.value}
                </span>
                 ) : (
                  <p className="text-gray-800 text-xs font-medium text-right">{detail.value}</p>
                )}
              </div>
            ))}
        </div>
  
        <div className="bg-white p-3 text-center border-t border-gray-100 rounded-b-2xl">
          <p className="text-xs text-gray-500 mb-1">
            If You Have Questions Or You Would Like To Know More Informations About NattyPay, Please Call Our 24/7 Contact Centre On <span className="text-amber-500">+2348134146906</span> Or Send Us Mail To <a href="mailto:support@nattypay.com" className="text-amber-500">support@nattypay.com</a>
          </p>
          <p className="text-xs text-gray-500">
            Thanks For Choosing Nattypay
          </p>
        </div>
      </div>
    );
  };

  const handleDownload = async (transaction: TransactionResponse) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);
  
    const root = createRoot(tempDiv);
    root.render(<ReceiptTemplate transaction={transaction} />);
  
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
  
      const link = document.createElement("a");
      link.download = `nattypay-transfer-${transaction.transactionRef || Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    } finally {
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };


  // Add the handleShare function
const handleShare = async (transaction: TransactionResponse) => {
  const tempDiv = document.createElement("div");
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);
  root.render(<ReceiptTemplate transaction={transaction} />);

  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png", 1.0);
    });

    // Check if Web Share API is available
    if (navigator.share) {
      const file = new File([blob], `nattypay-transfer-${transaction.transactionRef}.png`, {
        type: "image/png",
      });
      await navigator.share({
        files: [file],
        title: "Transaction Receipt",
      });
    } else {
      // Fallback to download if sharing is not supported
      const link = document.createElement("a");
      link.download = `nattypay-transfer-${transaction.transactionRef}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  } catch (error) {
    console.error("Error sharing/generating PNG:", error);
  } finally {
    root.unmount();
    document.body.removeChild(tempDiv);
  }
};

// Update the buttons section in screen 3
  const {
    mutate: initiateTransfer,
    isPending: transferPending,
    isError: transferError,

  } = useInitiateTransfer(onError, onSuccess);

  const transferLoading = transferPending && !transferError;

  const handleFingerprintClick = async () => {
    if (!fingerprintPaymentEnabled || !isFingerprintAvailable) {
      ErrorToast({
        title: "Fingerprint Payment Not Enabled",
        descriptions: ["Please enable fingerprint payment in settings first"],
      });
      return;
    }

    if (!bankData) {
      ErrorToast({
        title: "Error",
        descriptions: ["Please complete account verification first"],
      });
      return;
    }

    setIsVerifyingBiometric(true);
    try {
      // Verify PIN using biometric
      const result = await verifyPinWithBiometric();
      
      goTo(4); // Navigate to loading screen
      // Use biometric verification result as PIN
      // Backend should accept "BIOMETRIC_VERIFIED" as equivalent to PIN
      initiateTransfer({
        accountName: bankData?.accountName,
        accountNumber: watchedAccountNumber,
        amount: watchedAmount,
        description: watchedDescription,
        walletPin: result, // This will be "BIOMETRIC_VERIFIED" or actual PIN if backend supports it
        sessionId: watchedSessionId,
        bankCode: watchedBankCode,
        currency: "NGN",
        addBeneficiary: isBeneficiaryChecked,
      });
    } catch (error: any) {
      setIsVerifyingBiometric(false);
      ErrorToast({
        title: "Biometric Authentication Failed",
        descriptions: [error.message || "Please try again or use PIN"],
      });
    }
  };

  const handleTransfer = () => {
    if (pin && pin.length === 4 && bankData) {
      goTo(4); // Navigate to loading screen
      initiateTransfer({
        accountName: bankData?.accountName,
        accountNumber: watchedAccountNumber,
        amount: watchedAmount,
        description: watchedDescription,
        walletPin: pin,
        sessionId: watchedSessionId,
        bankCode: watchedBankCode,
        currency: "NGN",
        addBeneficiary: isBeneficiaryChecked,
      });
    } else {
      ErrorToast({
        title: "Invalid PIN Entered",
        descriptions: ["Please enter a valid PIN"],
      });
    }
  };

  const onSubmit = async () => {
    goTo(1);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const bankSelectRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(dropdownRef, () => {
    setBankState(false);
  });

  // Calculate dropdown position when it opens and update on scroll/resize
  useEffect(() => {
    const updatePosition = () => {
      if (bankState && bankSelectRef.current) {
        const rect = bankSelectRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      } else {
        setDropdownPosition(null);
      }
    };

    if (bankState) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [bankState]);

  const handleBeneficiarySelect = (beneficiary: BeneficiaryProps) => {
    console.log(beneficiary);
    setSelectedBeneficiary(beneficiary.id);

    const bank = banks?.find((bank) => bank.bankCode === beneficiary.bankCode);
    if (beneficiary?.accountNumber && bank) {
      setValue("accountNumber", beneficiary.accountNumber);
      setValue("bankCode", bank.bankCode);
      setSelectedBank(bank);
    }
  };

  const onBackPressClick = () => {
    setValue("accountNumber", "");
    setSelectedBeneficiary("");
  };

  const { beneficiaries } = useGetBeneficiaries({
    category: BENEFICIARY_TYPE.TRANSFER,
    transferType:
      selectedType === "nattypay" ? TRANSFER_TYPE.INTRA : TRANSFER_TYPE.INTER,
  });



  return (
    <div className="w-full flex max-xl:flex-col 2xs:px-2 xs:px-4 sm:px-6 md:px-8 py-4 2xs:py-6 sm:py-10 bg-transparent xs:bg-bg-600 dark:xs:bg-bg-1100 gap-6 xs:gap-10 lg:gap-12 2xl:gap-16 rounded-xl">
      {!compact && (
      <div className="w-full xl:w-[40%] flex flex-col gap-4 md:gap-6 lg:gap-8 2xl:gap-10">
        <h2 className="text-xl sm:text-2xl font-medium text-text-200 dark:text-text-400">
          Select Transfer Method
        </h2>
        <div className="flex flex-col gap-4">
          {transferMethods.map((method) => (
            <label
              key={method.id}
              className={`bg-bg-2000 dark:bg-bg-2500 relative flex items-center px-4 2xs:px-5 py-4 border rounded-lg sm:rounded-xl cursor-pointer hover:opacity-80 ${
                selectedType === method.value
                  ? " border-primary"
                  : "border-transparent"
              }`}
            >
              <input
                type="radio"
                className="hidden"
                checked={selectedType === method.value}
                onChange={() => {
                  setSelectedType(method.value);
                  setBankData(null);
                  setSelectedBank(undefined);
                  setScreen(0);
                  setPin("");
                  setIsBeneficiaryChecked(false);
                  setSelectedBeneficiary("");
                  reset();
                }}
              />
              <div className="flex-1 flex items-center gap-2.5">
                <div
                  className={`flex items-center justify-center w-10 2xl:w-12 h-10 2xl:h-12 rounded-full ${
                    selectedType === method.value ? "bg-primary" : "bg-bg-200 "
                  }`}
                >
                  <method.icon className="text-2xl text-text-1200" />
                </div>
                <h3 className="text-lg 2xl:text-xl font-medium text-text-200 dark:text-text-1300">
                  {method.label}
                </h3>
              </div>
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 border-2 ${
                  selectedType === method.value
                    ? "border-primary"
                    : "border-border-600 dark:border-border-100"
                } rounded-full flex items-center justify-center`}
              >
                <div
                  className={`w-3 h-3 bg-primary rounded-full ${
                    selectedType === method.value ? "block" : "hidden"
                  }`}
                />
              </div>
            </label>
          ))}
        </div>
      </div>
      )}
      <div className={`w-full ${compact ? "xl:w-full" : "xl:w-[60%]"} flex`}>
        {screen === 0 && (
          <div className={`w-full px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-6 items-center ${compact ? "bg-transparent" : "bg-bg-400 max-xs:bg-bg-600 dark:bg-black dark:max-xs:bg-bg-1100 rounded-xl"}`}>
            <h2 className="text-lg 2xs:text-xl sm:text-2xl font-medium text-text-200 dark:text-text-400 text-center">
              Enter {selectedType === "nattypay" ? "NattyPay" : "Bank"} Account
              Details{" "}
            </h2>

            <motion.form
              whileInView={{ opacity: [0, 1] }}
              transition={{ duration: 0.5, type: "tween" }}
              className="flex flex-col justify-start items-start w-full gap-6"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm sm:text-base text-text-200 dark:text-text-800 mb-1 flex items-start "
                  htmlFor={"accountNumber"}
                >
                  Account Number
                </label>
                <div className={`w-full flex gap-2 justify-center items-center ${compact ? "bg-[#1A2233] border-[#2C3947]" : "bg-bg-2400 dark:bg-bg-2100 border-border-600"} border rounded-lg py-4 px-3`}>
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder={selectedType === "nattypay" ? "Enter Account Number" : "Enter Bank Account Number"}
                    required={true}
                    type="number"
                    {...register("accountNumber")}
                    onKeyDown={handleNumericKeyDown}
                    onPaste={handleNumericPaste}
                  />

                  {watchedAccountNumber && (
                    <Image
                      onClick={onBackPressClick}
                      src={images.airtime.backPress}
                      alt="backPress"
                      className="cursor-pointer"
                    />
                  )}
                </div>

                {errors?.accountNumber?.message ? (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">
                    {errors?.accountNumber?.message}
                  </p>
                ) : null}
              </div>

              {selectedType === "nattypay" && bankData ? (
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full flex flex-col gap-2 rounded-xl px-4 py-3 bg-emerald-700/20 border border-emerald-700/40">
                    <p className="text-sm text-white/90 font-medium">{bankData?.accountName}</p>
                  </div>
                </div>
              ) : null}

              {selectedType === "bank" &&
                watchedAccountNumber.length === 10 && (
                  <div
                    ref={bankSelectRef}
                    className="relative w-full flex flex-col gap-1"
                  >
                    <div
                      onClick={() => {
                        setBankState(!bankState);
                      }}
                      className="w-full flex gap-2 justify-center items-center bg-bg-2000 border border-border-600 rounded-lg py-4 px-3"
                    >
                      <div className="w-full flex items-center justify-between text-text-700 dark:text-text-1000">
                        {!watchedBankCode || !selectedBank ? (
                          <p className=" text-sm 2xs:text-base">
                            Select Recipient Bank{" "}
                          </p>
                        ) : (
                          <p className="2xs:text-base text-sm font-medium">
                            {selectedBank?.name}
                          </p>
                        )}

                        <motion.svg
                          animate={{
                            rotate: bankState ? 180 : 0,
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
                    {errors.bankCode?.message && (
                      <p className="text-text-2700 text-sm">
                        {errors.bankCode.message}
                      </p>
                    )}
                    {bankState && dropdownPosition && typeof window !== 'undefined' && createPortal(
                      <div
                        ref={dropdownRef}
                        className="fixed px-1 py-2 overflow-y-auto h-fit max-h-60 bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-[1000000] no-scrollbar"
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`,
                        }}
                      >
                        <SearchableDropdown
                          items={banks}
                          searchKey="name"
                          displayFormat={(bank) => (
                            <div className="flex flex-col text-text-700 dark:text-text-1000">
                              <p className="text-sm 2xs:text-base font-medium">
                                {bank.name}
                              </p>
                            </div>
                          )}
                          onSelect={(bank: BankProps) => {
                            setValue("bankCode", String(bank.bankCode));
                            clearErrors("bankCode");
                            setBankName(bank.name);
                            setBankState(false);
                            setSelectedBank(bank);
                            setIsBankAutoDetected(false);
                          }}
                          placeholder="Search bank..."
                          isOpen={bankState}
                          onClose={() => setBankState(false)}
                        />
                      </div>,
                      document.body
                    )}
                    {/* Verified name below bank dropdown for Other Banks */}
                    {selectedType === "bank" && bankData ? (
                      <div className="w-full mt-3 flex flex-col gap-2">
                        <div className="w-full flex flex-col gap-2 rounded-xl px-4 py-3 bg-emerald-700/20 border border-emerald-700/40">
                          <p className="text-sm text-white/90 font-medium">{bankData?.accountName}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

              {watchedAccountNumber && (
                <>
                  {" "}
                  {verifyLoading ? (
                    <div className="w-full flex justify-center items-center py-8">
                      <SpinnerLoader width={50} height={50} color="#D4B139" />
                    </div>
                  ) : (
                    <>
                      {bankData ? (
                        <div className="w-full flex flex-col gap-6">
                          <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            <CustomButton type="button" className="w-full bg-transparent border border-[#F2C94C] text-white py-3.5 rounded-xl" onClick={() => onBackFirstStep && onBackFirstStep()}>
                              Back
                            </CustomButton>
                            <CustomButton
                              type="button"
                              disabled={!bankData || (selectedType === "bank" && !watchedBankCode)}
                              onClick={() => goTo(1)}
                              className="w-full border-2 border-primary text-white text-base 2xs:text-lg max-2xs:px-6 py-3.5"
                            >
                              Next
                            </CustomButton>
                          </div>
                        </div>
                      ) : (
                        <>
                          {" "}
                          {selectedType === "bank" && watchedBankCode && (
                            <div className="w-full flex flex-col justify-center items-center gap-2 rounded-xl px-6 py-8 bg-bg-600 dark:bg-black dark:xs:bg-bg-1100">
                              <p className="text-sm text-text-200 dark:text-text-400 font-semibold">
                                Bank Account Not Found
                              </p>
                            </div>
                          )}
                          {selectedType === "nattypay" && (
                            <div className="w-full flex flex-col justify-center items-center gap-2 rounded-xl px-6 py-8 bg-bg-600 dark:bg-black dark:xs:bg-bg-1100">
                              <p className="text-sm text-text-200 dark:text-text-400 font-semibold">
                                Nattypay Account Number Not Found
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </motion.form>

            {compact && beneficiaries && beneficiaries.length > 0 && (
              <div className="w-full mt-2 flex flex-col gap-3">
                <div className="w-full flex items-center justify-start gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('recent')}
                    className={`text-sm font-medium pb-1 border-b-2 ${activeTab==='recent' ? 'text-[#F2C94C] border-[#F2C94C]' : 'text-white/70 border-transparent'}`}
                  >
                    Recent Transactions
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('saved')}
                    className={`text-sm font-medium pb-1 border-b-2 ${activeTab==='saved' ? 'text-[#F2C94C] border-[#F2C94C]' : 'text-white/70 border-transparent'}`}
                  >
                    Saved Beneficiary
                  </button>
                </div>
                <div className="w-full flex flex-col divide-y divide-white/5 rounded-lg overflow-hidden">
                  {(activeTab === 'saved' ? beneficiaries : beneficiaries).slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBeneficiarySelect(b)}
                      className={`w-full flex items-center justify-between gap-3 px-2 py-3 hover:bg-white/5 transition-colors ${
                        selectedBeneficiary === b.id ? "bg-white/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500/20 grid place-items-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div className="flex flex-col text-left">
                          <p className="text-white text-sm font-medium leading-tight">{b.accountName}</p>
                          <p className="text-white/70 text-xs leading-tight">{b.accountNumber}</p>
                        </div>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/60"><path fill="currentColor" d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.41l4.59-4.58a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01Z"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {screen === 1 && (
          <div className={`w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-8 items-center ${compact ? "bg-transparent" : "bg-bg-400 dark:bg-black dark:max-xs:bg-bg-1100 rounded-xl"}`}>
            <h2 className="text-xl sm:text-2xl font-medium text-text-200 dark:text-text-400 text-center">
              Enter Amount
            </h2>

            <div className="w-full flex flex-col gap-4 items-start justify-start">
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label className="w-full text-sm sm:text-base text-text-200 dark:text-text-800 mb-1 flex items-start " htmlFor={"amount"}>
                  Amount
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Enter Amount"
                    required={true}
                    type="text"
                    {...register("amount", {
                      onChange: (e) => {
                        const value = e.target.value.replace(/,/g, '');
                        if (/^\d*\.?\d*$/.test(value)) {
                          e.target.value = formatNumberWithCommas(value);
                        }
                      }
                    })}
                  />
                </div>
                {/* Available Balance hint */}
                <div className="w-full mt-1">
                  <p className="text-xs text-[#7FB3FF]">Available Balance (₦{formatNumberWithCommas(String(availableBalance))})</p>
                </div>
                {errors?.amount?.message ? (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.amount?.message}</p>
                ) : null}
              </div>

              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label className="w-full text-sm sm:text-base text-text-200 dark:text-text-800 mb-1 flex items-start " htmlFor={"description"}>
                  Narration (Optional)
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Reason (optional)"
                    type="text"
                    {...register("description")}
                  />
                </div>
                {errors?.description?.message ? (
                  <p className="flex self-start text-red-500 font-semibold mt-0.5 text-sm">{errors?.description?.message}</p>
                ) : null}
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="w-full grid grid-cols-3 xs:grid-cols-5 gap-2">
              {[1000,5000,10000,20000,25000].map((amt)=> (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    const v = String(amt);
                    setValue('amount', v as any, { shouldValidate: true, shouldDirty: true });
                  }}
                  className="px-3 py-2 rounded-md bg-[#1F2937] text-white/80 text-xs hover:bg-white/10 border border-white/10"
                >
                  ₦{formatNumberWithCommas(String(amt))}
                </button>
              ))}
            </div>

            <div className="w-full flex gap-4 mt-4">
              <CustomButton type="button" className="w-full bg-transparent border border-[#F2C94C] text-white py-3.5 rounded-xl" onClick={() => goTo(0)}>
                Back
              </CustomButton>
              <CustomButton type="button" disabled={!isValid} className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={() => goTo(2)}>
                Next
              </CustomButton>
            </div>
          </div>
        )}

        {screen === 2 && (
          <div className={`w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-6 items-center ${compact ? "bg-transparent" : "bg-bg-400 dark:bg-black dark:max-xs:bg-bg-1100 rounded-xl"}`}>
            <h2 className="text-2xl sm:text-3xl font-medium text-text-200 dark:text-text-400 text-center">
              ₦ {formatNumberWithCommas(watchedAmount)}
            </h2>

            <div className={`w-full flex flex-col gap-2 text-sm sm:text-base ${compact ? "rounded-xl border border-white/10 bg-white/5 p-4" : ""}`}>
              {selectedType === "bank" && bankName ? (
                <div className="w-full flex justify-between gap-2 ">
                  <p className="text-sm text-text-200 dark:text-text-400">
                    Bank Name{" "}
                  </p>
                  <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                    {bankName}
                  </p>
                </div>
              ) : null}

              <div className="w-full flex justify-between gap-2 ">
                <p className="text-sm text-text-200 dark:text-text-400">
                  Account number
                </p>
                <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                  {bankData?.accountNumber}
                </p>
              </div>

              <div className="w-full flex justify-between gap-2 ">
                <p className="text-sm text-text-200 dark:text-text-400">
                  Account name
                </p>
                <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                  {bankData?.accountName}
                </p>
              </div>

              <div className="w-full flex justify-between gap-2 ">
                <p className="text-sm text-text-200 dark:text-text-400">
                  Amount
                </p>
                <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                  ₦ {formatNumberWithCommas(watchedAmount)}
                </p>
              </div>

              {selectedType === "bank" ? (
                <div className="w-full flex justify-between gap-2 ">
                  <p className="text-sm text-text-200 dark:text-text-400">
                    Transfer fees{" "}
                  </p>
                  <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                    ₦ {fee?.toLocaleString()}
                  </p>
                </div>
              ) : null}

              {watchedDescription ? (
                <div className="w-full flex justify-between gap-2 ">
                  <p className="text-sm text-text-200 dark:text-text-400">
                    Narration
                  </p>
                  <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                    {watchedDescription}
                  </p>
                </div>
              ) : null}

              <div className="w-full flex justify-between gap-2">
                <p className="text-sm text-text-200 dark:text-text-400">
                  Debit from
                </p>
                <p className="text-text-200 dark:text-text-400 font-semibold text-right">
                  NGN Account{" "}
                </p>
              </div>
            </div>

            {/* In compact modal, show PIN input and actions here (combined confirm + pin screen) */}
            {compact ? (
              <div className="w-full flex flex-col gap-4">
                <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                  <label
                    className="w-full text-sm sm:text-base text-text-200 dark:text-text-800 mb-1 flex items-start "
                    htmlFor={"pin"}
                  >
                    Enter Transaction PIN
                  </label>
                  <div className="w-full flex gap-2 items-center">
                    <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
                      <input
                        className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                        placeholder="Enter PIN"
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        disabled={isVerifyingBiometric}
                      />
                    </div>
                    {fingerprintPaymentEnabled && isFingerprintAvailable && (
                      <button
                        type="button"
                        onClick={handleFingerprintClick}
                        disabled={isVerifyingBiometric || transferLoading}
                        className={`shrink-0 w-10 h-10 grid place-items-center rounded-md transition-colors ${
                          isVerifyingBiometric
                            ? "bg-white/20 text-white/50 cursor-not-allowed"
                            : "bg-white/10 border border-white/10 hover:bg-[#D4B139] hover:border-[#D4B139] text-white/80 hover:text-black"
                        }`}
                        title="Use Fingerprint/Face ID"
                      >
                        <RiFingerprintLine className="text-lg" />
                      </button>
                    )}
                  </div>
                  {isVerifyingBiometric && (
                    <p className="text-xs text-white/60 mt-1">Verifying with biometric...</p>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-2">
                  <CustomButton type="button" className="w-full bg-transparent border border-[#F2C94C] text-white py-3.5 rounded-xl" onClick={() => goTo(1)}>
                    Back
                  </CustomButton>
                  <CustomButton
                    type="button"
                    disabled={!pin || transferLoading}
                    onClick={() => handleTransfer()}
                    className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl"
                  >
                    {transferLoading ? <SpinnerLoader width={25} height={25} color="#000" /> : 'Pay'}
                  </CustomButton>
                </div>
              </div>
            ) : (
              <CustomButton
                type="button"
                className="w-full border-2 border-primary text-white text-base 2xs:text-lg max-2xs:px-6 py-3.5"
                onClick={() => goTo(3)}
              >
                Confirm{" "}
              </CustomButton>
            )}
          </div>
        )}

        {screen === 3 && (
          <div className="w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-8 items-center bg-bg-400 dark:bg-black dark:max-xs:bg-bg-1100 rounded-xl ">
            <h2 className="text-xl sm:text-2xl font-medium text-text-200 dark:text-text-400 text-center">
              Enter Transaction PIN{" "}
            </h2>

            <div className="w-full flex flex-col gap-2 text-sm sm:text-base">
              <div className="flex flex-col justify-center items-center gap-1 w-full text-black dark:text-white">
                <label
                  className="w-full text-sm sm:text-base text-text-200 dark:text-text-800 mb-1 flex items-start "
                  htmlFor={"amount"}
                >
                  Enter transaction PIN{" "}
                </label>
                <div className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-4 px-3">
                  <input
                    className="w-full bg-transparent p-0 border-none outline-none text-base text-text-200 dark:text-white placeholder:text-text-200 dark:placeholder:text-text-1000 placeholder:text-sm"
                    placeholder="Transaction PIN"
                    required={true}
                    type="password"
                    value={pin}
                    maxLength={4}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    disabled={isVerifyingBiometric}
                  />
                  {fingerprintPaymentEnabled && isFingerprintAvailable && (
                    <button
                      type="button"
                      onClick={handleFingerprintClick}
                      disabled={isVerifyingBiometric || transferLoading}
                      className={`shrink-0 w-10 h-10 grid place-items-center rounded-md transition-colors ${
                        isVerifyingBiometric
                          ? "bg-white/20 text-white/50 cursor-not-allowed"
                          : "bg-white/10 border border-white/10 hover:bg-[#D4B139] hover:border-[#D4B139] text-white/80 hover:text-black"
                      }`}
                      title="Use Fingerprint/Face ID"
                    >
                      <RiFingerprintLine className="text-lg" />
                    </button>
                  )}
                </div>
                {isVerifyingBiometric && (
                  <p className="text-xs text-white/60 mt-1 text-center">Verifying with biometric...</p>
                )}
              </div>
              <p className="flex self-center text-center text-text-200 dark:text-text-400 text-sm sm:text-base mt-2.5">
                Transaction PIN secured by Nattypay
              </p>
            </div>

            <CustomButton
              type="button"
              disabled={(!pin || pin.length !== 4) && !isVerifyingBiometric || transferLoading}
              isLoading={isVerifyingBiometric || transferLoading}
              className="w-full border-2 border-primary text-white text-base 2xs:text-lg max-2xs:px-6 py-3.5"
              onClick={() => {
                if (pin && pin.length === 4 && bankData) {
                  handleTransfer();
                } else {
                  ErrorToast({
                    title: "Invalid PIN Entered",
                    descriptions: ["Please enter a valid PIN"],
                  });
                }
              }}
            >
              {transferLoading ? (
                <SpinnerLoader width={25} height={25} color="#000" />
              ) : (
                "Pay"
              )}
            </CustomButton>
          </div>
        )}

        {screen === 4 && transferLoading && (
          <div className="w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-12 flex flex-col gap-6 items-center justify-center bg-bg-400 dark:bg-black dark:max-xs:bg-bg-1100 rounded-2xl min-h-[300px]">
            <SpinnerLoader width={60} height={60} color="#D4B139" />
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-xl font-semibold text-text-200 dark:text-text-400">Processing Payment</h3>
              <p className="text-sm text-text-800/80 text-center">Please wait while we process your transaction...</p>
            </div>
          </div>
        )}

        {screen === 4 && !transferLoading && paymentSuccess === false && (
          <div className="w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-6 bg-transparent rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500/20">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-red-400 mb-1">Payment Failed</h3>
                <p className="text-white/70 text-sm mb-4">₦ {formatNumberWithCommas(String(watchedAmount))}</p>
                {paymentError && (
                  <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 max-w-md">
                    <p className="text-red-400 text-sm">{paymentError}</p>
                  </div>
                )}
              </div>
              <div className="w-full grid grid-cols-2 gap-4 mt-4">
                <CustomButton
                  type="button"
                  onClick={() => {
                    setPaymentSuccess(null);
                    setPaymentError(null);
                    goTo(2);
                  }}
                  className="w-full bg-transparent border border-[#F2C94C] text-white py-3.5 rounded-xl"
                >
                  Try Again
                </CustomButton>
                <CustomButton
                  type="button"
                  onClick={() => {
                    setBankData(null);
                    setPaymentSuccess(null);
                    setPaymentError(null);
                    goTo(0);
                    reset();
                  }}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl"
                >
                  Close
                </CustomButton>
              </div>
            </div>
          </div>
        )}

        {screen === 4 && !transferLoading && paymentSuccess === true && (
          <div className="w-full dark:max-xs:px-4 xs:px-6 md:px-8 lg:px-10 2xl:px-12 py-8 flex flex-col gap-6 bg-transparent rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-text-200 dark:text-text-400">Transaction History</h3>
                <p className="text-xs text-text-800/80">View complete information about this transaction</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBankData(null);
                  setPaymentSuccess(null);
                  setPaymentError(null);
                  goTo(0);
                  reset();
                }}
                className="w-8 h-8 grid place-items-center rounded-md bg-white/10 border border-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70"><path fill="currentColor" d="m12 13.4l4.6 4.6q.275.275.688.275t.712-.3q.275-.275.275-.687t-.3-.713L13.4 12l4.6-4.6q.275-.275.275-.688t-.3-.712q-.275-.275-.687-.275t-.713.3L12 10.6L7.4 6q-.275-.275-.688-.275t-.712.3q-.275.275-.275.687t.3.713L10.6 12l-4.6 4.6q-.275.275-.275.688t.3.712q.275.275.687.275t.713-.3z"/></svg>
              </button>
            </div>

            <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="w-full flex items-center justify-between rounded-lg bg-[#0E2D1C] px-4 py-3 mb-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="m10.6 15.6l6.025-6.025q.275-.275.675-.262t.7.287t.287.7t-.262.675l-6.75 6.75q-.3.3-.7.3t-.7-.3L6.95 13.25q-.275-.275-.275-.675t.3-.7t.7-.288t.675.263z"/></svg>
                  <span>Successful</span>
                </div>
                <div className="text-white font-semibold">₦ {formatNumberWithCommas(String(transaction?.transferDetails?.amount || watchedAmount))}</div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-800">Transaction ID</span>
                  <span className="text-white flex items-center gap-2">
                    {transaction?.transactionRef || transaction?.id}
                    <button
                      type="button"
                      onClick={() => transaction?.transactionRef && navigator.clipboard.writeText(transaction.transactionRef)}
                      className="p-1 rounded hover:bg-white/10"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V7q0-.825.588-1.412T7 5h8q.825 0 1.413.588T17 7v12q0 .825-.587 1.413T15 21zm0-2h8V7H7zm10-2V5H9V3h8q.825 0 1.413.588T19 5v12z"/></svg>
                    </button>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-800">Date & Time</span>
                  <span className="text-white">{transaction ? format(new Date(transaction.createdAt), "MMM d, yyyy h:mm a") : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-800">Payment Method</span>
                  <span className="text-white">Available Balance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-800">Transaction Type</span>
                  <span className="text-white">{selectedType === 'bank' ? 'Inter-bank Transfer' : 'Intra-bank Transfer'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-800">To</span>
                  <span className="text-white">{transaction?.transferDetails?.beneficiaryName || bankData?.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-800">Recipient Account</span>
                  <span className="text-white">{transaction?.transferDetails?.beneficiaryAccountNumber || bankData?.accountNumber}</span>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-2">
              <button type="button" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 bg-transparent text-white hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M12 13q-1.25 0-2.125-.875T9 10q0-1.25.875-2.125T12 7q1.25 0 2.125.875T15 10q0 1.25-.875 2.125T12 13m0 8q-2.5-2.1-4-3.6T5.5 15.875T4 12q0-3.35 2.325-5.675T12 4t5.675 2.325T20 12q0 2.2-1.5 4.125T16 17.4z"/></svg>
                Contact Support
              </button>
              <button type="button" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F2C94C] text-black hover:bg-[#e6be46]" onClick={() => transaction && handleDownload(transaction)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M12 16q-.2 0-.375-.063T11.3 15.8l-3.9-3.9q-.275-.275-.275-.688T7.7 10.5t.713-.3t.687.275l2.1 2.1V5q0-.425.288-.712T12 4q.425 0 .713.288T13 5v7.575l2.1-2.1q.275-.275.688-.275t.712.3q.275.275.275.688t-.275.712l-3.9 3.9q-.125.125-.3.188T12 16M5 20q-.825 0-1.412-.587T3 18v-1q0-.425.288-.712T4 16t.713.288T5 17v1h14v-1q0-.425.288-.712T20 16t.713.288T21 17v1q0 .825-.587 1.413T19 20z"/></svg>
                Download Receipt
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => {
          setShowInsufficientBalanceModal(false);
          // Go back to the previous screen (amount screen)
          goTo(1);
        }}
        requiredAmount={balanceInfo.requiredAmount}
        currentBalance={balanceInfo.currentBalance}
      />
    </div>
  );
};


// const ReceiptTemplate = ({ transaction, bankData, selectedType, bankName, fee, watchedAmount }) => {
//   const formattedDate = format(new Date(), "EEEE, MMMM d, yyyy h:mm a");

//   return (
//     <div id="receipt-container" className="flex flex-col max-w-md mx-auto overflow-hidden rounded-2xl shadow-lg">
//       {/* Header with logo and title */}
//       <div className="bg-amber-100 p-4 rounded-b-2xl relative">
//         {/* Curved edges */}
//         <div className="absolute -left-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
//         <div className="absolute -right-3 -top-1 w-6 h-6 bg-white rounded-full"></div>
        
//         <div className="flex items-center justify-between mb-3">
//           <div className="flex items-center">
//             <Image src={images.logo} alt="logo" className="h-8 w-auto" />
//           </div>
//           <div className="text-gray-700 text-sm font-medium">
//             Smart Banking
//           </div>
//         </div>
        
//         <h1 className="text-xl font-bold text-center text-gray-800 mb-1">Transaction Receipt</h1>
//         <p className="text-xs text-center text-gray-500">
//           Generated by Nattypay on {formattedDate}
//         </p>
//       </div>

//       {/* Transaction details */}
//       <div className="bg-white">
//         {[
//           { label: "Transaction Type", value: selectedType === "bank" ? "Bank Transfer" : "Wallet Transfer" },
//           { label: "Bank Name", value: bankName, show: selectedType === "bank" },
//           { label: "Account Number", value: bankData?.accountNumber },
//           { label: "Account Name", value: bankData?.accountName },
//           { label: "Amount", value: `₦ ${formatNumberWithCommas(watchedAmount)}` },
//           { label: "Transfer Fee", value: `₦ ${formatNumberWithCommas(fee)}`, show: selectedType === "bank" },
//           { label: "Status", value: "Success", isStatus: true },
//         ]
//           .filter(item => item.show !== false)
//           .map((detail, index) => (
//             <div
//               key={index}
//               className="border-b border-gray-100 px-4 py-2 w-full flex items-center justify-between"
//             >
//               <p className="text-amber-300 text-xs font-medium">{detail.label}</p>
//               {detail.isStatus ? (
//                 <span
//                   className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium text-green-600`}
//                 >
//                   {detail.value}
//                 </span>
//               ) : (
//                 <p className="text-gray-800 text-xs font-medium text-right">{detail.value}</p>
//               )}
//             </div>
//           ))}
//       </div>

//       {/* Footer with contact info */}
//       <div className="bg-white p-3 text-center border-t border-gray-100 rounded-b-2xl">
//         <p className="text-xs text-gray-500 mb-1">
//           If You Have Questions Or You Would Like To Know More Informations About NattyPay, Please Call Our 24/7 Contact Centre On <span className="text-amber-500">+2348134146906</span> Or Send Us Mail To <a href="mailto:support@nattypay.com" className="text-amber-500">support@nattypay.com</a>
//         </p>
//         <p className="text-xs text-gray-500">
//           Thanks For Choosing Nattypay
//         </p>
//       </div>
//     </div>
//   );
// };

// Add this to your imports

export default TransferProcess;


