"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiGlobe, FiSend, FiCreditCard, FiTrendingUp, FiShield } from "react-icons/fi";

interface WelcomeAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const WelcomeAdModal: React.FC<WelcomeAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

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
      icon: FiGlobe,
      title: "Global Transactions",
      description: "Send and receive money worldwide with ease",
    },
    {
      icon: FiSend,
      title: "Instant Transfers",
      description: "Transfer funds instantly to any account",
    },
    {
      icon: FiCreditCard,
      title: "Virtual Cards",
      description: "Create USD, EUR, and GBP virtual cards instantly",
    },
    {
      icon: FiTrendingUp,
      title: "Investments",
      description: "Grow your wealth with smart investment options",
    },
    {
      icon: FiShield,
      title: "Secure Banking",
      description: "Bank-level security for all your transactions",
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
        className={`relative w-full max-w-2xl bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl overflow-hidden transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4B139]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4B139]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4B139]/20 mb-4 animate-bounce">
              <FiGlobe className="text-3xl text-[#D4B139]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to NattyPay! 🎉
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Your gateway to seamless global banking and financial services
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                  }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#D4B139]/20 flex items-center justify-center">
                    <Icon className="text-xl text-[#D4B139]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold rounded-lg transition-colors"
            >
              Get Started
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

export default WelcomeAdModal;












