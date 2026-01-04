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
  const [cardCurrency, setCardCurrency] = useState<"USD" | "EUR">("USD");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto close after 25 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 25000);

      // Rotate between USD and EUR every 3 seconds
      const currencyTimer = setInterval(() => {
        setCardCurrency((prev) => (prev === "USD" ? "EUR" : "USD"));
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

  const cardGradient = cardCurrency === "USD" 
    ? "bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600"
    : "bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600";

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
          <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000 ${
            cardCurrency === "USD" ? "bg-blue-500/30" : "bg-purple-500/30"
          }`} />
          <div className={`absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000 ${
            cardCurrency === "USD" ? "bg-indigo-500/30" : "bg-pink-500/30"
          }`} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="relative z-10 p-2.5 sm:p-3 md:p-4 lg:p-6">
          {/* Header */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-1.5">
              Get Your Free {cardCurrency} Virtual Card! 🎁
            </h2>
            <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs lg:text-sm">
              Create instant virtual cards for USD or EUR - No fees, instant activation
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
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${cardGradient} p-2.5 sm:p-3 md:p-4 lg:p-5 h-32 sm:h-40 md:h-52 lg:h-60 border border-white/20 shadow-2xl transition-all duration-1000`}
              >
                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
                
                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full animate-float"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 3) * 20}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${3 + (i % 2)}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Card content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Image alt="NattyPay" src={images.singleLogo} className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full" />
                      <span className="text-white/95 text-[10px] sm:text-xs md:text-sm font-semibold tracking-wide">NattyPay</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FiWifi className="text-white/90 rotate-90 text-sm sm:text-base md:text-lg" />
                      {cardCurrency === "USD" ? (
                        <div className="text-white font-bold text-[10px] sm:text-xs md:text-sm">USD</div>
                      ) : (
                        <div className="text-white font-bold text-[10px] sm:text-xs md:text-sm">EUR</div>
                      )}
                    </div>
                  </div>

                  {/* Chip and number */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <svg width="30" height="20" viewBox="0 0 54 40" className="sm:w-10 sm:h-7 md:w-[40px] md:h-[28px] drop-shadow" aria-hidden>
                      <rect x="1" y="1" rx="6" ry="6" width="52" height="38" fill="#d9d9d9" stroke="#b5b5b5" />
                      <path d="M14 1 v38 M40 1 v38 M1 20 h52" stroke="#b5b5b5" strokeWidth="1" fill="none" />
                    </svg>
                    <p className="tracking-widest text-white text-xs sm:text-sm md:text-lg lg:text-xl font-semibold">
                      •••• •••• •••• 1234
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[10px] text-white/70 uppercase">Card Holder</span>
                      <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white font-medium tracking-wide">YOUR NAME</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] sm:text-[10px] text-white/70 uppercase">Valid Thru</span>
                      <span className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white font-medium">12/28</span>
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














