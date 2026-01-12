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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { accounts, isPending, refetch } = useGetCurrencyAccounts();

  const accountsList = Array.isArray(accounts) ? accounts : [];
  const currencyAccounts = accountsList.filter((acc: any) => 
    acc?.currency && ["USD", "EUR", "GBP"].includes(String(acc.currency).toUpperCase())
  );
  const hasSingleAccount = currencyAccounts.length === 1;

  React.useEffect(() => {
    if (currencyAccounts.length > 0 && !selectedCurrency) {
      const firstCurrency = String(currencyAccounts[0].currency).toUpperCase() as "USD" | "EUR" | "GBP";
      setSelectedCurrency(firstCurrency);
    }
  }, [currencyAccounts, selectedCurrency]);

  // Handle scroll to update selected currency
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || currencyAccounts.length === 0) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.offsetWidth;
      // Each card is calc(100vw - 2rem) wide, but in the container it's containerWidth - 32px (padding)
      const cardWidth = containerWidth - 32; // Account for padding (16px each side)
      const gap = 12; // gap-3 = 12px
      const cardIndex = Math.round(scrollLeft / (cardWidth + gap));
      
      if (cardIndex >= 0 && cardIndex < currencyAccounts.length) {
        const account = currencyAccounts[cardIndex];
        const currency = String(account.currency).toUpperCase() as "USD" | "EUR" | "GBP";
        if (selectedCurrency !== currency) {
          setSelectedCurrency(currency);
        }
      }
    };

    // Use a debounced scroll handler to avoid too many updates during scroll
    let scrollTimeout: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 150);
    };

    container.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    
    // Also check on scroll end for more accurate detection
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      handleScroll();
    };
    
    container.addEventListener('scrollend', handleScrollEnd, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', debouncedHandleScroll);
      container.removeEventListener('scrollend', handleScrollEnd);
      clearTimeout(scrollTimeout);
    };
  }, [currencyAccounts, selectedCurrency]);

  // Scroll to selected currency when it changes (for dot navigation)
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || currencyAccounts.length === 0 || !selectedCurrency) return;

    const accountIndex = currencyAccounts.findIndex((acc: any) => {
      const currency = String(acc.currency).toUpperCase() as "USD" | "EUR" | "GBP";
      return currency === selectedCurrency;
    });

    if (accountIndex >= 0) {
      const containerWidth = container.offsetWidth;
      const cardWidth = containerWidth - 32; // Account for padding
      const gap = 12; // gap-3
      const scrollPosition = accountIndex * (cardWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedCurrency, currencyAccounts]);

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
        {/* Mobile - Horizontal scrollable cards */}
        <div className="sm:hidden">
          {isPending ? (
            // Show skeleton cards while loading
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
              <div className="flex gap-3 min-w-max">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 animate-pulse w-[calc(100vw-2rem)] flex-shrink-0 snap-start"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-white/10" />
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </div>
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="h-8 w-32 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : currencyAccounts.length > 0 ? (
            <>
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="flex gap-3 w-full">
                  {currencyAccounts.map((account: any) => {
                    const currency = String(account.currency).toUpperCase() as "USD" | "EUR" | "GBP";
                    const isActive = selectedCurrency === currency;
                    const balance = account.balance || 0;
                    const isVisible = balanceVisible[currency] !== false;

                    return (
                      <div
                        key={account.id || account.currency}
                        onClick={() => setSelectedCurrency(currency)}
                        className={`rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4 cursor-pointer transition-all flex-shrink-0 snap-center w-full min-w-full max-w-[500px] mx-auto ${
                          isActive 
                            ? "bg-[#D4B139] text-black" 
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
                      className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition-all min-h-[140px] w-[calc(100vw-2rem)] flex-shrink-0 snap-start"
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
              </div>
              
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
