'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const DownloadPopupModal = dynamic(
  () => import('./modals/DownloadPopupModal'),
  { ssr: false }
);

export default function ClientOnlyWelcome() {
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const hasSeenPopup = localStorage?.getItem('hasSeenDownloadPopup');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowModal(true);
        localStorage?.setItem('hasSeenDownloadPopup', 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted) return null;

  return <DownloadPopupModal isOpen={showModal} onClose={() => setShowModal(false)} />;
}
