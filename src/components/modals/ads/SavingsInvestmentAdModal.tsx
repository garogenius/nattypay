"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiTrendingUp, FiTarget, FiDollarSign, FiArrowRight } from "react-icons/fi";
import { BsPiggyBank } from "react-icons/bs";

interface SavingsInvestmentAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SavingsInvestmentAdModal: React.FC<SavingsInvestmentAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      
      // Animate ROI percentage
      const interval = setInterval(() => {
        setAnimatedValue((prev) => {
          if (prev >= 15) return 0;
          return prev + 0.5;
        });
      }, 100);

      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      setIsVisible(false);
      setAnimatedValue(0);
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

  const savingsPlans = [
    {
      icon: BsPiggyBank,
      title: "Fixed Savings",
      description: "Lock your funds and earn guaranteed returns",
      roi: "Up to 12%",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FiTarget,
      title: "Target Savings",
      description: "Save towards specific goals with flexible plans",
      roi: "Up to 10%",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FiTrendingUp,
      title: "Investments",
      description: "Minimum ₦25M investment with 15% ROI",
      roi: "15% p.a.",
      color: "from-[#D4B139] to-[#c7a42f]",
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl overflow-y-auto transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4B139]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#D4B139] to-green-500 mb-3 sm:mb-4 animate-bounce">
              <FiTrendingUp className="text-2xl sm:text-2xl md:text-3xl text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Grow Your Wealth with NattyPay 💰
            </h2>
            <p className="text-white/70 text-xs sm:text-sm md:text-base">
              Smart savings and investment plans to help you achieve your financial goals
            </p>
          </div>

          {/* ROI Display */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-[#D4B139]/20 to-green-500/20 border border-[#D4B139]/30">
            <div className="text-center">
              <p className="text-white/70 text-xs sm:text-sm mb-2">Investment Returns</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  {animatedValue.toFixed(1)}%
                </span>
                <span className="text-white/70 text-xs sm:text-sm">per annum</span>
              </div>
              <p className="text-white/60 text-[10px] sm:text-xs mt-2">Competitive rates for smart investors</p>
            </div>
          </div>

          {/* Savings Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {savingsPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={index}
                  className="relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden group"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                      <Icon className="text-2xl text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                      {plan.title}
                    </h3>
                    <p className="text-white/60 text-xs mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-1">
                      <FiDollarSign className="text-[#D4B139] text-sm" />
                      <span className="text-[#D4B139] font-bold text-sm">{plan.roi}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              { label: "Flexible Plans", icon: "📅" },
              { label: "High Returns", icon: "📈" },
              { label: "Secure", icon: "🔒" },
              { label: "Easy Access", icon: "💳" },
            ].map((benefit, index) => (
              <div
                key={index}
                className="text-center p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="text-2xl mb-1">{benefit.icon}</div>
                <p className="text-white/80 text-xs">{benefit.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              Start Saving Now
              <FiArrowRight />
            </button>
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

export default SavingsInvestmentAdModal;



