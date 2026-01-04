"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CgClose } from "react-icons/cg";
import { FiSend, FiCreditCard, FiTrendingUp, FiShield, FiZap } from "react-icons/fi";
import Image from "next/image";
import images from "../../../../public/images";

interface WelcomeAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const WelcomeAdModal: React.FC<WelcomeAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      onComplete();
    }, 300);
  }, [onClose, onComplete]);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsVisible(true), 50);
      
      // Auto close after 25 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 25000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const features = [
    {
      icon: FiZap,
      title: "Lightning Fast",
      description: "Instant transactions and real-time processing",
    },
    {
      icon: FiSend,
      title: "Global Transfers",
      description: "Send money worldwide in multiple currencies",
    },
    {
      icon: FiCreditCard,
      title: "Virtual Cards",
      description: "Create USD, EUR, and GBP cards instantly",
    },
    {
      icon: FiTrendingUp,
      title: "Smart Investments",
      description: "Grow your wealth with competitive returns",
    },
    {
      icon: FiShield,
      title: "Bank-Level Security",
      description: "Your funds are protected with advanced encryption",
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
        className={`relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl overflow-hidden transform transition-all duration-500 ${
          isVisible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced animated background gradient */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#D4B139]/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4B139]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4B139]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#D4B139]/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <CgClose className="text-xl text-white" />
        </button>

        <div className="relative z-10 p-2.5 sm:p-3 md:p-4 lg:p-6">
          {/* Header with animated logo */}
          <div className="text-center mb-2 sm:mb-3 md:mb-4">
            <div className="relative inline-block mb-2 sm:mb-3">
              {/* Glowing ring animation */}
              <div className="absolute inset-0 rounded-full bg-[#D4B139]/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 rounded-full bg-[#D4B139]/10 animate-pulse" />
              
              {/* Logo container with rotation */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto animate-spin-slow">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4B139] to-[#c7a42f] p-0.5 sm:p-1">
                  <div className="w-full h-full rounded-full bg-bg-600 dark:bg-bg-1100 flex items-center justify-center">
                    <Image
                      src={images.singleLogo}
                      alt="NattyPay"
                      width={80}
                      height={80}
                      className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain animate-pulse"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Animated title */}
            <h2 
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-1.5 bg-gradient-to-r from-[#D4B139] via-white to-[#D4B139] bg-clip-text text-transparent animate-gradient"
              style={{
                animation: "gradient 3s ease infinite",
                backgroundSize: "200% auto",
              }}
            >
              Welcome to NattyPay! 🎉
            </h2>
            <p className="text-white/70 text-[9px] sm:text-[10px] md:text-xs lg:text-sm animate-fadeIn">
              Your gateway to seamless global banking and financial services
            </p>
          </div>

          {/* Features Grid with enhanced animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group flex items-start gap-2 sm:gap-2.5 md:gap-3 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#D4B139]/50 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-[#D4B139]/20"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isVisible ? "fadeInUp 0.8s ease-out forwards" : "none",
                    opacity: isVisible ? 0 : 0,
                  }}
                >
                  {/* Animated icon container */}
                  <div className="flex-shrink-0 relative">
                    <div className="absolute inset-0 rounded-lg bg-[#D4B139]/30 blur-md group-hover:blur-lg transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    <div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#D4B139]/30 to-[#D4B139]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="text-base sm:text-lg md:text-xl text-[#D4B139] group-hover:animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base mb-0.5 sm:mb-1 group-hover:text-[#D4B139] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-[9px] sm:text-[10px] md:text-xs lg:text-sm group-hover:text-white/80 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer pointer-events-none" />
                </div>
              );
            })}
          </div>

          {/* Enhanced CTA with animations */}
          <div className="text-center">
            <button
              onClick={handleClose}
              className="relative px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 bg-gradient-to-r from-[#D4B139] to-[#c7a42f] hover:from-[#c7a42f] hover:to-[#D4B139] text-black text-[10px] sm:text-xs md:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-[#D4B139]/50 overflow-hidden group"
              style={{
                animationDelay: "800ms",
                animation: isVisible ? "fadeInUp 0.8s ease-out forwards" : "none",
                opacity: isVisible ? 0 : 0,
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {/* Button text */}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                Get Started
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
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
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes gradient {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
              opacity: 0.4;
            }
            50% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.8;
            }
          }
          
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @keyframes bounce-x {
            0%, 100% {
              transform: translateX(0);
            }
            50% {
              transform: translateX(5px);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .animate-gradient {
            animation: gradient 3s ease infinite;
            background-size: 200% auto;
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          
          .animate-bounce-x {
            animation: bounce-x 1s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
};

export default WelcomeAdModal;














