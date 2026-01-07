"use client";

import React from "react";
import { FiPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { useGetCurrencyAccounts } from "@/api/currency/currency.queries";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import Image from "next/image";
import MultiCurrencyAccountDetails from "./MultiCurrencyAccountDetails";
import CreateCurrencyAccountModal from "@/components/modals/currency/CreateCurrencyAccountModal";

const MultiCurrencyContent: React.FC = () => {
  const [selectedCurrency, setSelectedCurrency] = React.useState<"USD" | "EUR" | "GBP" | null>(null);
  const [openCreate, setOpenCreate] = React.useState(false);
  const [balanceVisible, setBalanceVisible] = React.useState<Record<string, boolean>>({});

  const { accounts, isPending, refetch } = useGetCurrencyAccounts();

  const accountsList = Array.isArray(accounts) ? accounts : [];
  const currencyAccounts = accountsList.filter((acc: any) => 
    acc?.currency && ["USD", "EUR", "GBP"].includes(String(acc.currency).toUpperCase())
  );

  React.useEffect(() => {
    if (currencyAccounts.length > 0 && !selectedCurrency) {
      const firstCurrency = String(currencyAccounts[0].currency).toUpperCase() as "USD" | "EUR" | "GBP";
      setSelectedCurrency(firstCurrency);
    }
  }, [currencyAccounts, selectedCurrency]);

  const handleCreateSuccess = () => {
    setOpenCreate(false);
    refetch();
  };

  const formatBalance = (balance: number | undefined, currency: string) => {
    if (balance === undefined || balance === null) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency.toUpperCase()) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return currency.toUpperCase();
    }
  };

  const toggleBalanceVisibility = (currency: string) => {
    setBalanceVisible((prev) => ({
      ...prev,
      [currency]: !prev[currency],
    }));
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="w-full flex flex-col gap-3">
        <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Multi-Currency</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1">Manage your USD, EUR, and GBP accounts</p>
          </div>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <FiPlus className="text-base" />
            <span className="hidden sm:inline">Create Account</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>
      </div>

      {/* Account Cards - Show only active on Mobile, Grid on Desktop */}
      <div className="w-full">
        {/* Mobile - Show only active card */}
        <div className="sm:hidden">
          {isPending ? (
            // Show skeleton card while loading
            <div className="mx-2 bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-white/10" />
                <div className="h-4 w-24 bg-white/10 rounded" />
              </div>
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-8 w-32 bg-white/10 rounded" />
            </div>
          ) : currencyAccounts.length > 0 ? (
            <>
              {(() => {
                // Find the active account or use the first one
                const activeAccount = currencyAccounts.find((account: any) => {
                  const currency = String(account.currency).toUpperCase() as "USD" | "EUR" | "GBP";
                  return selectedCurrency === currency;
                }) || currencyAccounts[0];
                
                const currency = String(activeAccount.currency).toUpperCase() as "USD" | "EUR" | "GBP";
                const balance = activeAccount.balance || 0;
                const isVisible = balanceVisible[currency] !== false;
                const isActive = selectedCurrency === currency;

                return (
                  <>
                    <div
                      key={activeAccount.id || activeAccount.currency}
                      className="mx-2 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 bg-[#D4B139] text-black transition-all w-[calc(100%-1rem)]"
                    >
                      {/* Header: currency icon + account label */}
                      <div className="flex items-center gap-2 text-black">
                        <Image
                          src={getCurrencyIconByString(currency.toLowerCase()) || ""}
                          alt={currency}
                          width={32}
                          height={32}
                          className="w-8 h-8"
                        />
                        <p className="text-sm sm:text-base font-semibold uppercase flex-1 text-black">
                          {activeAccount.accountName || activeAccount.label || `${currency} Account`}
                        </p>
                      </div>

                      {/* Subtitle + eye toggle */}
                      <div className="flex items-center gap-2 font-semibold">
                        <p className="text-xs sm:text-sm text-black/80">
                          {currency} Balance
                        </p>
                        {isVisible ? (
                          <FiEyeOff
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBalanceVisibility(currency);
                            }}
                            className="cursor-pointer text-base text-black/80"
                          />
                        ) : (
                          <FiEye
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBalanceVisibility(currency);
                            }}
                            className="cursor-pointer text-base text-black/80"
                          />
                        )}
                      </div>

                      {/* Amount */}
                      <p className="text-2xl sm:text-3xl font-semibold text-black">
                        {isVisible
                          ? `${getCurrencySymbol(currency)} ${formatBalance(balance, currency)}`
                          : "---"}
                      </p>
                    </div>
                    
                    {/* Navigation dots for switching between accounts */}
                    {currencyAccounts.length > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {currencyAccounts.map((account: any) => {
                          const accCurrency = String(account.currency).toUpperCase() as "USD" | "EUR" | "GBP";
                          const isDotActive = selectedCurrency === accCurrency;
                          return (
                            <button
                              key={account.id || account.currency}
                              onClick={() => setSelectedCurrency(accCurrency)}
                              className={`h-2 rounded-full transition-all ${
                                isDotActive ? "bg-[#D4B139] w-8" : "bg-white/30 w-2"
                              }`}
                              aria-label={`Switch to ${accCurrency} account`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            // No accounts - show create card
            <div
              onClick={() => setOpenCreate(true)}
              className="mx-2 bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all min-h-[140px] w-[calc(100%-1rem)]"
            >
              <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
                <FiPlus className="text-lg" />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-text-200 dark:text-text-800 text-sm sm:text-base font-semibold">Create Account</p>
                <p className="text-text-200 dark:text-text-400 text-xs">USD, EUR, or GBP</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="hidden sm:grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {isPending ? (
            // Show skeleton cards while loading
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-white/10" />
                  <div className="h-4 w-24 bg-white/10 rounded" />
                </div>
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            <>
              {currencyAccounts.map((account: any) => {
                const currency = String(account.currency).toUpperCase() as "USD" | "EUR" | "GBP";
                const isActive = selectedCurrency === currency;
                const balance = account.balance || 0;
                const isVisible = balanceVisible[currency] !== false;

                return (
                  <div
                    key={account.id || account.currency}
                    onClick={() => setSelectedCurrency(currency)}
                    className={`rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#D4B139] text-black ring-2 ring-[#D4B139]" 
                        : "bg-bg-600 dark:bg-bg-1100"
                    }`}
                  >
                    {/* Header: currency icon + account label */}
                    <div className={`flex items-center gap-2 ${isActive ? "text-black" : "text-text-200 dark:text-text-800"}`}>
                      <Image
                        src={getCurrencyIconByString(currency.toLowerCase()) || ""}
                        alt={currency}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <p className={`text-sm sm:text-base font-semibold uppercase flex-1 ${isActive ? "text-black" : ""}`}>
                        {account.accountName || account.label || `${currency} Account`}
                      </p>
                    </div>

                    {/* Subtitle + eye toggle */}
                    <div className="flex items-center gap-2 font-semibold">
                      <p className={`text-xs sm:text-sm ${isActive ? "text-black/80" : "text-text-200 dark:text-text-800"}`}>
                        {currency} Balance
                      </p>
                      {isVisible ? (
                        <FiEyeOff
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBalanceVisibility(currency);
                          }}
                          className={`cursor-pointer text-base ${isActive ? "text-black/80" : "text-text-200 dark:text-text-800"}`}
                        />
                      ) : (
                        <FiEye
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBalanceVisibility(currency);
                          }}
                          className={`cursor-pointer text-base ${isActive ? "text-black/80" : "text-text-200 dark:text-text-800"}`}
                        />
                      )}
                    </div>

                    {/* Amount */}
                    <p className={`text-2xl sm:text-3xl font-semibold ${isActive ? "text-black" : "text-text-400"}`}>
                      {isVisible
                        ? `${getCurrencySymbol(currency)} ${formatBalance(balance, currency)}`
                        : "---"}
                    </p>
                  </div>
                );
              })}

              {/* Create Account Card (if less than 3 accounts) */}
              {currencyAccounts.length < 3 && (
                <div
                  onClick={() => setOpenCreate(true)}
                  className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all min-h-[140px]"
                >
                  <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
                    <FiPlus className="text-lg" />
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-text-200 dark:text-text-800 text-sm sm:text-base font-semibold">Create Account</p>
                    <p className="text-text-200 dark:text-text-400 text-xs">USD, EUR, or GBP</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Account Details Section */}
      {selectedCurrency ? (
        <MultiCurrencyAccountDetails currency={selectedCurrency} onRefetch={refetch} />
      ) : currencyAccounts.length === 0 ? (
        <div className="rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 p-8 sm:p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border-4 border-white/10">
            <FiPlus className="text-4xl text-white/40" />
          </div>
          <div className="text-center">
            <p className="text-white text-base sm:text-lg mb-2">No multi-currency accounts yet</p>
            <p className="text-white/60 text-sm mb-4">Create your first USD, EUR, or GBP account to get started</p>
            <button
              onClick={() => setOpenCreate(true)}
              className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      ) : null}

      {/* Create Account Modal */}
      <CreateCurrencyAccountModal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default MultiCurrencyContent;
