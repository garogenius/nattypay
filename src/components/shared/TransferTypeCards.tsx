"use client";

import React from "react";
import Image from "next/image";
import images from "../../../public/images";

export type TransferTypeKey = "nattypay" | "bank" | "merchant";

export interface TransferTypeItem {
  key: TransferTypeKey;
  title: string;
  desc: string;
}

interface TransferTypeCardsProps {
  items: TransferTypeItem[];
  value: TransferTypeKey;
  onChange: (key: TransferTypeKey) => void;
  className?: string;
}

const TransferTypeCards: React.FC<TransferTypeCardsProps> = ({ items, value, onChange, className }) => {
  return (
    <div className={`grid grid-cols-3 gap-2 sm:gap-4 ${className || ""}`}>
      {items.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          type="button"
          className={`text-left rounded-xl sm:rounded-2xl border px-2 py-3 sm:px-4 sm:py-5 transition-colors ${
            value === opt.key
              ? "border-[#D4B139] bg:white/5 sm:bg-white/5"
              : "border-[#2C3947] bg-transparent hover:bg-white/5"
          }`}
        >
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/10 grid place-items-center mb-2 sm:mb-3">
            <Image src={images.singleLogo} alt="logo" className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <p className="text-white font-medium text-[11px] sm:text-base leading-tight">{opt.title}</p>
          <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1 leading-snug">{opt.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default TransferTypeCards;
