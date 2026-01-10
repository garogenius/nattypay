"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useVerifyAccount, useInitiateTransfer, useGetAllBanks } from "@/api/wallet/wallet.queries";
import { useGetBanksByCurrency, useGetCurrencyAccountByCurrency } from "@/api/currency/currency.queries";
import { useQueryClient } from "@tanstack/react-query";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { FiCheckCircle } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import { formatNumberWithCommas } from "@/utils/utilityFunctions";
import useUserStore from "@/store/user.store";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import { useGetTransactions } from "@/api/wallet/wallet.queries";
import images from "../../../../public/images";
import Image from "next/image";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import PaymentConfirmModal from "@/components/modals/PaymentConfirmModal";
import PaymentResultModal from "@/components/modals/PaymentResultModal";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { verifyAccountRequest } from "@/api/wallet/wallet.apis";

interface PaymentTransferFormProps {
  type: "nattypay" | "bank";
  accountNumber?: string;
  setAccountNumber?: (v: string)=> void;
  accountName?: string;
  setAccountName?: (v: string)=> void;
  sessionId?: string;
  setSessionId?: (v: string)=> void;
  amount?: string;
  setAmount?: (v: string)=> void;
}

const PaymentTransferForm: React.FC<PaymentTransferFormProps> = ({ type, accountNumber: acctProp, setAccountNumber: setAcctProp, accountName: nameProp, setAccountName: setNameProp, sessionId: sessProp, setSessionId: setSessProp, amount: amtProp, setAmount: setAmtProp }) => {
  const { user } = useUserStore();
  const { selectedCurrency } = usePaymentSettingsStore();
  const queryClient = useQueryClient();
  const primaryWallet = user?.wallet?.[0];
  const { transactionsData } = useGetTransactions({ page: 1, limit: 8 });
  
  // Get currency account for selected currency
  const { account: currencyAccount, isPending: accountLoading } = useGetCurrencyAccountByCurrency(
    selectedCurrency !== "NGN" ? selectedCurrency : ""
  );
  
  // Get banks: For NGN use wallet API, for other currencies use currency API
  const { banks: ngnBanks, isPending: ngnBanksLoading } = useGetAllBanks();
  const { banks: currencyBanks, isPending: currencyBanksLoading } = useGetBanksByCurrency(
    selectedCurrency !== "NGN" ? selectedCurrency : ""
  );
  
  // Determine which banks to use based on selected currency
  const banks = selectedCurrency === "NGN" ? (ngnBanks || []) : (currencyBanks || []);
  const banksLoading = selectedCurrency === "NGN" ? ngnBanksLoading : currencyBanksLoading;
  
  const [accountNumberState, setAccountNumberState] = useState("");
  const [accountNameState, setAccountNameState] = useState("");
  const [sessionIdState, setSessionIdState] = useState("");
  const [amountState, setAmountState] = useState("");
  const accountNumber = acctProp ?? accountNumberState;
  const setAccountNumber = setAcctProp ?? setAccountNumberState;
  const accountName = nameProp ?? accountNameState;
  const setAccountName = setNameProp ?? setAccountNameState;
  const sessionId = sessProp ?? sessionIdState;
  const setSessionId = setSessProp ?? setSessionIdState;
  const amount = amtProp ?? amountState;
  const setAmount = setAmtProp ?? setAmountState;
  const [narration, setNarration] = useState("");
  const [bankCode, setBankCode] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [isBankAutoDetected, setIsBankAutoDetected] = useState(false);
  const [isDetectingBank, setIsDetectingBank] = useState(false);
  const detectReqIdRef = useRef(0);
  const [openBanks, setOpenBanks] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(bankDropdownRef, () => setOpenBanks(false));
  
  // Get current account balance based on selected currency
  const currentBalance = useMemo(() => {
    if (selectedCurrency === "NGN") {
      return primaryWallet?.balance || 0;
    }
    return currencyAccount?.balance || 0;
  }, [selectedCurrency, primaryWallet, currencyAccount]);
  
  // Format currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "₦";
    }
  };
  
  // Check if account exists for selected currency
  const accountExists = useMemo(() => {
    if (selectedCurrency === "NGN") {
      return !!primaryWallet;
    }
    return !!currencyAccount;
  }, [selectedCurrency, primaryWallet, currencyAccount]);
  
  // Reset form when currency changes
  useEffect(() => {
    setAccountNumber("");
    setAccountName("");
    setSessionId("");
    setAmount("");
    setBankCode("");
    setBankName("");
    setNarration("");
    setOpenBanks(false);
    // Invalidate banks query to refetch for new currency
    if (selectedCurrency !== "NGN") {
      queryClient.invalidateQueries({ queryKey: ["banks", selectedCurrency] });
    }
  }, [selectedCurrency, setAccountNumber, setAccountName, setSessionId, setAmount, queryClient]);
  
  // Debug: Log banks data when it changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentTransferForm - Banks data:', {
        selectedCurrency,
        banksCount: banks?.length || 0,
        banks: banks?.slice(0, 3).map((bank: any) => ({ code: bank?.code, name: bank?.name })),
        banksLoading,
        isNGN: selectedCurrency === "NGN",
      });
    }
  }, [selectedCurrency, banks, banksLoading]);

  const onVerifyAccountError = (error: any) => {
    // Extract error message from various possible response formats
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        error?.response?.data?.error ||
                        "An error occurred during account verification";
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    ErrorToast({ title: "Error during Account Verification", descriptions });
    setAccountName("");
    setSessionId("");
  };

  const onVerifyAccountSuccess = (data: any) => {
    // Handle different possible response structures
    const responseData = data?.data?.data || data?.data || data;
    const accountName = responseData?.accountName || responseData?.account_name || "";
    const sessionId = responseData?.sessionId || responseData?.session_id || "";
    
    setAccountName(accountName);
    setSessionId(sessionId);
    
    if (type === "nattypay" && (responseData?.bankCode || responseData?.bank_code)) {
      setBankCode(responseData?.bankCode || responseData?.bank_code);
    }
    
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentTransferForm - Account Verification Success:', {
        rawData: data,
        responseData,
        accountName,
        sessionId,
        bankCode: responseData?.bankCode || responseData?.bank_code,
      });
    }
  };

  const { mutate: verifyAccount, isPending: verifyLoading } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  const handleAccountChange = (val: string) => {
    const v = val.replace(/\D/g, "");
    setAccountNumber(v);
    // Clear previous verification when value changes
    setAccountName("");
    setSessionId("");
    if (type === "bank" && isBankAutoDetected) {
      setBankCode("");
      setBankName("");
    }
  };

  const tryAutoDetectBank = async (acctNumber: string) => {
    const reqId = ++detectReqIdRef.current;
    setIsDetectingBank(true);

    try {
      // Some APIs return banks as { code, name } and others as { bankCode, name }.
      const normalizedBanks = (banks || [])
        .map((b: any) => ({
          bankCode: String(b?.code ?? b?.bankCode ?? b?.bank_code ?? ""),
          bankName: String(b?.name ?? b?.bankName ?? b?.bank_name ?? ""),
        }))
        .filter((b: any) => !!b.bankCode);

      for (const b of normalizedBanks) {
        try {
          const res = await verifyAccountRequest({
            accountNumber: acctNumber,
            bankCode: b.bankCode,
          });

          // Ignore stale request results
          if (detectReqIdRef.current !== reqId) return;

          const responseData = res?.data?.data || res?.data || {};
          const detectedAccountName =
            responseData?.accountName || responseData?.account_name || "";
          const detectedSessionId =
            responseData?.sessionId || responseData?.session_id || "";

          // If we got a name back, we found the correct bank
          if (detectedAccountName) {
            const detectedBankCode =
              String(responseData?.bankCode || responseData?.bank_code || b.bankCode) || b.bankCode;
            const detectedBankName =
              String(responseData?.bankName || responseData?.bank_name || b.bankName) || b.bankName;

            setBankCode(detectedBankCode);
            setBankName(detectedBankName);
            setIsBankAutoDetected(true);
            setOpenBanks(false);
            setAccountName(detectedAccountName);
            setSessionId(detectedSessionId);
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
    if (accountNumber && accountNumber.length === 10) {
      if (type === "nattypay") {
        verifyAccount({ accountNumber });
      } else if (type === "bank") {
        // If user already selected / we already detected a bank, verify with that bank code.
        // Otherwise, attempt auto-detection by trying known bank codes until one verifies.
        if (bankCode) {
          // Avoid double-verification if we already have verified values.
          if (!accountName || !sessionId) verifyAccount({ accountNumber, bankCode });
        } else {
          // Debounce a bit to avoid firing while user is still typing/pasting
          const t = setTimeout(() => {
            tryAutoDetectBank(accountNumber);
          }, 350);
          return () => clearTimeout(t);
        }
      }
    } else {
      // Cancel any in-flight auto-detect attempt when account number becomes invalid
      detectReqIdRef.current += 1;
      setIsDetectingBank(false);
    }
  }, [accountNumber, bankCode, type, verifyAccount, accountName, sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const canProceed = useMemo(() => {
    // Parse amount, handling commas (formatNumberWithCommas adds commas)
    const cleanAmount = amount.replace(/,/g, "");
    const amt = Number(cleanAmount) || 0;
    const hasValidAccountNumber = accountNumber && accountNumber.length === 10;
    const hasVerifiedAccount = !!accountName && !!sessionId;
    // Amount must be > 0 and <= current balance
    const hasValidAmount = amt > 0 && amt <= currentBalance;
    const hasBankCodeForBankTransfer = type === "bank" ? !!bankCode : true;
    
    const canProceedResult = accountExists && hasValidAccountNumber && hasVerifiedAccount && hasValidAmount && hasBankCodeForBankTransfer;
    
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentTransferForm - canProceed check:', {
        accountExists,
        hasValidAccountNumber,
        accountNumber: accountNumber,
        accountNumberLength: accountNumber?.length || 0,
        hasVerifiedAccount,
        accountName: accountName || "NOT SET",
        sessionId: sessionId || "NOT SET",
        hasValidAmount,
        rawAmount: amount,
        parsedAmount: amt,
        currentBalance,
        hasBankCodeForBankTransfer,
        bankCode: type === "bank" ? (bankCode || "NOT SET") : "N/A",
        type,
        canProceed: canProceedResult,
        breakdown: {
          accountExists,
          hasValidAccountNumber,
          hasVerifiedAccount,
          hasValidAmount,
          hasBankCodeForBankTransfer,
        }
      });
    }
    
    return canProceedResult;
  }, [accountNumber, accountName, sessionId, amount, accountExists, currentBalance, type, bankCode]);

  const quickAmounts = useMemo(() => {
    // Adjust quick amounts based on currency
    if (selectedCurrency === "NGN") {
      return [1000, 5000, 10000, 20000];
    }
    // For foreign currencies, use smaller amounts
    return [10, 50, 100, 200];
  }, [selectedCurrency]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [resultPayload, setResultPayload] = useState<any>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "failed">("success");

  const onTransferError = (error: any) => {
    // Extract error message from various possible response formats
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        error?.response?.data?.error ||
                        "An error occurred during transfer";
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    ErrorToast({ title: "Error during transfer", descriptions });
    setResultStatus("failed");
    const now = new Date();
    setResultPayload({
      transaction: null,
      meta: {
        transactionId: error?.response?.data?.transactionRef || "",
        dateTime: now,
        errorMessage: errorMessage, // Store error message for display in modal
      },
    });
    setOpenResult(true);
  };

  const onTransferSuccess = ({ transaction }: any) => {
    SuccessToast({ title: "Transfer successful", description: "Your transfer was successful" });
    setResultStatus("success");
    setResultPayload({ transaction });
    // Invalidate currency-specific queries
    queryClient.invalidateQueries({ queryKey: ["currency-account-transactions", selectedCurrency] });
    queryClient.invalidateQueries({ queryKey: ["currency-account", selectedCurrency] });
    queryClient.invalidateQueries({ queryKey: ["currency-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    setOpenResult(true);
  };

  const { mutate: initiateTransfer, isPending: transferLoading } = useInitiateTransfer(onTransferError, onTransferSuccess);

  return (
    <div className="flex flex-col gap-5">
      {/* Left: Form */}
      <div className="rounded-2xl border border-border-800 dark:border-border-700 bg-bg-600 dark:bg-bg-1100 p-5 flex flex-col gap-4">
        {type === "nattypay" && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-white/80 text-sm">Account Number</label>
              <div className="relative w-full">
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 pr-10 text-white placeholder:text-white/40 outline-none"
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => handleAccountChange(e.target.value)}
                />
                {(verifyLoading || isDetectingBank) && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <SpinnerLoader width={18} height={18} color="#D4B139" />
                  </div>
                )}
              </div>
              {accountName && (
                <div className="w-full rounded-md bg-[#0E2C25] text-emerald-200 text-sm px-3 py-2 flex items-center gap-2 mt-2">
                  <FiCheckCircle className="text-emerald-400" />
                  <span className="truncate">{accountName}</span>
                </div>
              )}
            </div>

          </>
        )}

        {type === "bank" && (
          <>
            {/* Bank dropdown FIRST */}
            <div className="flex flex-col gap-1" ref={bankDropdownRef}>
              <label className="text-white/80 text-sm">Recipient Bank (auto-detect)</label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between bg-bg-2400 dark:bg-bg-2100 border border-border-600 py-3 px-3 text-white/80 focus:outline-none focus:ring-1 focus:ring-[#D4B139] rounded-lg ${openBanks ? "rounded-b-none border-b-0" : ""}`}
                  onClick={(e)=>{ e.preventDefault(); setOpenBanks((o)=>!o); }}
                >
                  <span className="truncate text-white/80">
                    {isDetectingBank ? "Detecting bank..." : bankName || "Auto-detect bank (or select)"}
                  </span>
                  <svg className={`w-4 h-4 text-white/70 transition-transform ${openBanks ? "rotate-180" : "rotate-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>

                <div className="absolute left-0 right-0 top-full z-20">
                  <div className={`overflow-y-auto max-h-60 bg-bg-600 dark:bg-bg-1100 border border-border-600 dark:border-border-600 shadow-md no-scrollbar ${openBanks ? "block" : "hidden"} rounded-b-lg ${openBanks ? "-mt-px" : ""}`}>
                    {banksLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <SpinnerLoader width={20} height={20} color="#D4B139" />
                      </div>
                    ) : banks && banks.length > 0 ? (
                      <SearchableDropdown
                        items={banks}
                        searchKey="name"
                        displayFormat={(bank:any) => (
                          <div className="flex flex-col text-text-700 dark:text-text-1000">
                            <p className="text-sm font-medium">{bank.name}</p>
                          </div>
                        )}
                        onSelect={(bank:any) => {
                          setBankCode(String(bank.code || bank.bankCode));
                          setBankName(bank.name);
                          setIsBankAutoDetected(false);
                        }}
                        placeholder="Search bank..."
                        isOpen={openBanks}
                        onClose={()=>{ setOpenBanks(false); }}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-4 text-white/60 text-sm">
                        No banks available for {selectedCurrency}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Number AFTER bank selection */}
            <div className="flex flex-col gap-1 mt-2">
              <label className="text-white/80 text-sm">Account Number</label>
              <div className="relative w-full">
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 pr-10 text-white placeholder:text-white/40 outline-none"
                  placeholder="Enter Account Number"
                  value={accountNumber}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => handleAccountChange(e.target.value)}
                />
                {verifyLoading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <SpinnerLoader width={18} height={18} color="#D4B139" />
                  </div>
                )}
              </div>
              {accountName && (
                <div className="w-full rounded-md bg-[#0E2C25] text-emerald-200 text-sm px-3 py-2 flex items-center gap-2 mt-2">
                  <FiCheckCircle className="text-emerald-400" />
                  <span className="truncate">{accountName}</span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-white/80 text-sm">Enter Amount</label>
          <input
            className={`w-full bg-bg-2400 dark:bg-bg-2100 border rounded-lg py-3 px-3 text-white placeholder:text-white/40 outline-none ${
              amount && Number(amount.replace(/,/g, "")) > currentBalance
                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-border-600"
            }`}
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/,/g, "");
              if (/^\d*\.?\d*$/.test(v)) setAmount(formatNumberWithCommas(v));
            }}
          />
          {!accountExists ? (
            <p className="text-red-400 text-xs mt-1">
              {selectedCurrency} account not found. Please create an account first.
            </p>
          ) : (
            <>
              <p className="text-[#D4B139] text-xs mt-1">
                Available Balance ({getCurrencySymbol(selectedCurrency)}{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </p>
              {amount && Number(amount.replace(/,/g, "")) > currentBalance && (
                <p className="text-red-400 text-xs mt-1">
                  Insufficient balance. Amount exceeds available balance.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    className="bg-bg-2400 dark:bg-bg-2100 border border-border-600 hover:bg-white/10 text-white/80 text-xs rounded py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setAmount(formatNumberWithCommas(String(amt)))}
                    disabled={amt > currentBalance}
                  >
                    {getCurrencySymbol(selectedCurrency)}{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-white/80 text-sm">Narration (Optional)</label>
          <input
            className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white placeholder:text-white/40 outline-none"
            placeholder="Add a note"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>

        <CustomButton
          type="button"
          disabled={!canProceed || !accountExists}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            if (!accountExists) {
              ErrorToast({ 
                title: "Account Not Found", 
                descriptions: [`${selectedCurrency} account not found. Please create an account first.`] 
              });
              return;
            }
            setOpenConfirm(true);
          }}
        >
          Next
        </CustomButton>
      </div>
      <PaymentConfirmModal
        isOpen={openConfirm}
        onClose={() => setOpenConfirm(false)}
        recipientName={accountName}
        bankName={type === "nattypay" ? "NattyPay" : bankName}
        accountNumber={accountNumber}
        amount={Number((amount || "").replace(/,/g, "")) || 0}
        onConfirm={(pin) => {
          const amt = Number((amount || "").replace(/,/g, "")) || 0;
          if (!accountExists) {
            ErrorToast({ 
              title: "Account Not Found", 
              descriptions: [`${selectedCurrency} account not found. Please create an account first.`] 
            });
            return;
          }
          if (amt > currentBalance) {
            ErrorToast({ 
              title: "Insufficient Balance", 
              descriptions: [`Insufficient balance. Available: ${getCurrencySymbol(selectedCurrency)}${Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`] 
            });
            return;
          }
          if (pin && pin.length === 4) {
            initiateTransfer({
              accountName,
              accountNumber,
              amount: amt,
              description: narration,
              walletPin: pin,
              sessionId,
              ...(type === "bank" ? { bankCode } : {}),
              currency: selectedCurrency,
              addBeneficiary: false,
            } as any);
            setOpenConfirm(false);
          } else {
            ErrorToast({ title: "Invalid PIN Entered", descriptions: ["Please enter a valid 4-digit PIN"] });
          }
        }}
      />

      <PaymentResultModal
        isOpen={openResult}
        onClose={() => setOpenResult(false)}
        status={resultStatus}
        amount={Number((amount || "").replace(/,/g, "")) || 0}
        transactionId={resultPayload?.transaction?.transactionRef || resultPayload?.meta?.transactionId || ""}
        dateTime={new Date(resultPayload?.transaction?.createdAt || resultPayload?.meta?.dateTime || new Date()).toLocaleString()}
        paymentMethod={"Available Balance"}
        transactionType={type === "bank" ? "Inter-bank Transfer" : "Intra-bank Transfer"}
        recipientName={accountName}
        recipientAccount={accountNumber}
        bankName={type === "nattypay" ? "NattyPay" : bankName}
        narration={narration}
        errorMessage={resultPayload?.meta?.errorMessage}
      />
    </div>
  );
};

export default PaymentTransferForm;
