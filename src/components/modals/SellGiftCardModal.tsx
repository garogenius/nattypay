"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";

interface SellGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SellGiftCardModal: React.FC<SellGiftCardModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [pinCode, setPinCode] = useState<string>("");
  const [cardType, setCardType] = useState<string>("");
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const handleClose = () => {
    setStep("form");
    setCardNumber("");
    setPinCode("");
    setCardType("");
    setEstimatedValue(null);
    setWalletPin("");
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

  const handleVerifyCard = () => {
    if (!cardNumber || !pinCode) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please enter both card number and PIN"],
      });
      return;
    }

    // TODO: Implement card verification API call when available
    // For now, show a placeholder message
    ErrorToast({
      title: "Feature Coming Soon",
      descriptions: ["Gift card selling feature will be available soon. Please contact support for assistance."],
    });
    
    // When API is available, this should:
    // 1. Verify the card number and PIN
    // 2. Get card type and estimated value
    // 3. Show confirmation step with exchange rate
    // Example flow:
    // verifyCard({ cardNumber, pinCode })
    //   .then(response => {
    //     setCardType(response.data.cardType);
    //     setEstimatedValue(response.data.estimatedValue);
    //     setStep("confirm");
    //   });
  };

  const handleSellCard = () => {
    if (walletPin.length !== 4) {
      ErrorToast({
        title: "Invalid PIN",
        descriptions: ["Please enter a valid 4-digit PIN"],
      });
      return;
    }

    // TODO: Implement sell gift card API call when available
    // For now, show a placeholder message
    ErrorToast({
      title: "Feature Coming Soon",
      descriptions: ["Gift card selling feature will be available soon. Please contact support for assistance."],
    });

    // When API is available, this should:
    // sellGiftCard({
    //   cardNumber,
    //   pinCode,
    //   walletPin,
    // })
    //   .then(response => {
    //     setTransactionData(response.data);
    //     setResultSuccess(true);
    //     setStep("result");
    //   });
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">
              {step === "form" ? "Sell Gift Card" : step === "confirm" ? "Sell Gift Card" : "Transaction Result"}
            </h2>
            <p className="text-white/60 text-sm">
              {step === "form" ? "Enter gift card details to sell" : 
               step === "confirm" ? "Confirm sale" : 
               "View transaction details"}
            </p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-400 text-xs font-medium mb-1">Note</p>
                <p className="text-white/70 text-xs">
                  Enter your gift card number and PIN to get an instant quote. We offer competitive rates for various gift card types.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Card Number</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Enter gift card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">PIN Code</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                  placeholder="Enter PIN code"
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                />
              </div>

              {estimatedValue && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Card Type</span>
                    <span className="text-white font-medium">{cardType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Estimated Value</span>
                    <span className="text-[#D4B139] text-lg font-bold">₦{estimatedValue.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <CustomButton
                onClick={handleVerifyCard}
                disabled={!cardNumber || !pinCode}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Verify Card
              </CustomButton>
            </div>
          )}

          {step === "confirm" && estimatedValue && (
            <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-semibold mb-3">Sale Details</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Card Type</span>
                  <span className="text-white font-medium">{cardType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">Card Number</span>
                  <span className="text-white text-sm font-mono">{cardNumber.slice(-4).padStart(cardNumber.length, "•")}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">Amount to Receive</span>
                  <span className="text-[#D4B139] text-xl font-bold">₦{estimatedValue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Enter Wallet PIN</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none text-center text-2xl tracking-widest"
                  placeholder="••••"
                  type="password"
                  maxLength={4}
                  value={walletPin}
                  onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={handleNumericKeyDown}
                  onPaste={handleNumericPaste}
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <CustomButton
                  onClick={() => setStep("form")}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-3"
                >
                  Back
                </CustomButton>
                <CustomButton
                  onClick={handleSellCard}
                  disabled={walletPin.length !== 4}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3"
                >
                  Sell Card
                </CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                resultSuccess ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {resultSuccess ? (
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <h3 className={`text-lg font-semibold mb-1 ${
                  resultSuccess ? "text-green-400" : "text-red-400"
                }`}>
                  {resultSuccess ? "Sale Successful" : "Sale Failed"}
                </h3>
                {transactionData && resultSuccess && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-3 text-left w-full">
                    <p className="text-white/70 text-xs mb-1">Transaction Reference</p>
                    <p className="text-white text-sm font-mono">{transactionData?.transactionRef || transactionData?.transactionId || "N/A"}</p>
                    <p className="text-white/70 text-xs mt-2 mb-1">Amount Received</p>
                    <p className="text-[#D4B139] text-lg font-bold">₦{transactionData?.amount?.toLocaleString() || estimatedValue?.toLocaleString() || "0"}</p>
                  </div>
                )}
              </div>
              <CustomButton
                onClick={handleClose}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg"
              >
                Close
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellGiftCardModal;


















































































































