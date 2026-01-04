"use client";

import React, { useEffect, useMemo } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";
import usePaymentSettingsStore from "@/store/paymentSettings.store";
import { useGetCurrencyAccounts, useGetCurrencyAccountByCurrency } from "@/api/currency/currency.queries";
import { useQueryClient } from "@tanstack/react-query";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";

interface PaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];
  const { selectedCurrency, setSelectedCurrency } = usePaymentSettingsStore();
  const queryClient = useQueryClient();
  const { accounts: currencyAccounts, isPending: accountsLoading } = useGetCurrencyAccounts();

  // Get NGN account from wallets
  const ngnWallet = wallets?.[0];
  
  // Get selected currency account (only for non-NGN currencies)
  const { account: selectedCurrencyAccount, isPending: accountLoading } = useGetCurrencyAccountByCurrency(
    selectedCurrency !== "NGN" ? selectedCurrency : ""
  );

  // Combine all available accounts
  const allAccounts = useMemo(() => {
    const accounts: Array<{
      currency: "NGN" | "USD" | "EUR" | "GBP";
      accountNumber: string;
      accountName: string;
      bankName: string;
      balance: number;
    }> = [];

    // Track which currencies we've already added to avoid duplicates
    const addedCurrencies = new Set<string>();

    // Add NGN account from wallet first (primary wallet)
    if (ngnWallet) {
      accounts.push({
        currency: "NGN",
        accountNumber: ngnWallet.accountNumber || "0000000000",
        accountName: ngnWallet.accountName || "NattyPay Account",
        bankName: ngnWallet.bankName || "NattyPay",
        balance: ngnWallet.balance || 0,
      });
      addedCurrencies.add("NGN");
    }

    // Add currency accounts from API (USD, EUR, GBP, and also NGN if not already added)
    // The API returns all accounts including NGN, so we need to handle all currencies
    if (Array.isArray(currencyAccounts) && currencyAccounts.length > 0) {
      currencyAccounts.forEach((acc: any) => {
        const currency = acc?.currency;
        if (currency && ["NGN", "USD", "EUR", "GBP"].includes(currency)) {
          // Skip NGN if we already added it from wallet (prefer wallet version)
          if (currency === "NGN" && addedCurrencies.has("NGN")) {
            return;
          }
          
          accounts.push({
            currency: currency as "NGN" | "USD" | "EUR" | "GBP",
            accountNumber: acc.accountNumber || acc.account_number || "0000000000",
            accountName: acc.accountName || acc.account_name || acc.label || `${currency} Account`,
            bankName: acc.bankName || acc.bank_name || "Graph Bank",
            balance: acc.balance || 0,
          });
          addedCurrencies.add(currency);
        }
      });
    }

    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('PaymentSettingsModal - allAccounts:', {
        ngnWallet: ngnWallet ? { currency: "NGN", accountNumber: ngnWallet.accountNumber } : null,
        currencyAccountsCount: currencyAccounts?.length || 0,
        currencyAccounts: currencyAccounts?.map((acc: any) => ({ 
          currency: acc?.currency, 
          accountNumber: acc?.accountNumber || acc?.account_number,
          accountName: acc?.accountName || acc?.account_name,
        })),
        finalAccountsCount: accounts.length,
        finalAccounts: accounts.map(acc => ({ currency: acc.currency, accountNumber: acc.accountNumber, accountName: acc.accountName })),
      });
    }

    return accounts;
  }, [ngnWallet, currencyAccounts]);

  // Get current account balance
  const currentBalance = useMemo(() => {
    if (selectedCurrency === "NGN") {
      return ngnWallet?.balance || 0;
    }
    return selectedCurrencyAccount?.balance || 0;
  }, [selectedCurrency, ngnWallet, selectedCurrencyAccount]);

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

  // Handle currency selection
  const handleCurrencySelect = (currency: "NGN" | "USD" | "EUR" | "GBP") => {
    setSelectedCurrency(currency);
    // Invalidate queries to refresh data for the new currency
    queryClient.invalidateQueries({ queryKey: ["currency-account-transactions", currency] });
    queryClient.invalidateQueries({ queryKey: ["currency-account-deposits", currency] });
    queryClient.invalidateQueries({ queryKey: ["currency-account-payouts", currency] });
    queryClient.invalidateQueries({ queryKey: ["banks", currency] });
    queryClient.invalidateQueries({ queryKey: ["currency-account", currency] });
  };

  // Auto-select NGN if no currency selected
  useEffect(() => {
    if (!selectedCurrency) {
      setSelectedCurrency("NGN");
    }
  }, [selectedCurrency, setSelectedCurrency]);

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>

      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-xl max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Payment Setting</h2>
          <p className="text-white/60 text-sm mt-1">Choose the currency account you'd like to use for payments</p>
        </div>

        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          {/* Show loading only when fetching currency accounts for the first time */}
          {accountsLoading && currencyAccounts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerLoader width={32} height={32} color="#D4B139" />
            </div>
          ) : (
            <>
              <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white text-sm divide-y divide-white/10">
                <div className="flex items-center justify-between py-2">
                  <p className="text-white/80">
                    Available Balance ({getCurrencySymbol(selectedCurrency)}{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </p>
                  <span className="w-4 h-4 rounded-full border-2 border-[#D4B139] inline-block"/>
                </div>
                {allAccounts.map((acc) => (
                  <label key={`${acc.currency}-${acc.accountNumber}`} className="flex items-center justify-between py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                        <span className="text-black font-bold">{acc.currency.slice(0, 1)}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-white text-sm font-medium">{acc.bankName} ({acc.currency})</p>
                        <p className="text-white/60 text-xs">{acc.accountNumber}</p>
                        <p className="text-white/50 text-xs mt-0.5">
                          {getCurrencySymbol(acc.currency)}{Number(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={selectedCurrency === acc.currency}
                      onChange={() => handleCurrencySelect(acc.currency)}
                      className="w-4 h-4 accent-[#D4B139]"
                    />
                  </label>
                ))}
                {allAccounts.length === 0 && (
                  <div className="py-4 text-center text-white/60 text-sm">
                    No accounts available
                  </div>
                )}
              </div>

              <div className="mt-4">
                <CustomButton 
                  type="button" 
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" 
                  onClick={() => {
                    // Invalidate queries to refresh data when closing modal
                    queryClient.invalidateQueries({ queryKey: ["currency-account-transactions", selectedCurrency] });
                    queryClient.invalidateQueries({ queryKey: ["currency-account-deposits", selectedCurrency] });
                    queryClient.invalidateQueries({ queryKey: ["currency-account-payouts", selectedCurrency] });
                    queryClient.invalidateQueries({ queryKey: ["banks", selectedCurrency] });
                    queryClient.invalidateQueries({ queryKey: ["currency-account", selectedCurrency] });
                    onClose();
                  }}
                >
                  Done
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsModal;
