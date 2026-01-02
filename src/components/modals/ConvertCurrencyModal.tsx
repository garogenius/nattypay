"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useConvertCurrency, useGetCurrencyRates, useGetSupportedCurrencies } from "@/api/currency/currency.queries";

interface ConvertCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencies = ["NGN", "USD", "EUR", "GBP"] as const;

const ConvertCurrencyModal: React.FC<ConvertCurrencyModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [fromCurrencyOpen, setFromCurrencyOpen] = useState(false);
  const [toCurrencyOpen, setToCurrencyOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState<typeof currencies[number]>("NGN");
  const [toCurrency, setToCurrency] = useState<typeof currencies[number]>("USD");
  const [amount, setAmount] = useState<string>("");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const fromCurrencyRef = useRef<HTMLDivElement>(null);
  const toCurrencyRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(fromCurrencyRef, () => setFromCurrencyOpen(false));
  useOnClickOutside(toCurrencyRef, () => setToCurrencyOpen(false));

  // Fetch exchange rate when currencies are selected (enabled when both currencies are different)
  const { rateData, isPending: rateLoading, isError: rateError } = useGetCurrencyRates({
    from: fromCurrency,
    to: toCurrency,
  });

  useEffect(() => {
    const rate = rateData?.rate;
    
    if (rate && rate > 0) {
      setExchangeRate(rate);
      if (amount && Number(amount) > 0) {
        setConvertedAmount(Number(amount) * rate);
      } else {
        setConvertedAmount(null);
      }
    } else {
      setExchangeRate(null);
      setConvertedAmount(null);
    }
  }, [rateData, amount]);

  const canProceed = !!fromCurrency && !!toCurrency && Number(amount) > 0 && fromCurrency !== toCurrency;

  const handleClose = () => {
    setStep("form");
    setFromCurrencyOpen(false);
    setToCurrencyOpen(false);
    setAmount("");
    setExchangeRate(null);
    setConvertedAmount(null);
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

  const onConvertSuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Currency Converted Successfully",
      description: `${fromCurrency} ${amount} converted to ${toCurrency} ${convertedAmount?.toLocaleString()}`,
    });
  };

  const onConvertError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage) ? errorMessage : [errorMessage || "Currency conversion failed"];
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Conversion Failed",
      descriptions,
    });
  };

  const { mutate: convertCurrency, isPending: converting } = useConvertCurrency(onConvertError, onConvertSuccess);

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">
              {step === "form" ? "Convert Currency" : step === "confirm" ? "Confirm Conversion" : "Conversion Result"}
            </h2>
            <p className="text-white/60 text-sm">
              {step === "form" ? "Convert between currencies" : step === "confirm" ? "Review conversion details" : "View conversion result"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* From Currency */}
              <div className="flex flex-col gap-2" ref={fromCurrencyRef}>
                <label className="text-white/70 text-sm">From Currency</label>
                <div
                  onClick={() => setFromCurrencyOpen(!fromCurrencyOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={fromCurrency ? "text-white" : "text-white/50"}>{fromCurrency || "Select currency"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${fromCurrencyOpen ? 'rotate-180' : ''}`} />
                </div>
                {fromCurrencyOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {currencies
                        .filter((c) => c !== toCurrency)
                        .map((currency) => (
                          <button
                            key={currency}
                            onClick={() => {
                              setFromCurrency(currency);
                              setFromCurrencyOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm"
                          >
                            {currency}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Amount</label>
                <input
                  type="number"
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
                      setAmount(value);
                    }
                  }}
                />
              </div>

              {/* To Currency */}
              <div className="flex flex-col gap-2" ref={toCurrencyRef}>
                <label className="text-white/70 text-sm">To Currency</label>
                <div
                  onClick={() => setToCurrencyOpen(!toCurrencyOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={toCurrency ? "text-white" : "text-white/50"}>{toCurrency || "Select currency"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${toCurrencyOpen ? 'rotate-180' : ''}`} />
                </div>
                {toCurrencyOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {currencies
                        .filter((c) => c !== fromCurrency)
                        .map((currency) => (
                          <button
                            key={currency}
                            onClick={() => {
                              setToCurrency(currency);
                              setToCurrencyOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm"
                          >
                            {currency}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Exchange Rate Display - Always show when currencies are selected */}
              {fromCurrency && toCurrency && fromCurrency !== toCurrency && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  {rateLoading ? (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <SpinnerLoader width={20} height={20} color="#D4B139" />
                      <span className="text-white/70 text-sm">Fetching exchange rate...</span>
                    </div>
                  ) : rateError ? (
                    <div className="text-center py-2">
                      <p className="text-red-400 text-sm">Failed to load exchange rate</p>
                      <p className="text-white/50 text-xs mt-1">Please try again</p>
                    </div>
                  ) : exchangeRate ? (
                    <>
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                        <div>
                          <p className="text-white/60 text-xs mb-1">Current Exchange Rate</p>
                          <p className="text-white text-lg font-bold">
                            1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                      {amount && Number(amount) > 0 && convertedAmount !== null && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">You Send</span>
                            <span className="text-white text-sm font-medium">{fromCurrency} {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">You Receive</span>
                            <span className="text-[#D4B139] text-xl font-bold">{toCurrency} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-white/60 text-sm">Exchange rate not available</p>
                    </div>
                  )}
                </div>
              )}

              <CustomButton
                type="button"
                disabled={!canProceed || converting}
                isLoading={converting}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg mt-2"
                onClick={() => setStep("confirm")}
              >
                Next
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">From</span>
                  <span className="text-white text-sm font-medium">{fromCurrency} {Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">To</span>
                  <span className="text-white text-sm font-medium">{toCurrency} {convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {exchangeRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Exchange Rate</span>
                    <span className="text-white text-sm font-medium">1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-2">
                <CustomButton onClick={() => setStep("form")} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">
                  Back
                </CustomButton>
                <CustomButton
                  onClick={() => {
                    if (!canProceed) return;
                    convertCurrency({
                      fromCurrency,
                      toCurrency,
                      amount: Number(amount),
                    });
                  }}
                  disabled={!canProceed || converting}
                  isLoading={converting}
                  className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg"
                >
                  Convert
                </CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: resultSuccess ? '#22c55e' : '#ef4444' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {resultSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>
                {resultSuccess ? 'Conversion Successful' : 'Conversion Failed'}
              </span>
              {resultSuccess && transactionData && (
                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">From</span>
                    <span className="text-white text-sm font-medium">{transactionData.fromCurrency} {transactionData.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">To</span>
                    <span className="text-[#D4B139] text-lg font-bold">{transactionData.toCurrency} {transactionData.convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {transactionData.exchangeRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Exchange Rate</span>
                      <span className="text-white text-sm font-medium">1 {transactionData.fromCurrency} = {transactionData.exchangeRate.toFixed(4)} {transactionData.toCurrency}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-4 w-full">
                <CustomButton onClick={handleClose} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">
                  Done
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConvertCurrencyModal;

