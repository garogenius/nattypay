"use client";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRef, useState } from "react";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { LiaPiggyBankSolid } from "react-icons/lia";
import useOnClickOutside from "@/hooks/useOnClickOutside";

const FixedSavingsCard = ({ amount = 0 }: { amount?: number }) => {
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [savingType, setSavingType] = useState<string>("Fixed Savings");
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setOpen(false));
  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-5 2xs:py-6 flex flex-col gap-3 sm:gap-4">
      <div className="relative flex items-center gap-2 text-text-200 dark:text-text-800">
        <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
          <LiaPiggyBankSolid className="text-lg" />
        </div>
        <p className="text-sm sm:text-base font-semibold">{savingType}</p>
        <MdKeyboardArrowDown onClick={() => setOpen((v) => !v)} className="ml-auto cursor-pointer" />

        {open && (
          <div ref={menuRef} className="absolute right-0 top-9 z-50 w-64 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-200 dark:text-text-800 font-semibold">Saving Types</p>
              <MdClose onClick={() => setOpen(false)} className="cursor-pointer" />
            </div>
            {[
              "Fixed Savings",
              "Target Savings",
              "Easylife Savings",
            ].map((label, idx, arr) => (
              <button
                key={label}
                onClick={() => {
                  setSavingType(label);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between py-2.5 ${idx !== arr.length - 1 ? "border-b border-border-800 dark:border-border-700" : ""}`}
              >
                <span className="text-left text-text-200 dark:text-text-800 text-sm">{label}</span>
                <span className={`w-3.5 h-3.5 rounded-full border ${savingType === label ? "bg-secondary border-secondary" : "border-border-800 dark:border-border-700"}`}></span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 font-semibold">
        <p className="text-text-200 dark:text-text-800 text-xs sm:text-sm">Total Interest Credited</p>
        {visible ? (
          <FiEyeOff onClick={() => setVisible(false)} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        ) : (
          <FiEye onClick={() => setVisible(true)} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        )}
      </div>
      <p className="text-text-400 text-2xl sm:text-3xl font-semibold">
        {visible ? `₦ ${Number(amount || 0).toLocaleString()}` : "---"}
      </p>
    </div>
  );
};

export default FixedSavingsCard;
