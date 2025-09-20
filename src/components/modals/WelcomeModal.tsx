"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import images from "../../../public/images";
import { textVariant, zoomIn } from "@/utils/motion";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black/80 dark:bg-black/60"></div>
        </div>
        <div className="mx-2.5 2xs:mx-4 relative bg-bg-600 dark:bg-bg-1100 px-4 xs:px-8 md:px-16 py-8 w-full max-w-4xl max-h-[90%] rounded-2xl ">
          <div
            className="absolute inset-20 opacity-60 dark:opacity-40"
            style={{
              background: `
                radial-gradient(
                  circle at center,
                  rgba(212, 177, 57, 0.4) 0%,
                  rgba(212, 177, 57, 0.2) 40%,
                  rgba(212, 177, 57, 0.1) 60%,
                  rgba(212, 177, 57, 0) 80%
                )
              `,
              filter: "blur(60px)",
              transform: "scale(1.1)",
            }}
          />
          <span
            onClick={onClose}
            className="absolute top-4 xs:top-6 right-4 xs:right-6 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
          >
            <CgClose className="text-xl text-text-200 dark:text-text-400" />
          </span>

          <div className="relative z-10">
            <motion.div
              variants={textVariant(0.2)}
              initial="hidden"
              animate="show"
              className="text-center mb-6"
            >
              <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-text-200 dark:text-white mb-4">
                Welcome to NattyPay! 🎉
              </h2>
              <p className="text-text-300 dark:text-text-400 text-sm xs:text-base md:text-lg">
                Thank you for visiting NattyPay. We're excited to have you here!
              </p>
            </motion.div>

            <motion.div
              variants={zoomIn(0.4, 0.5)}
              initial="hidden"
              animate="show"
              className="mt-8 mb-6"
            >
              <div className="bg-bg-700 dark:bg-bg-1000 p-6 rounded-xl border border-bg-500 dark:border-bg-900">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <Image
                      src={images.logo2}
                      alt="NattyPay Logo"
                      width={120}
                      height={60}
                      className="w-30 h-auto"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-text-200 dark:text-white mb-2">
                      Get Started with NattyPay
                    </h3>
                    <p className="text-sm text-text-300 dark:text-text-400 mb-4">
                      Join thousands of users who trust NattyPay for seamless payments and financial services.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      Continue to NattyPay
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-8 pt-6 border-t border-bg-500 dark:border-bg-900">
              <p className="text-xs text-text-400 dark:text-text-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeModal;

export const useWelcomeModal = () => {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
  };

  return { showWelcome, handleClose };
};
