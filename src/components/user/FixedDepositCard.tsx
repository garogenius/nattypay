"use client";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { LiaPiggyBankSolid } from "react-icons/lia";

const FixedDepositCard = ({ amount = 0 }: { amount?: number }) => {
  const [visible, setVisible] = useState(true);
  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-4 flex flex-col gap-2 sm:gap-3">
      <div className="flex items-center gap-2 text-text-200 dark:text-text-800">
        <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
          <LiaPiggyBankSolid className="text-lg" />
        </div>
        <p className="text-sm sm:text-base font-semibold">Fixed Deposit</p>
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

export default FixedDepositCard;
