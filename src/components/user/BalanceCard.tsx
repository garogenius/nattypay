"use client";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { Wallet } from "@/constants/types";
import { ICurrencyAccount } from "@/api/currency/currency.types";

interface AccountOption {
  currency: string;
  balance: number;
  label: string;
  type: "wallet" | "currencyAccount";
}

const getCurrencySymbol = (currency: string): string => {
  const upper = currency.toUpperCase();
  switch (upper) {
    case "NGN":
      return "₦";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    default:
      return "₦";
  }
};

const BalanceCard = ({
  wallets = [],
  currencyAccounts = [],
}: {
  wallets?: Wallet[];
  currencyAccounts?: ICurrencyAccount[];
}) => {
  // Combine wallets and currency accounts into account options
  const accountOptions: AccountOption[] = useMemo(() => {
    const options: AccountOption[] = [];
    
    // Add wallets (NGN accounts)
    wallets.forEach((wallet) => {
      options.push({
        currency: wallet.currency.toUpperCase(),
        balance: wallet.balance || 0,
        label: `${wallet.currency.toUpperCase()} Account`,
        type: "wallet",
      });
    });
    
    // Add currency accounts (USD, EUR, GBP)
    currencyAccounts.forEach((account) => {
      options.push({
        currency: (account.currency || "").toUpperCase(),
        balance: account.balance || 0,
        label: account.label || `${account.currency?.toUpperCase()} Account`,
        type: "currencyAccount",
      });
    });
    
    return options;
  }, [wallets, currencyAccounts]);

  // Get initial selected account (first available)
  const initialAccount = accountOptions[0];
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(initialAccount || null);

  // Update selected account when options change
  useEffect(() => {
    if (accountOptions.length > 0 && !selectedAccount) {
      setSelectedAccount(accountOptions[0]);
    } else if (selectedAccount && accountOptions.length > 0) {
      // Update balance if account still exists
      const updated = accountOptions.find(
        (opt) => opt.currency === selectedAccount.currency && opt.type === selectedAccount.type
      );
      if (updated) {
        setSelectedAccount(updated);
      }
    }
  }, [accountOptions, selectedAccount]);

  const currentCurrency = selectedAccount?.currency.toLowerCase() || "ngn";
  const currentBalance = selectedAccount?.balance || 0;

  const [isBalanceVisible, setBalanceVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(
        `walletBalanceVisibility-${currentCurrency}`
      );
      return stored === null || stored === "true";
    }
    return true;
  });

  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceVisible;
    setBalanceVisible(newValue);
    localStorage.setItem(`walletBalanceVisibility-${currentCurrency}`, String(newValue));
  };

  // Dropdown
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setOpen(false));

  const currencySymbol = getCurrencySymbol(currentCurrency);

  const getCurrencyFlag = (currency: string): string => {
    const upper = currency.toUpperCase();
    switch (upper) {
      case "NGN":
        return "🇳🇬";
      case "GBP":
        return "🇬🇧";
      case "USD":
        return "🇺🇸";
      case "EUR":
        return "🇪🇺";
      default:
        return "💰";
    }
  };

  if (accountOptions.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4">
      {/* Header: currency icon + account label + chevron */}
      <div className="relative flex items-center gap-2 text-text-200 dark:text-text-800">
        <Image 
          src={getCurrencyIconByString(currentCurrency) || ""} 
          alt="currency" 
          className="w-8 h-8" 
        />
        <p className="text-sm sm:text-base font-semibold uppercase">
          {selectedAccount?.label || `${currentCurrency.toUpperCase()} Account`}
        </p>
        {accountOptions.length > 1 && (
          <MdKeyboardArrowDown 
            onClick={() => setOpen((v) => !v)} 
            className="ml-auto cursor-pointer" 
          />
        )}

        {open && accountOptions.length > 1 && (
          <div ref={menuRef} className="absolute right-0 top-9 z-50 w-56 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-200 dark:text-text-800 font-semibold">Select Account</p>
              <MdClose onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>
            {accountOptions.map((opt, idx, arr) => (
              <button
                key={`${opt.type}-${opt.currency}-${idx}`}
                onClick={() => {
                  setSelectedAccount(opt);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 py-2.5 ${idx !== arr.length - 1 ? "border-b border-border-800 dark:border-border-700" : ""}`}
              >
                <span className="text-lg">{getCurrencyFlag(opt.currency)}</span>
                <span className="text-left text-text-200 dark:text-text-800 text-sm flex-1">{opt.label}</span>
                <span className={`w-3.5 h-3.5 rounded-full border ${
                  selectedAccount?.currency === opt.currency && selectedAccount?.type === opt.type
                    ? "bg-secondary border-secondary" 
                    : "border-border-800 dark:border-border-700"
                }`}></span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtitle + eye toggle */}
      <div className="flex items-center gap-2 font-semibold">
        <p className="text-text-200 dark:text-text-800 text-xs sm:text-sm">Main Balance</p>
        {isBalanceVisible ? (
          <FiEyeOff onClick={toggleBalanceVisibility} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        ) : (
          <FiEye onClick={toggleBalanceVisibility} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        )}
      </div>

      {/* Amount + yellow action */}
      <div className="flex items-center justify-between">
        <p className="text-text-400 text-2xl sm:text-3xl font-semibold">
          {isBalanceVisible 
            ? `${currencySymbol} ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : "---"}
        </p>
        <button
          type="button"
          aria-label="add"
          className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary text-black font-bold grid place-items-center"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;
