"use client";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdOutlineStackedBarChart } from "react-icons/md";

const InvestCard = ({ amount = 0 }: { amount?: number }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggle = () => setIsVisible((v) => !v);

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-4 flex flex-col gap-2 sm:gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-text-200 dark:text-text-800">
        <div className="w-8 h-8 rounded-md bg-secondary/15 grid place-items-center text-secondary">
          <MdOutlineStackedBarChart className="text-lg" />
        </div>
        <p className="text-sm sm:text-base font-semibold">Investment</p>
      </div>

      {/* Subtitle + eye toggle */}
      <div className="flex items-center gap-2 font-semibold">
        <p className="text-text-200 dark:text-text-800 text-xs sm:text-sm">Total Interest Credited</p>
        {isVisible ? (
          <FiEyeOff onClick={toggle} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        ) : (
          <FiEye onClick={toggle} className="cursor-pointer text-text-200 dark:text-text-800 text-base" />
        )}
      </div>

      {/* Amount */}
      <p className="text-text-400 text-2xl sm:text-3xl font-semibold">
        {isVisible ? `₦ ${Number(amount || 0).toLocaleString()}` : "---"}
      </p>
    </div>
  );
};

export default InvestCard;
