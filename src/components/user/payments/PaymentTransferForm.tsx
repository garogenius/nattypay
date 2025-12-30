"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useVerifyAccount, useInitiateTransfer, useGetAllBanks } from "@/api/wallet/wallet.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { FiCheckCircle } from "react-icons/fi";
import CustomButton from "@/components/shared/Button";
import { formatNumberWithCommas } from "@/utils/utilityFunctions";
import useUserStore from "@/store/user.store";
import { useGetTransactions } from "@/api/wallet/wallet.queries";
import images from "../../../../public/images";
import Image from "next/image";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import PaymentConfirmModal from "@/components/modals/PaymentConfirmModal";
import PaymentResultModal from "@/components/modals/PaymentResultModal";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useOnClickOutside from "@/hooks/useOnClickOutside";

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
  const primaryWallet = user?.wallet?.[0];
  const { transactionsData } = useGetTransactions({ page: 1, limit: 8 });
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
  const { banks } = useGetAllBanks();
  const [openBanks, setOpenBanks] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement | null>(null);
  useOnClickOutside(bankDropdownRef, () => setOpenBanks(false));

  const onVerifyAccountError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    ErrorToast({ title: "Error during Account Verification", descriptions });
    setAccountName("");
    setSessionId("");
  };

  const onVerifyAccountSuccess = (data: any) => {
    const d = data?.data?.data;
    setAccountName(d?.accountName || "");
    setSessionId(d?.sessionId || "");
    if (type === "nattypay" && d?.bankCode) {
      setBankCode(d.bankCode);
    }
  };

  const { mutate: verifyAccount, isPending: verifyLoading } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  const handleAccountChange = (val: string) => {
    const v = val.replace(/\D/g, "");
    setAccountNumber(v);
    // Clear previous verification when value changes
    setAccountName("");
    setSessionId("");
  };

  useEffect(() => {
    if (accountNumber && accountNumber.length === 10) {
      if (type === "nattypay") {
        verifyAccount({ accountNumber });
      } else if (type === "bank" && bankCode) {
        verifyAccount({ accountNumber, bankCode });
      }
    }
  }, [accountNumber, bankCode, type, verifyAccount]);

  const canProceed = useMemo(() => {
    const amt = Number(amount.replace(/,/g, "")) || 0;
    return accountNumber.length === 10 && !!accountName && !!sessionId && amt > 0;
  }, [accountNumber, accountName, sessionId, amount]);

  const quickAmounts = [1000, 5000, 10000, 20000];
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [resultPayload, setResultPayload] = useState<any>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "failed">("success");

  const onTransferError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage];
    ErrorToast({ title: "Error during transfer", descriptions });
    setResultStatus("failed");
    const now = new Date();
    setResultPayload({
      transaction: null,
      meta: {
        transactionId: error?.response?.data?.transactionRef || "",
        dateTime: now,
      },
    });
    setOpenResult(true);
  };

  const onTransferSuccess = ({ transaction }: any) => {
    SuccessToast({ title: "Transfer successful", description: "Your transfer was successful" });
    setResultStatus("success");
    setResultPayload({ transaction });
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

        {type === "bank" && (
          <>
            {/* Bank dropdown FIRST */}
            <div className="flex flex-col gap-1" ref={bankDropdownRef}>
              <label className="text-white/80 text-sm">Select Banks</label>
              <div className="relative">
                <button
                  type="button"
                  className={`w-full flex items-center justify-between bg-bg-2400 dark:bg-bg-2100 border border-border-600 py-3 px-3 text-white/80 focus:outline-none focus:ring-1 focus:ring-[#D4B139] rounded-lg ${openBanks ? "rounded-b-none border-b-0" : ""}`}
                  onClick={(e)=>{ e.preventDefault(); setOpenBanks((o)=>!o); }}
                >
                  <span className="truncate text-white/80">{bankName || "Select Recipient Bank"}</span>
                  <svg className={`w-4 h-4 text-white/70 transition-transform ${openBanks ? "rotate-180" : "rotate-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>

                <div className="absolute left-0 right-0 top-full z-20">
                  <div className={`overflow-y-auto max-h-60 bg-bg-600 dark:bg-bg-1100 border border-border-600 dark:border-border-600 shadow-md no-scrollbar ${openBanks ? "block" : "hidden"} rounded-b-lg ${openBanks ? "-mt-px" : ""}`}>
                    <SearchableDropdown
                      items={banks}
                      searchKey="name"
                      displayFormat={(bank:any) => (
                        <div className="flex flex-col text-text-700 dark:text-text-1000">
                          <p className="text-sm font-medium">{bank.name}</p>
                        </div>
                      )}
                      onSelect={(bank:any) => {
                        setBankCode(String(bank.bankCode));
                        setBankName(bank.name);
                      }}
                      placeholder="Search bank..."
                      isOpen={openBanks}
                      onClose={()=>{ setOpenBanks(false); }}
                    />
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
            className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white placeholder:text-white/40 outline-none"
            placeholder="0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/,/g, "");
              if (/^\d*\.?\d*$/.test(v)) setAmount(formatNumberWithCommas(v));
            }}
          />
          <p className="text-[#D4B139] text-xs mt-1">
            Available Balance (₦{Number(primaryWallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                className="bg-bg-2400 dark:bg-bg-2100 border border-border-600 hover:bg-white/10 text-white/80 text-xs rounded py-2 transition-colors"
                onClick={() => setAmount(formatNumberWithCommas(String(amt)))}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
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
          disabled={!canProceed}
          className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl font-medium mt-2"
          onClick={() => setOpenConfirm(true)}
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
          if (pin && pin.length === 4) {
            initiateTransfer({
              accountName,
              accountNumber,
              amount: amt,
              description: narration,
              walletPin: pin,
              sessionId,
              ...(type === "bank" ? { bankCode } : {}),
              currency: "NGN",
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
      />
    </div>
  );
};

export default PaymentTransferForm;
