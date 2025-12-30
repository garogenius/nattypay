"use client";

import React, { useEffect, useState, useRef } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import { useVerifyAccount, useGetAllBanks } from "@/api/wallet/wallet.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import SuccessToast from "@/components/toast/SuccessToast";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface ClipboardAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountNumber: string;
  onAccountVerified?: (data: { accountNumber: string; accountName: string; bankCode: string }) => void;
}

const ClipboardAccountModal: React.FC<ClipboardAccountModalProps> = ({
  isOpen,
  onClose,
  accountNumber,
  onAccountVerified,
}) => {
  const [selectedBank, setSelectedBank] = useState<{name: string; bankCode: string} | null>(null);
  const [accountName, setAccountName] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const bankRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(bankRef, () => setBankOpen(false));

  const { banks } = useGetAllBanks();

  const onVerifySuccess = (data: any) => {
    const d = data?.data?.data;
    setAccountName(d?.accountName || "");
    setIsVerifying(false);
    SuccessToast({
      title: "Account Verified",
      description: `Account name: ${d?.accountName || "N/A"}`,
    });
    if (onAccountVerified && selectedBank) {
      onAccountVerified({
        accountNumber,
        accountName: d?.accountName || "",
        bankCode: selectedBank.bankCode,
      });
    }
  };

  const onVerifyError = (error: any) => {
    setIsVerifying(false);
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Verification Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage || "Could not verify account"],
    });
    setAccountName("");
  };

  const { mutate: verifyAccount } = useVerifyAccount(onVerifyError, onVerifySuccess);

  const handleVerify = () => {
    if (!selectedBank || accountNumber.length !== 10) return;
    setIsVerifying(true);
    verifyAccount({
      accountNumber,
      bankCode: selectedBank.bankCode,
    });
  };

  const handleClose = () => {
    setSelectedBank(null);
    setAccountName("");
    setIsVerifying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">Account Number Detected</h2>
            <p className="text-white/60 text-sm">Verify account details from clipboard</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <p className="text-blue-400 text-xs font-medium mb-1">Account Number</p>
            <p className="text-white text-lg font-mono font-semibold">{accountNumber}</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2" ref={bankRef}>
              <label className="text-white/70 text-sm font-medium">Select Bank</label>
              <div
                onClick={() => setBankOpen(!bankOpen)}
                className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
              >
                <span className={selectedBank ? "text-white" : "text-white/50"}>
                  {selectedBank?.name || "Select bank"}
                </span>
                <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${bankOpen ? 'rotate-180' : ''}`} />
              </div>
              {bankOpen && (
                <div className="relative">
                  <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                    <SearchableDropdown
                      items={banks}
                      searchKey="name"
                      displayFormat={(bank: any) => (
                        <div className="flex flex-col text-white/90">
                          <p className="text-sm font-medium">{bank.name}</p>
                        </div>
                      )}
                      onSelect={(bank: any) => {
                        setSelectedBank({ name: bank.name, bankCode: String(bank.bankCode) });
                        setBankOpen(false);
                        setAccountName(""); // Reset account name when bank changes
                      }}
                      placeholder="Search bank..."
                      isOpen={bankOpen}
                      onClose={() => setBankOpen(false)}
                    />
                  </div>
                </div>
              )}
            </div>

            {accountName && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 text-xs font-medium mb-1">Account Name</p>
                <p className="text-white text-base font-semibold">{accountName}</p>
              </div>
            )}

            <div className="flex gap-3">
              <CustomButton
                onClick={handleClose}
                className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-3"
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleVerify}
                disabled={!selectedBank || accountNumber.length !== 10 || isVerifying}
                isLoading={isVerifying}
                className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3"
              >
                Verify Account
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClipboardAccountModal;

