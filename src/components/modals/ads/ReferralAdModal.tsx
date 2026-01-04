"use client";

import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiUsers, FiGift, FiArrowRight, FiShare2, FiCheckCircle } from "react-icons/fi";

interface ReferralAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const ReferralAdModal: React.FC<ReferralAdModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedBonus, setAnimatedBonus] = useState(0);
  const [animatedReferrals, setAnimatedReferrals] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      
      // Animate bonus amount
      const bonusInterval = setInterval(() => {
        setAnimatedBonus((prev) => {
          if (prev >= 4500) return 4500;
          return prev + 150;
        });
      }, 50);

      // Animate referral count
      const referralInterval = setInterval(() => {
        setAnimatedReferrals((prev) => {
          if (prev >= 3) return 3;
          return prev + 0.1;
        });
      }, 200);

      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 10000);

      return () => {
        clearTimeout(timer);
        clearInterval(bonusInterval);
        clearInterval(referralInterval);
      };
    } else {
      setIsVisible(false);
      setAnimatedBonus(0);
      setAnimatedReferrals(0);
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

  const steps = [
    {
      number: 1,
      title: "Share Your Referral Link",
      description: "Copy and share your unique referral code with friends",
      icon: FiShare2,
    },
    {
      number: 2,
      title: "Friends Sign Up",
      description: "Your friends register and verify their accounts",
      icon: FiUsers,
    },
    {
      number: 3,
      title: "Get Your Bonus",
      description: "Receive ₦4,500 when 3 friends complete registration",
      icon: FiGift,
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
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D4B139] to-green-500 mb-4 animate-bounce">
              <FiGift className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Refer & Earn ₦4,500! 🎁
            </h2>
            <p className="text-white/70 text-sm sm:text-base">
              Invite 3 friends and get rewarded instantly
            </p>
          </div>

          {/* Bonus Display */}
          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[#D4B139]/20 to-green-500/20 border border-[#D4B139]/30">
            <div className="text-center">
              <p className="text-white/70 text-sm mb-2">Your Referral Bonus</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  ₦{Math.floor(animatedBonus).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3">
                <FiUsers className="text-[#D4B139] text-lg" />
                <span className="text-white/80 text-sm">
                  For {Math.floor(animatedReferrals)} Referrals
                </span>
              </div>
              <p className="text-white/60 text-xs mt-2">₦1,500 per successful referral</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4 text-center">How It Works</h3>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: isVisible ? "fadeInUp 0.6s ease-out forwards" : "none",
                    }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4B139]/20 flex items-center justify-center font-bold text-[#D4B139]">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="text-[#D4B139] text-lg" />
                        <h4 className="text-white font-semibold text-sm sm:text-base">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-white/60 text-xs sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="absolute left-8 top-14 w-0.5 h-8 bg-[#D4B139]/30 ml-5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Instant Payout", icon: "⚡" },
              { label: "No Limits", icon: "♾️" },
              { label: "Easy Sharing", icon: "📱" },
              { label: "Track Progress", icon: "📊" },
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
              Start Referring Now
              <FiArrowRight />
            </button>
            <p className="text-white/50 text-xs mt-3">
              Share your referral code and start earning today!
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

export default ReferralAdModal;













