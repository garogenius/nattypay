"use client";

import { useEffect, useState } from "react";
import ClipboardAccountModal from "@/components/modals/ClipboardAccountModal";

export const useClipboardDetection = () => {
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text") || "";
      
      // Check if pasted text looks like an account number (10 digits)
      const accountNumberPattern = /^\d{10}$/;
      if (accountNumberPattern.test(pastedText.trim())) {
        setCopiedAccountNumber(pastedText.trim());
        setIsModalOpen(true);
      }
    };

    const handleCopy = () => {
      // Check clipboard after a short delay
      setTimeout(async () => {
        try {
          const text = await navigator.clipboard.readText();
          const accountNumberPattern = /^\d{10}$/;
          if (accountNumberPattern.test(text.trim())) {
            setCopiedAccountNumber(text.trim());
            setIsModalOpen(true);
          }
        } catch (err) {
          // Clipboard API might not be available
          console.log("Clipboard read not available");
        }
      }, 100);
    };

    // Listen for paste events
    window.addEventListener("paste", handlePaste);
    
    // Listen for copy events (less reliable, but can help)
    document.addEventListener("copy", handleCopy);

    return () => {
      window.removeEventListener("paste", handlePaste);
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  const ClipboardModal = () => (
    <ClipboardAccountModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setCopiedAccountNumber(null);
      }}
      accountNumber={copiedAccountNumber || ""}
      onAccountVerified={(data) => {
        console.log("Account verified:", data);
        setIsModalOpen(false);
        setCopiedAccountNumber(null);
      }}
    />
  );

  return { ClipboardModal };
};







