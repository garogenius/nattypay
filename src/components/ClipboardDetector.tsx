"use client";

import { useEffect, useState, useRef } from "react";
import ClipboardAccountModal from "@/components/modals/ClipboardAccountModal";

const ClipboardDetector: React.FC = () => {
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const lastCheckedRef = useRef<string>("");
  const isUserActiveRef = useRef<boolean>(true);

  useEffect(() => {
    // Track user activity
    const handleUserActivity = () => {
      isUserActiveRef.current = true;
    };

    const handleVisibilityChange = () => {
      isUserActiveRef.current = !document.hidden;
    };

    // Listen for paste events (most reliable)
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text") || "";
      const accountNumberPattern = /^\d{10}$/;
      const trimmedText = pastedText.trim();
      
      if (accountNumberPattern.test(trimmedText) && trimmedText !== lastCheckedRef.current) {
        lastCheckedRef.current = trimmedText;
        setCopiedAccountNumber(trimmedText);
        setIsModalOpen(true);
      }
    };

    // Check clipboard on focus (when user returns to tab)
    const handleFocus = async () => {
      if (!isUserActiveRef.current) return;
      
      try {
        const text = await navigator.clipboard.readText();
        const accountNumberPattern = /^\d{10}$/;
        const trimmedText = text.trim();
        
        if (accountNumberPattern.test(trimmedText) && trimmedText !== lastCheckedRef.current) {
          lastCheckedRef.current = trimmedText;
          setCopiedAccountNumber(trimmedText);
          setIsModalOpen(true);
        }
      } catch (err) {
        // Clipboard API might not be available or permission denied
        // This is expected in some browsers/contexts
      }
    };

    // Listen for user interactions
    window.addEventListener("paste", handlePaste);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("click", handleUserActivity);
    document.addEventListener("keydown", handleUserActivity);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserActivity);
      document.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  return (
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
};

export default ClipboardDetector;

