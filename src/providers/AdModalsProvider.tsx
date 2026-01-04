"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useUserStore from "@/store/user.store";
import {
  getNextAdModal,
  markModalAsShown,
  resetAdModalState,
  MODAL_DISPLAY_DURATION,
  MODAL_INTERVAL,
  type AdModalType,
} from "@/services/adModals.service";
import WelcomeAdModal from "@/components/modals/ads/WelcomeAdModal";
import VirtualCardAdModal from "@/components/modals/ads/VirtualCardAdModal";
import SavingsInvestmentAdModal from "@/components/modals/ads/SavingsInvestmentAdModal";
import ReferralAdModal from "@/components/modals/ads/ReferralAdModal";
import BettingPlatformsAdModal from "@/components/modals/ads/BettingPlatformsAdModal";

const AdModalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useUserStore();
  const pathname = usePathname();
  const [currentModal, setCurrentModal] = useState<AdModalType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timeout | null>(null);

  // Check if user is on a protected route (logged in area)
  const isProtectedRoute = pathname?.startsWith("/user") || pathname?.startsWith("/dashboard");

  useEffect(() => {
    // Only show modals if user is logged in and on a protected route
    if (!isLoggedIn || !user || !isProtectedRoute) {
      return;
    }

    // Don't check if a modal is already open
    if (isModalOpen) {
      return;
    }

    // Reset state for new user session (first time login)
    const checkAndShowModal = () => {
      // Don't show if a modal is already open
      if (isModalOpen) {
        return;
      }

      const nextModal = getNextAdModal();
      if (nextModal) {
        setCurrentModal(nextModal);
        setIsModalOpen(true);
      }
    };

    // Small delay to ensure user is fully loaded
    const initialTimer = setTimeout(() => {
      checkAndShowModal();
    }, 2000);

    // Set up interval to check for next modal every 8 minutes
    const timer = setInterval(() => {
      checkAndShowModal();
    }, MODAL_INTERVAL);

    setIntervalTimer(timer);

    return () => {
      clearTimeout(initialTimer);
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isLoggedIn, user, isProtectedRoute, pathname, isModalOpen]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalComplete = () => {
    if (currentModal) {
      markModalAsShown(currentModal);
      setCurrentModal(null);
    }
  };

  // Reset modal state when user logs out
  useEffect(() => {
    if (!isLoggedIn) {
      resetAdModalState();
      setCurrentModal(null);
      setIsModalOpen(false);
      if (intervalTimer) {
        clearInterval(intervalTimer);
        setIntervalTimer(null);
      }
    }
  }, [isLoggedIn, intervalTimer]);

  return (
    <>
      {children}
      {currentModal === "welcome" && (
        <WelcomeAdModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
      {currentModal === "virtual-card" && (
        <VirtualCardAdModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
      {currentModal === "savings-investment" && (
        <SavingsInvestmentAdModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
      {currentModal === "referral" && (
        <ReferralAdModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
      {currentModal === "betting-platforms" && (
        <BettingPlatformsAdModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
    </>
  );
};

export default AdModalsProvider;

