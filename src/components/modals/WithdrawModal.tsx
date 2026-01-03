"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import { useGetAllBanks, useVerifyAccount } from "@/api/wallet/wallet.queries";
import { formatNumberWithCommas } from "@/utils/utilityFunctions";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import { FiCheckCircle } from "react-icons/fi";
import PinInputWithFingerprint from "@/components/shared/PinInputWithFingerprint";
import InsufficientBalanceModal from "@/components/modals/finance/InsufficientBalanceModal";
import { isInsufficientBalanceError, extractBalanceInfo } from "@/utils/errorUtils";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();

  const [step, setStep] = useState<number>(0);
  const { banks } = useGetAllBanks();
  const [selectedBank, setSelectedBank] = useState<{ name: string; bankCode: string } | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setBankOpen(false));
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [pin, setPin] = useState("");
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState<{ requiredAmount?: number; currentBalance?: number }>({});

  const canNextAccount = useMemo(() => {
    const n = Number(amount.replace(/,/g, "")) || 0;
    return accountNumber.length === 10 && !!accountName && !!sessionId && n > 0;
  }, [accountNumber, accountName, sessionId, amount]);

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
  };
  const { mutate: verifyAccount } = useVerifyAccount(onVerifyAccountError, onVerifyAccountSuccess);

  useEffect(()=>{
    if (isOpen) {
      setStep(0); setSelectedBank(null); setBankOpen(false); setAccountNumber(""); setAccountName(""); setSessionId(""); setAmount(""); setPin("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
      onClick={onClose}
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" />
      </div>
      <div
        onClick={(e)=>e.stopPropagation()}
        className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-2xl max-h-[94vh] rounded-2xl overflow-visible"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-6">
          <h2 className="text-white text-base sm:text-lg font-semibold">Withdraw Funds</h2>
        </div>

        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          {step === 0 && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Select Bank</label>
                <div className="relative w-full" ref={dropdownRef}>
                  <div
                    onClick={() => setBankOpen(!bankOpen)}
                    className="w-full flex gap-2 justify-center items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 cursor-pointer"
                  >
                    <div className="w-full flex items-center justify-between text-white/80">
                      {!selectedBank ? (
                        <p className="text-sm">Select Bank</p>
                      ) : (
                        <p className="text-sm font-medium">{selectedBank.name}</p>
                      )}
                      <svg className={`w-4 h-4 transition-transform ${bankOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
                    </div>
                  </div>
                  {bankOpen && (
                    <div className="absolute top-full my-2.5 px-1 py-2 overflow-y-auto h-fit max-h-60 w-full bg-bg-600 border dark:bg-bg-1100 border-gray-300 dark:border-border-600 rounded-md shadow-md z-50 no-scrollbar">
                      <SearchableDropdown
                        items={banks}
                        searchKey="name"
                        displayFormat={(bank) => (
                          <div className="flex flex-col text-white/90">
                            <p className="text-sm font-medium">{bank.name}</p>
                          </div>
                        )}
                        onSelect={(bank: any) => {
                          setSelectedBank({ name: bank.name, bankCode: String(bank.bankCode) });
                          setBankOpen(false);
                        }}
                        placeholder="Search bank..."
                        isOpen={bankOpen}
                        onClose={() => setBankOpen(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {selectedBank && (
                <div className="flex flex-col gap-1">
                  <label className="text-white text-sm">Account Number</label>
                  <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
                    <input
                      className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50"
                      placeholder="0000000000"
                      value={accountNumber}
                      inputMode="numeric"
                      maxLength={10}
                      onChange={(e)=> {
                        const v = e.target.value.replace(/\D/g,"");
                        setAccountNumber(v);
                        if (v.length === 10 && selectedBank) verifyAccount({ accountNumber: v, bankCode: selectedBank.bankCode });
                      }}
                    />
                  </div>
                  {accountName && (
                    <div className="w-full rounded-md bg-[#0E2C25] text-emerald-200 text-sm px-3 py-2 flex items-center gap-2 mt-2">
                      <FiCheckCircle className="text-emerald-400" />
                      <span className="truncate">{accountName}</span>
                    </div>
                  )}
                </div>
              )}

              {accountName && (
                <div className="flex flex-col gap-1">
                  <label className="text-white text-sm">Amount</label>
                  <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3">
                    <input
                      className="w-full bg-transparent p-0 border-none outline-none text-base text-white placeholder:text-white/50"
                      placeholder="0.00"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e)=> {
                        const v = e.target.value.replace(/,/g,"");
                        if (/^\d*\.?\d*$/.test(v)) setAmount(formatNumberWithCommas(v));
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="w-full grid grid-cols-2 gap-4 items-stretch mt-2">
                <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={onClose}>
                  Back
                </CustomButton>
                <CustomButton type="button" disabled={!canNextAccount} className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={()=> setStep(1)}>
                  Next
                </CustomButton>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="w-full flex flex-col gap-4">
              <p className="text-white/90 text-sm">Confirm Transactions</p>
              <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white text-sm">
                <div className="flex items-center justify-between py-1.5">
                  <p className="text-white/60">Merchant Name</p>
                  <p className="font-medium text-right truncate max-w-[60%]">{accountName}</p>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <p className="text-white/60">Bank</p>
                  <p className="font-medium text-right truncate max-w-[60%]">{selectedBank?.name || ""}</p>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <p className="text-white/60">Account Number</p>
                  <p className="font-medium text-right">{accountNumber}</p>
                </div>
                <div className="my-2 border-t border-dashed border-white/20" />
                <div className="flex items-center justify-between py-1.5">
                  <p className="text-white/60">Amount</p>
                  <p className="font-medium text-right">₦{(Number(amount.replace(/,/g,""))||0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-white text-sm">Enter Transaction PIN</label>
                <PinInputWithFingerprint
                  value={pin}
                  onChange={setPin}
                  placeholder="••••"
                />
              </div>

              

              <div className="w-full grid grid-cols-2 gap-4 items-stretch mt-2">
                <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={()=> setStep(0)}>
                  Back
                </CustomButton>
                <CustomButton
                  type="button"
                  disabled={!pin || !(Number(amount.replace(/,/g,""))>0)}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl"
                  onClick={() => {
                    // TODO: Implement withdraw API call here
                    // When implementing, add error handling like this:
                    // const onError = (error: any) => {
                    //   if (isInsufficientBalanceError(error)) {
                    //     const info = extractBalanceInfo(error);
                    //     const ngnWallet = user?.wallet?.find((w) => w.currency?.toLowerCase() === 'ngn');
                    //     if (!info.currentBalance && ngnWallet) {
                    //       info.currentBalance = ngnWallet.balance || 0;
                    //     }
                    //     if (!info.requiredAmount) {
                    //       info.requiredAmount = Number(amount.replace(/,/g, ""));
                    //     }
                    //     setBalanceInfo(info);
                    //     setShowInsufficientBalanceModal(true);
                    //     return;
                    //   }
                    //   // Handle other errors
                    // };
                    onClose();
                  }}
                >
                  Pay
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        isOpen={showInsufficientBalanceModal}
        onClose={() => {
          setShowInsufficientBalanceModal(false);
          setStep(0);
        }}
        requiredAmount={balanceInfo.requiredAmount}
        currentBalance={balanceInfo.currentBalance}
      />
    </div>
  );
};

export default WithdrawModal;
