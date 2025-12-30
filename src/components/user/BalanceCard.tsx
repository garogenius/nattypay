"use client";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import Image from "next/image";
import { useState } from "react";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const BalanceCard = ({
  currency,
  balance,
}: {
  currency: string;
  balance: number;
}) => {
  const [isBalanceVisible, setBalanceVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(
        `walletBalanceVisibility-${currency}`
      );
      return stored === null || stored === "true";
    }
    return true;
  });

  const toggleBalanceVisibility = () => {
    const newValue = !isBalanceVisible;
    setBalanceVisible(newValue);
    localStorage.setItem("walletBalanceVisibility", String(newValue));
  };

  // Dropdown (UI-only)
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>((currency || "ngn").toUpperCase());
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setOpen(false));

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4">
      {/* Header: currency icon + account label + chevron */}
      <div className="relative flex items-center gap-2 text-text-200 dark:text-text-800">
        <Image src={getCurrencyIconByString(currency) || ""} alt="currency" className="w-8 h-8" />
        <p className="text-sm sm:text-base font-semibold uppercase">{`${selected} Account`}</p>
        <MdKeyboardArrowDown onClick={() => setOpen((v) => !v)} className="ml-auto cursor-pointer" />

        {open && (
          <div ref={menuRef} className="absolute right-0 top-9 z-50 w-56 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-200 dark:text-text-800 font-semibold">Select Account</p>
              <MdClose onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>
            {[
              { k: "NGN", label: "NGN Account", flag: "🇳🇬" },
              { k: "GBP", label: "Pounds Account", flag: "🇬🇧" },
              { k: "USD", label: "USD Account", flag: "🇺🇸" },
              { k: "EUR", label: "Euro Account", flag: "🇪🇺" },
            ].map((opt, idx, arr) => (
              <button
                key={opt.k}
                onClick={() => {
                  setSelected(opt.k);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 py-2.5 ${idx !== arr.length - 1 ? "border-b border-border-800 dark:border-border-700" : ""}`}
              >
                <span className="text-lg">{opt.flag}</span>
                <span className="text-left text-text-200 dark:text-text-800 text-sm flex-1">{opt.label}</span>
                <span className={`w-3.5 h-3.5 rounded-full border ${selected === opt.k ? "bg-secondary border-secondary" : "border-border-800 dark:border-border-700"}`}></span>
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
          {isBalanceVisible ? `₦ ${balance?.toLocaleString() || 0.0}` : "---"}
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
