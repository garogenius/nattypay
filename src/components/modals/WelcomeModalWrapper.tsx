'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const WelcomeModal = dynamic(
  () => import('./WelcomeModal').then((mod) => mod.default),
  { ssr: false }
);

export default function WelcomeModalWrapper() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if we've shown the welcome modal before
    const hasSeenWelcome = localStorage?.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage?.setItem('hasSeenWelcome', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
  };

  if (!isClient) return null;

  return <WelcomeModal isOpen={showWelcome} onClose={handleClose} />;
}
