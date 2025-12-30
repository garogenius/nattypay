"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { IVirtualCard } from "@/api/currency/currency.types";
import { useGetCardById } from "@/api/currency/currency.queries";
import { LuCopy } from "react-icons/lu";

interface ShowCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard | null;
}

const ShowCardDetailsModal: React.FC<ShowCardDetailsModalProps> = ({ isOpen, onClose, card }) => {
  const { card: cardData, isPending } = useGetCardById(card?.id || null);
  const displayCard = cardData || card;

  const formatExpiry = () => {
    if (!displayCard) return "MM/YY";
    if (displayCard.expiryMonth && displayCard.expiryYear) {
      const month = String(displayCard.expiryMonth).padStart(2, "0");
      const year = String(displayCard.expiryYear).slice(-2);
      return `${month}/${year}`;
    }
    return "MM/YY";
  };

  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full">
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-4">Card Details</h2>
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
              <span>Card Number</span>
              <div className="flex items-center gap-2">
                <span>{displayCard?.maskedNumber || "•••• •••• •••• ••••"}</span>
                {displayCard?.maskedNumber && (
                  <button
                    onClick={() => navigator.clipboard.writeText(displayCard.maskedNumber)}
                    className="p-1 rounded hover:bg-white/10"
                  >
                    <LuCopy className="w-4 h-4 text-white/80" />
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
                <span>Expiry</span>
                <span>{formatExpiry()}</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
                <span>CVV</span>
                <span>{displayCard?.cvv ? "•••" : "N/A"}</span>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
              <span>Cardholder</span>
              <span>{displayCard?.cardholder || "N/A"}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
              <span>Balance</span>
              <span className="font-semibold">${displayCard?.balance?.toLocaleString() || "0"}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/90 text-sm flex items-center justify-between">
              <span>Status</span>
              <span className={`capitalize ${
                displayCard?.status === "ACTIVE" ? "text-green-400" :
                displayCard?.status === "FROZEN" ? "text-yellow-400" :
                displayCard?.status === "BLOCKED" ? "text-red-400" :
                "text-gray-400"
              }`}>
                {displayCard?.status?.toLowerCase() || "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowCardDetailsModal;

