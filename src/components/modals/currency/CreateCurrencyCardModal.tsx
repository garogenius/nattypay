"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useCreateCard, useGetCurrencyAccounts } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface CreateCurrencyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCurrencyCardModal: React.FC<CreateCurrencyCardModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currency, setCurrency] = React.useState<"USD" | "EUR" | "GBP">("USD");
  const [label, setLabel] = React.useState("");
  const [initialBalance, setInitialBalance] = React.useState("");
  const [currencyOpen, setCurrencyOpen] = React.useState(false);
  const currencyRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(currencyRef, () => setCurrencyOpen(false));

  const { accounts } = useGetCurrencyAccounts();

  const currencies: Array<{ value: "USD" | "EUR" | "GBP"; label: string }> = [
    { value: "USD", label: "US Dollar" },
    { value: "EUR", label: "Euro" },
    { value: "GBP", label: "British Pound" },
  ];

  const hasCurrencyAccount = (curr: "USD" | "EUR" | "GBP") => {
    if (!Array.isArray(accounts)) return false;
    return accounts.some((acc: any) => 
      acc?.currency && String(acc.currency).toUpperCase() === curr.toUpperCase()
    );
  };

  const availableCurrencies = currencies.filter((c) => hasCurrencyAccount(c.value));

  React.useEffect(() => {
    if (isOpen && availableCurrencies.length > 0) {
      setCurrency(availableCurrencies[0].value);
    }
  }, [isOpen, availableCurrencies]);

  const handleClose = () => {
    setCurrency("USD");
    setLabel("");
    setInitialBalance("");
    setCurrencyOpen(false);
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create card"];
    ErrorToast({
      title: "Card Creation Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Card Created",
      description: `${currency} virtual card created successfully`,
    });
    handleClose();
    onSuccess();
  };

  const { mutate: createCard, isPending } = useCreateCard(onError, onSuccessCallback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !currency) return;

    const formdata: any = {
      currency,
      label: label.trim(),
    };

    if (initialBalance && Number(initialBalance) > 0) {
      formdata.initialBalance = Number(initialBalance);
    }

    createCard(formdata);
  };

  if (!isOpen) return null;

  const canSubmit = !!currency && label.trim().length > 0;

  if (availableCurrencies.length === 0) {
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
          <div className="px-5 sm:px-6 pt-1 pb-6 text-center">
            <h2 className="text-white text-base sm:text-lg font-semibold mb-2">No Currency Accounts</h2>
            <p className="text-white/60 text-sm mb-4">
              You need a USD, EUR, or GBP account to create a virtual card. Please create a currency account first.
            </p>
            <CustomButton
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              Close
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-white text-base sm:text-lg font-semibold">Create Virtual Card</h2>
          <p className="text-white/60 text-sm mt-1">Create a new virtual card for USD, EUR, or GBP</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          {/* Currency Selection */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Currency</label>
            <div className="relative" ref={currencyRef}>
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="w-full flex items-center justify-between bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white"
              >
                <div className="flex items-center gap-3">
                  {getCurrencyIconByString(currency, 20)}
                  <span>{currencies.find((c) => c.value === currency)?.label}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-white/60 transition-transform ${currencyOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {currencyOpen && (
                <div className="absolute z-10 w-full mt-1 bg-bg-600 dark:bg-bg-1100 border border-border-600 rounded-lg overflow-hidden">
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.value}
                      type="button"
                      onClick={() => {
                        setCurrency(curr.value);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-white/5 transition-colors ${
                        currency === curr.value ? "bg-white/10" : ""
                      }`}
                    >
                      {getCurrencyIconByString(curr.value, 20)}
                      <span className="text-white">{curr.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card Label */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Card Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., My Shopping Card"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
              maxLength={50}
            />
          </div>

          {/* Initial Balance (Optional) */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Initial Balance (Optional)</label>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setInitialBalance(value);
                }
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
            />
          </div>

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
              Create Card
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCurrencyCardModal;






