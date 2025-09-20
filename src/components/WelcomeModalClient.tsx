'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const WelcomeModal = dynamic(
  () => import('./modals/WelcomeModal'),
  { ssr: false }
);

export default function WelcomeModalClient() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if we've shown the welcome modal before
    const hasSeenWelcome = typeof window !== 'undefined' && localStorage?.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
        localStorage?.setItem('hasSeenWelcome', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isClient) return null;

  return <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />;
}
