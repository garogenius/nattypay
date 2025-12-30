"use client";

import React from "react";
import { FiWifi } from "react-icons/fi";
import Image from "next/image";
import images from "../../../../public/images";

interface CardPreviewProps {
  cardholder?: string;
  maskedNumber?: string; // e.g., •••• •••• •••• 1234
  expiry?: string; // MM/YY
  brand?: "visa" | "mastercard" | "verve";
  variant?: "gold" | "dark" | "light";
  issuerName?: string;
  status?: "active" | "frozen";
  isVirtual?: boolean;
  className?: string;
}

const schemeLogo = (brand: CardPreviewProps["brand"]) => {
  if (brand === "visa")
    return (
      <svg viewBox="0 0 48 16" className="h-4 fill-white/90" aria-hidden>
        <path d="M17.6 15.5L20.1.7h3.7l-2.5 14.8h-3.7zm17.8-9.5c-.7-.3-1.7-.6-3-.6-3.3 0-5.6 1.8-5.6 4.3 0 1.9 1.6 3 2.8 3.7 1.2.6 1.6 1 1.6 1.5 0 .8-1 1.2-1.9 1.2-1.3 0-2-.2-3.1-.7l-.4-.2-.5 3c.8.3 2.4.6 4 .6 3.8 0 6.3-1.8 6.3-4.5 0-1.5-1-2.7-2.7-3.7-1.1-.6-1.8-1-1.8-1.6 0-.5.6-1 1.9-1 1.1 0 1.8.2 2.4.5l.3.1.5-2.9zM31.6.7l-2.9 14.8h3.5l2.9-14.8h-3.5zM13.7.7L9.9 10.6 8.3 2.9C7.9 1.4 6.7.7 5.2.7H.1L0 1.1C3.1 1.8 5.5 3.1 6.6 6l3.1 9.5h3.9L18 .7h-4.3z"/>
      </svg>
    );
  if (brand === "mastercard")
    return (
      <svg viewBox="0 0 48 16" className="h-4" aria-hidden>
        <circle cx="19" cy="8" r="6" fill="#EB001B" />
        <circle cx="29" cy="8" r="6" fill="#F79E1B" />
      </svg>
    );
  if (brand === "verve")
    return (
      <svg viewBox="0 0 48 16" className="h-4" aria-hidden>
        <rect x="10" y="2" width="28" height="12" rx="2" fill="#0A4" />
        <circle cx="18" cy="8" r="3" fill="#fff" />
      </svg>
    );
  return null;
};

const CardPreview: React.FC<CardPreviewProps> = ({
  cardholder = "JOHN DOE",
  maskedNumber = "•••• •••• •••• 1234",
  expiry = "07/28",
  brand = "mastercard",
  variant = "gold",
  issuerName = "NattyPay",
  status = "active",
  className = "",
}) => {
  const base =
    variant === "gold"
      ? "bg-gradient-to-br from-[#D4B139] via-[#C39A29] to-[#6E5A1E]"
      : variant === "dark"
      ? "bg-gradient-to-br from-[#151A24] to-[#0C111A]"
      : "bg-gradient-to-br from-[#24303F] to-[#1A2433]";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${base} p-4 sm:p-5 h-44 sm:h-48 border border-white/10 ${className}`}>
      {/* subtle texture */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 2px, transparent 2px, transparent 8px)"}} />
      {/* left dark gradient overlay for depth */}
      <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/45 via-black/25 to-transparent pointer-events-none" />

      {/* top row */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {/* Issuer */}
          <Image alt="issuer" src={images.singleLogo} className="w-6 h-6 rounded-full" />
          <span className="text-white/95 text-xs sm:text-sm font-semibold tracking-wide">{issuerName}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Contactless */}
          <FiWifi className="text-white/90 rotate-90 text-lg" />
          {/* Brand Logo */}
          {schemeLogo(brand)}
        </div>
      </div>

      {/* chip + number */}
      <div className="relative z-10 mt-6 flex items-center gap-3">
        <svg width="40" height="28" viewBox="0 0 54 40" className="drop-shadow" aria-hidden>
          <rect x="1" y="1" rx="6" ry="6" width="52" height="38" fill="#d9d9d9" stroke="#b5b5b5" />
          <path d="M14 1 v38 M40 1 v38 M1 20 h52" stroke="#b5b5b5" strokeWidth="1" fill="none" />
        </svg>
        <p className="tracking-widest text-white text-lg sm:text-xl font-semibold">{maskedNumber}</p>
      </div>

      {/* bottom row */}
      <div className="relative z-10 mt-6 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-white/70 uppercase">Card Holder</span>
          <span className="text-sm sm:text-base text-white font-medium tracking-wide">{cardholder}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-white/70 uppercase">Valid Thru</span>
          <span className="text-sm sm:text-base text-white font-medium">{expiry}</span>
        </div>
      </div>

      {/* status badge */}
      <div className={`absolute bottom-3 left-4 z-10 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${status === 'frozen' ? 'bg-white/15 text-white' : 'bg-black/25 text-white'}`}>
        {status === 'frozen' ? 'Frozen' : 'Active'}
      </div>
    </div>
  );
};

export default CardPreview;
