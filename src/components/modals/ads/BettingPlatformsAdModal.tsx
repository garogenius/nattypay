"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiArrowRight, FiZap, FiShield, FiDollarSign } from "react-icons/fi";
import { SlTrophy } from "react-icons/sl";
import { useGetBettingPlatforms } from "@/api/betting/betting.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";

interface BettingPlatformsAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BettingPlatformsAdModal: React.FC<BettingPlatformsAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: platformsData, isLoading: platformsLoading } = useGetBettingPlatforms();
  const platforms = platformsData?.data?.data || [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto close after 25 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 25000);

      return () => clearTimeout(timer);
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

  if (!isOpen) return null;

  const features = [
    {
      icon: FiZap,
      title: "Instant Funding",
      description: "Fund your betting account instantly",
    },
    {
      icon: FiShield,
      title: "Secure Transactions",
      description: "Bank-level security for all bets",
    },
    {
      icon: FiDollarSign,
      title: "Easy Withdrawals",
      description: "Withdraw your winnings quickly",
    },
  ];

  // Popular platforms to show if API is loading or empty
  const defaultPlatforms = [
    { code: "BET9JA", name: "Bet9ja", enabled: true },
    { code: "SPORTYBET", name: "SportyBet", enabled: true },
  ];

  const displayPlatforms = platforms.length > 0 ? platforms : defaultPlatforms;

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
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4B139]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
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
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-[#D4B139] to-orange-500 mb-1.5 sm:mb-2 md:mb-3 animate-bounce">
              <SlTrophy className="text-lg sm:text-xl md:text-2xl lg:text-2xl text-white" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-1.5">
              Fund Your Betting Platforms! 🎲
            </h2>
            <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs lg:text-sm">
              Seamlessly fund your favorite betting platforms directly from NattyPay
            </p>
          </div>

          {/* Platforms List */}
          <div className="mb-2 sm:mb-3 md:mb-4">
            <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base mb-1.5 sm:mb-2 md:mb-3 text-center">Available Platforms</h3>
            {platformsLoading ? (
              <div className="flex items-center justify-center py-4 sm:py-6 md:py-8">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  <SpinnerLoader width={20} height={20} color="#D4B139" />
                </div>
                <span className="text-white/70 text-[10px] sm:text-xs md:text-sm ml-2 sm:ml-3">Loading platforms...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                {displayPlatforms
                  .filter((p: any) => p.enabled)
                  .slice(0, 4)
                  .map((platform: any, index: number) => (
                    <div
                      key={platform.code}
                      className="flex items-center gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                      }}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#D4B139] to-orange-500 flex items-center justify-center flex-shrink-0">
                        <SlTrophy className="text-base sm:text-lg md:text-xl text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base">
                          {platform.name}
                        </h4>
                        <p className="text-white/60 text-[9px] sm:text-[10px] md:text-xs">Ready to fund</p>
                      </div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                  }}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-[#D4B139]/20 flex items-center justify-center mb-1.5 sm:mb-2">
                    <Icon className="text-base sm:text-lg md:text-xl text-[#D4B139]" />
                  </div>
                  <h4 className="text-white font-semibold text-[10px] sm:text-xs md:text-sm mb-0.5 sm:mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-white/60 text-[9px] sm:text-[10px] md:text-xs">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-3 md:mb-4">
            {[
              { label: "Fast Transfer", icon: "⚡" },
              { label: "Low Fees", icon: "💰" },
              { label: "24/7 Support", icon: "🔄" },
              { label: "Multiple Platforms", icon: "🎯" },
            ].map((benefit, index) => (
              <div
                key={index}
                className="text-center p-2 sm:p-2.5 md:p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="text-lg sm:text-xl md:text-2xl mb-0.5 sm:mb-1">{benefit.icon}</div>
                <p className="text-white/80 text-[9px] sm:text-[10px] md:text-xs">{benefit.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 bg-[#D4B139] hover:bg-[#c7a42f] text-black text-[10px] sm:text-xs md:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1 sm:gap-1.5 mx-auto"
            >
              Start Betting Now
              <FiArrowRight className="text-[10px] sm:text-xs md:text-sm" />
            </button>
            <p className="text-white/50 text-[8px] sm:text-[9px] md:text-[10px] mt-1.5 sm:mt-2">
              Fund your betting account and start winning today!
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BettingPlatformsAdModal;


