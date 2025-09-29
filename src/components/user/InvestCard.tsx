"use client";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const InvestCard = ({ amount = 0 }: { amount?: number }) => {
  const [isVisible, setIsVisible] = useState(true);

  const toggle = () => setIsVisible((v) => !v);

  return (
    <div className="bg-bg-600 dark:bg-bg-1100 rounded-xl px-4 py-7 2xs:py-8 flex items-center gap-4 sm:gap-6">
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">
        IV
      </div>
      <div className="flex flex-col gap-0 sm:gap-1 font-semibold">
        <div className="flex items-center gap-2">
          <p className="text-text-200 dark:text-text-800 text-base sm:text-lg ">Invest</p>
          {isVisible ? (
            <FiEyeOff onClick={toggle} className="cursor-pointer text-text-200 dark:text-text-800 text-lg" />
          ) : (
            <FiEye onClick={toggle} className="cursor-pointer text-text-200 dark:text-text-800 text-lg" />
          )}
        </div>
        <p className="text-text-400 text-2xl sm:text-3xl">
          {isVisible ? `₦ ${Number(amount || 0).toLocaleString()}` : "---"}
        </p>
      </div>
    </div>
  );
};

export default InvestCard;
