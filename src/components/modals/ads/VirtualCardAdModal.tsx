"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiWifi, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import images from "../../../../public/images";

interface VirtualCardAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const VirtualCardAdModal: React.FC<VirtualCardAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });
  const [cardCurrency, setCardCurrency] = useState<"USD" | "NGN">("USD");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto close after 25 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 25000);

      // Rotate between USD and NGN every 3 seconds
      const currencyTimer = setInterval(() => {
        setCardCurrency((prev) => (prev === "USD" ? "NGN" : "USD"));
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(currencyTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onComplete();
    }, 300);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setCardTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const cardGradient = "bg-gradient-to-br from-black via-gray-900 to-black";

  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl overflow-hidden transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl bg-[#D4B139]/30" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-[#D4B139]/30" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <CgClose className="text-xl text-white pointer-events-none" />
        </button>

        <div className="relative z-10 p-2.5 sm:p-3 md:p-4 lg:p-6">
          {/* Header */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-1.5">
              Get Your Free {cardCurrency} Virtual Card! 🎁
            </h2>
            <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs lg:text-sm">
              Create instant virtual cards for USD or NGN - No fees, instant activation
            </p>
          </div>

          {/* Animated Card */}
          <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
            <div
              className="relative w-full max-w-[200px] sm:max-w-xs md:max-w-sm transition-transform duration-300"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <div
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${cardGradient} p-2.5 sm:p-3 md:p-4 lg:p-5 h-32 sm:h-40 md:h-52 lg:h-60 border border-[#D4B139]/30 shadow-2xl transition-all duration-1000`}
              >
                {/* Swirling brand color lines pattern on the right */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <svg className="absolute right-0 top-0 w-3/5 h-full" viewBox="0 0 200 120" preserveAspectRatio="none">
                    <path
                      d="M0,20 Q50,10 100,30 T200,25 M0,50 Q50,40 100,60 T200,55 M0,80 Q50,70 100,90 T200,85"
                      stroke="#D4B139"
                      strokeWidth="0.5"
                      fill="none"
                      opacity="0.5"
                    />
                  </svg>
                </div>

                {/* Card shine effect with brand color */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4B139]/10 via-transparent to-transparent" />
                
                {/* Left gradient overlay with brand color */}
                <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#D4B139]/20 via-[#D4B139]/10 to-transparent pointer-events-none" />

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top row - SmartBank and Logo */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[#D4B139] text-[9px] sm:text-[10px] font-medium tracking-wide">SmartBank</span>
                      {/* Brand color Globe Icon */}
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#D4B139" strokeWidth="1" opacity="0.5" />
                          <circle cx="50" cy="50" r="35" fill="none" stroke="#D4B139" strokeWidth="0.5" opacity="0.3" />
                          <path d="M30,50 Q35,40 40,50 Q45,60 50,50" stroke="#D4B139" strokeWidth="1.5" fill="none" opacity="0.8" />
                          <path d="M50,50 Q55,40 60,50 Q65,60 70,50" stroke="#D4B139" strokeWidth="1.5" fill="none" opacity="0.8" />
                          <path d="M35,60 Q45,55 55,60 Q65,65 70,60" stroke="#D4B139" strokeWidth="1" fill="none" opacity="0.6" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Image alt="NattyPay" src={images.singleLogo} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full" />
                      <span className="text-[#D4B139] text-[9px] sm:text-[10px] md:text-xs font-bold tracking-wide uppercase">NATTYPAY</span>
                      <FiWifi className="text-[#D4B139] rotate-90 text-sm sm:text-base md:text-lg" />
                    </div>
                  </div>

                  {/* Chip and number */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg width="30" height="20" viewBox="0 0 54 40" className="sm:w-10 sm:h-7 md:w-[40px] md:h-[28px] drop-shadow flex-shrink-0" aria-hidden>
                      <rect x="1" y="1" rx="4" ry="4" width="52" height="38" fill="#D4B139" stroke="#c7a42f" strokeWidth="1" />
                      <path d="M14 1 v38 M40 1 v38 M1 20 h52" stroke="#c7a42f" strokeWidth="1" fill="none" />
                      <rect x="8" y="8" width="6" height="4" fill="#000" rx="0.5" />
                      <rect x="16" y="8" width="4" height="4" fill="#000" rx="0.5" />
                      <rect x="8" y="28" width="6" height="4" fill="#000" rx="0.5" />
                      <rect x="16" y="28" width="4" height="4" fill="#000" rx="0.5" />
                    </svg>
                    <p className="tracking-[0.15em] text-[#D4B139] text-xs sm:text-sm md:text-lg lg:text-xl font-semibold flex-1">
                      •••• •••• •••• 1234
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] text-[#D4B139]/70 uppercase mb-0.5">Card Holder</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs text-[#D4B139] font-semibold tracking-wide uppercase">YOUR NAME</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] sm:text-[9px] text-[#D4B139]/70 uppercase mb-0.5">Valid Thru</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs text-[#D4B139] font-semibold">12/28</span>
                    </div>
                  </div>

                  {/* Verve Logo at bottom right */}
                  <div className="absolute bottom-2 right-3 sm:bottom-3 sm:right-4">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[#EB001B] font-bold text-[8px] sm:text-[10px]">V</span>
                      </div>
                      <span className="text-[#D4B139] text-[8px] sm:text-[9px] font-semibold">Verve</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 md:p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#D4B139]/20 flex items-center justify-center flex-shrink-0">
                <FiWifi className="text-[#D4B139] text-xs sm:text-sm" />
              </div>
              <div>
                <p className="text-white text-[10px] sm:text-xs font-medium">Instant</p>
                <p className="text-white/60 text-[9px] sm:text-[10px]">Activation</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 md:p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#D4B139]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#D4B139] text-[10px] sm:text-xs font-bold">$</span>
              </div>
              <div>
                <p className="text-white text-[10px] sm:text-xs font-medium">Zero Fees</p>
                <p className="text-white/60 text-[9px] sm:text-[10px]">Free to create</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 md:p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#D4B139]/20 flex items-center justify-center flex-shrink-0">
                <FiArrowRight className="text-[#D4B139] text-xs sm:text-sm" />
              </div>
              <div>
                <p className="text-white text-[10px] sm:text-xs font-medium">Global Use</p>
                <p className="text-white/60 text-[9px] sm:text-[10px]">Worldwide</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-[#D4B139] hover:bg-[#c7a42f] text-black text-[10px] sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 mx-auto"
            >
              Create {cardCurrency} Card Now
              <FiArrowRight className="text-[10px] sm:text-xs md:text-sm" />
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.6;
            }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default VirtualCardAdModal;














