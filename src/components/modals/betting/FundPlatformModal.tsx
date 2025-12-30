"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { useFundBettingPlatform, useGetBettingPlatforms } from "@/api/betting/betting.queries";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import { handleNumericKeyDown, handleNumericPaste } from "@/utils/utilityFunctions";

interface FundPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FundPlatformModal: React.FC<FundPlatformModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [platformOpen, setPlatformOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<{code: string; name: string} | null>(null);
  const [platformUserId, setPlatformUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const platformRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(platformRef, () => setPlatformOpen(false));

  const { data: platformsData, isLoading: platformsLoading, isError: platformsError } = useGetBettingPlatforms();
  // Only show enabled platforms
  const platforms = Array.isArray(platformsData?.data?.data) 
    ? platformsData.data.data.filter((p: any) => p.enabled !== false)
    : [];

  const onSuccessHandler = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
    SuccessToast({
      title: "Platform Funded Successfully",
      description: `₦${amount} has been sent to ${selectedPlatform?.name}`,
    });
    if (onSuccess) onSuccess();
  };

  const onErrorHandler = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Funding Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: fundPlatform, isPending: fundingPlatform } = useFundBettingPlatform(
    onErrorHandler,
    onSuccessHandler
  );

  const handleClose = () => {
    setStep("form");
    setPlatformOpen(false);
    setSelectedPlatform(null);
    setPlatformUserId("");
    setAmount("");
    setWalletPin("");
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedPlatform || !platformUserId || !amount || Number(amount) < 100) return;
    fundPlatform({
      platform: selectedPlatform.code,
      platformUserId: platformUserId,
      amount: Number(amount),
      currency: "NGN",
      walletPin,
      description: `Funding ${selectedPlatform.name} account`,
    });
  };

  const canProceed = selectedPlatform && platformUserId && amount && Number(amount) >= 100 && walletPin.length === 4;

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">Fund Platform</h2>
            <p className="text-white/60 text-sm">Send money to your betting platform</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2" ref={platformRef}>
                <label className="text-white/70 text-sm font-medium">Platform</label>
                <div
                  onClick={() => setPlatformOpen(!platformOpen)}
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                >
                  <span className={selectedPlatform ? "text-white" : "text-white/50"}>
                    {selectedPlatform?.name || "Select platform"}
                  </span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
                </div>
                {platformOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {platformsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : platformsError ? (
                        <div className="px-4 py-3 text-red-400 text-sm">Failed to load platforms</div>
                      ) : platforms.length === 0 ? (
                        <div className="px-4 py-3 text-white/50 text-sm">No platforms available</div>
                      ) : (
                        platforms.map((platform: any) => (
                          <button
                            key={platform.code}
                            onClick={() => {
                              setSelectedPlatform({ code: platform.code, name: platform.name });
                              setPlatformOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm"
                          >
                            {platform.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedPlatform && (
                <>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-xs font-medium mb-1">Selected Platform</p>
                    <p className="text-white text-sm font-semibold">{selectedPlatform.name}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white/70 text-sm font-medium">Platform User ID</label>
                    <input
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                      placeholder="Enter your platform user ID"
                      value={platformUserId}
                      onChange={(e) => setPlatformUserId(e.target.value)}
                    />
                    <p className="text-white/50 text-xs">Enter the user ID registered on {selectedPlatform.name}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white/70 text-sm font-medium">Amount</label>
                    <input
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                      placeholder="Minimum ₦100"
                      type="number"
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                    />
                    <p className="text-white/50 text-xs">Minimum amount: ₦100</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white/70 text-sm font-medium">Wallet PIN</label>
                    <input
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none"
                      placeholder="Enter 4-digit PIN"
                      type="password"
                      maxLength={4}
                      value={walletPin}
                      onChange={(e) => setWalletPin(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={handleNumericKeyDown}
                      onPaste={handleNumericPaste}
                    />
                  </div>
                </>
              )}

              {!selectedPlatform && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <p className="text-yellow-400 text-sm font-medium">Please select a betting platform first</p>
                  <p className="text-white/60 text-xs mt-1">Choose your platform from the dropdown above to continue</p>
                </div>
              )}

              <CustomButton
                onClick={() => setStep("confirm")}
                disabled={!canProceed}
                className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-3 rounded-lg mt-2"
              >
                Continue
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Platform</span>
                    <span className="text-white font-medium">{selectedPlatform?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">User ID</span>
                    <span className="text-white">{platformUserId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Amount</span>
                    <span className="text-white font-medium">₦{Number(amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm font-medium">Enter PIN to confirm</label>
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
                  onClick={handleConfirm}
                  disabled={walletPin.length !== 4 || fundingPlatform}
                  isLoading={fundingPlatform}
                  className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-3"
                >
                  Confirm
                </CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                resultSuccess ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {resultSuccess ? (
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-2 ${
                  resultSuccess ? "text-green-400" : "text-red-400"
                }`}>
                  {resultSuccess ? "Transaction Successful" : "Transaction Failed"}
                </h3>
                {transactionData && resultSuccess && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4 text-left w-full">
                    <p className="text-white/70 text-xs mb-1">Transaction Reference</p>
                    <p className="text-white text-sm font-mono">{transactionData?.transactionRef || transactionData?.transaction?.transactionRef || "N/A"}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 w-full">
                <CustomButton
                  onClick={handleClose}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-3"
                >
                  Close
                </CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundPlatformModal;

