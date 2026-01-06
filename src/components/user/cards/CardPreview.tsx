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
  currency?: "USD" | "NGN" | "EUR" | "GBP";
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
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
          <span className="text-[#EB001B] font-bold text-xs">V</span>
        </div>
        <span className="text-white text-xs font-semibold">Verve</span>
      </div>
    );
  return null;
};

const CardPreview: React.FC<CardPreviewProps> = ({
  cardholder = "JOHN DOE",
  maskedNumber = "7864 5678 2004 5979 243",
  expiry = "04/22",
  brand = "verve",
  variant = "gold",
  issuerName = "NATTYPAY",
  status = "active",
  isVirtual = false,
  className = "",
  currency,
}) => {
  // Golden-brown gradient matching the design
  const base =
    variant === "gold"
      ? "bg-gradient-to-br from-[#8B6914] via-[#A67C1A] to-[#6E5A1E]"
      : variant === "dark"
      ? "bg-gradient-to-br from-[#151A24] to-[#0C111A]"
      : "bg-gradient-to-br from-[#24303F] to-[#1A2433]";

  return (
    <div className={`relative overflow-hidden rounded-2xl ${base} p-4 sm:p-5 h-44 sm:h-48 border border-white/10 shadow-2xl ${className}`}>
      {/* Swirling white lines pattern on the right */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="absolute right-0 top-0 w-3/5 h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
          <path
            d="M0,20 Q50,10 100,30 T200,25 M0,50 Q50,40 100,60 T200,55 M0,80 Q50,70 100,90 T200,85"
            stroke="white"
            strokeWidth="0.5"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 2px, transparent 2px, transparent 8px)"}} 
      />

      {/* Left dark gradient overlay for depth */}
      <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/30 via-black/15 to-transparent pointer-events-none" />

      {/* Top row - SmartBank and Logo */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-white text-[10px] sm:text-xs font-medium tracking-wide">SmartBank</span>
          {/* Golden Globe Icon */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#D4B139" strokeWidth="1" opacity="0.3" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#D4B139" strokeWidth="0.5" opacity="0.2" />
              {/* Simplified globe continents */}
              <path d="M30,50 Q35,40 40,50 Q45,60 50,50" stroke="#D4B139" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M50,50 Q55,40 60,50 Q65,60 70,50" stroke="#D4B139" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M35,60 Q45,55 55,60 Q65,65 70,60" stroke="#D4B139" strokeWidth="1" fill="none" opacity="0.4" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* NattyPay Logo */}
          <div className="flex items-center gap-1.5">
            <Image alt="NattyPay" src={images.singleLogo} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
            <span className="text-white/95 text-[10px] sm:text-xs font-bold tracking-wide uppercase">{issuerName}</span>
          </div>
          {/* Contactless symbol */}
          <FiWifi className="text-white/90 rotate-90 text-base sm:text-lg" />
        </div>
      </div>

      {/* Chip and number */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        {/* EMV Chip */}
        <svg width="40" height="28" viewBox="0 0 54 40" className="drop-shadow flex-shrink-0" aria-hidden>
          <rect x="1" y="1" rx="4" ry="4" width="52" height="38" fill="#d9d9d9" stroke="#b5b5b5" strokeWidth="1" />
          <path d="M14 1 v38 M40 1 v38 M1 20 h52" stroke="#b5b5b5" strokeWidth="1" fill="none" />
          {/* Chip circuit pattern */}
          <rect x="8" y="8" width="6" height="4" fill="#999" rx="0.5" />
          <rect x="16" y="8" width="4" height="4" fill="#999" rx="0.5" />
          <rect x="8" y="28" width="6" height="4" fill="#999" rx="0.5" />
          <rect x="16" y="28" width="4" height="4" fill="#999" rx="0.5" />
        </svg>
        <p className="tracking-[0.15em] text-white text-base sm:text-lg font-semibold flex-1">{maskedNumber}</p>
      </div>

      {/* Bottom row - Cardholder and Expiry */}
      <div className="relative z-10 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-white/70 uppercase mb-0.5">Card Holder</span>
          <span className="text-xs sm:text-sm text-white font-semibold tracking-wide uppercase">{cardholder}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] sm:text-[10px] text-white/70 uppercase mb-0.5">Valid Thru</span>
          <span className="text-xs sm:text-sm text-white font-semibold">{expiry}</span>
        </div>
      </div>

      {/* Verve Logo at bottom right */}
      <div className="absolute bottom-3 right-4 z-10">
        {schemeLogo(brand)}
      </div>

      {/* Currency badge if provided */}
      {currency && (
        <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-white text-[10px] font-semibold">{currency}</span>
        </div>
      )}

      {/* Status badge */}
      <div className={`absolute bottom-3 left-4 z-10 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-semibold ${
        status === 'frozen' 
          ? 'bg-white/20 text-white border border-white/30' 
          : 'bg-black/30 text-white border border-white/20'
      }`}>
        {status === 'frozen' ? 'Frozen' : 'Active'}
      </div>
    </div>
  );
};

export default CardPreview;

