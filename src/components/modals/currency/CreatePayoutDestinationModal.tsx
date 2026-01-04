"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useCreateCurrencyAccountPayoutDestination, useGetBanksByCurrency } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { ICurrencyAccount } from "@/api/currency/currency.types";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface CreatePayoutDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ICurrencyAccount;
  onSuccess: () => void;
}

const CreatePayoutDestinationModal: React.FC<CreatePayoutDestinationModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const [type, setType] = React.useState<"wire" | "nip" | "stablecoin">("wire");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [bankOpen, setBankOpen] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState<{ code: string; name: string } | null>(null);
  const bankRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(bankRef, () => setBankOpen(false));

  const currency = account.currency || "USD";
  const { banks, isPending: banksLoading } = useGetBanksByCurrency(currency);

  React.useEffect(() => {
    if (isOpen) {
      setType("wire");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setSelectedBank(null);
      setBankOpen(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setType("wire");
    setAccountNumber("");
    setAccountName("");
    setBankName("");
    setSelectedBank(null);
    setBankOpen(false);
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create payout destination"];
    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Destination Created",
      description: "Payout destination created successfully",
    });
    handleClose();
    onSuccess();
  };

  const { mutate: createDestination, isPending } = useCreateCurrencyAccountPayoutDestination(
    onError,
    onSuccessCallback
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim()) return;

    const formdata: any = {
      type,
      account_number: accountNumber.trim(),
      account_name: accountName.trim(),
    };

    if (type === "wire" && (bankName.trim() || selectedBank)) {
      formdata.bank_name = bankName.trim() || selectedBank?.name || "";
    }

    createDestination({ currency, formdata });
  };

  if (!isOpen || !account) return null;

  const canSubmit = !!type && accountNumber.trim().length > 0 && accountName.trim().length > 0;
  const showBankField = type === "wire";

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Create Payout Destination</h2>
          <p className="text-white/60 text-sm mt-1">Add a new payout destination for {currency} account</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Destination Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "wire", label: "Wire" },
                { value: "nip", label: "NIP" },
                { value: "stablecoin", label: "Stablecoin" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    type === t.value
                      ? "bg-primary text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter account number"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
            />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Enter account holder name"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
            />
          </div>

          {/* Bank Name (for wire transfers) */}
          {showBankField && (
            <div>
              <label className="block text-sm text-white/80 mb-1.5">Bank Name</label>
              {banks && banks.length > 0 ? (
                <div className="relative" ref={bankRef}>
                  <button
                    type="button"
                    onClick={() => setBankOpen(!bankOpen)}
                    className="w-full flex items-center justify-between bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white"
                  >
                    <span>{selectedBank?.name || bankName || "Select bank"}</span>
                    <svg
                      className={`w-5 h-5 text-white/60 transition-transform ${bankOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {bankOpen && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-bg-600 dark:bg-bg-1100 border border-border-600 rounded-lg">
                      {banksLoading ? (
                        <div className="p-3 text-white/60 text-sm">Loading banks...</div>
                      ) : (
                        banks.map((bank: any) => (
                          <button
                            key={bank.code}
                            type="button"
                            onClick={() => {
                              setSelectedBank(bank);
                              setBankName(bank.name);
                              setBankOpen(false);
                            }}
                            className="w-full px-3 py-3 text-left hover:bg-white/5 transition-colors text-white"
                          >
                            {bank.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter bank name"
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
                />
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <CustomButton
              type="button"
              onClick={handleClose}
              className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg transition-colors"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              isLoading={isPending}
              disabled={!canSubmit || isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              Create Destination
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayoutDestinationModal;






