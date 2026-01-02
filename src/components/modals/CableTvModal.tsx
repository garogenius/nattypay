"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetCablePlans,
  useGetCableVariations,
  useVerifyCableNumber,
  usePayForCable,
} from "@/api/cable/cable.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface CableTvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CableTvModal: React.FC<CableTvModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "verify" | "confirm" | "result">("form");
  const [providerOpen, setProviderOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{name: string; billerCode: string} | null>(null);
  const [smartcard, setSmartcard] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<{name: string; amount: number; payAmount: number; itemCode: string} | null>(null);
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string>("");

  const providerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(providerRef, () => setProviderOpen(false));

  // Fetch cable plans - enabled when smartcard number is entered (matching bills/cable page exactly)
  const { cablePlans, isPending: isCablePlanPending, isError: isCablePlanError } = useGetCablePlans({
    currency: "NGN",
    isEnabled: isOpen && !!smartcard && smartcard.length >= 10 && smartcard.length < 15,
  });

  const isCablePlanLoading = isCablePlanPending && !isCablePlanError;

  // Fetch variations when provider is selected (matching bills/cable page exactly)
  const { variations, isLoading: cableVariationsPending, isError: cableVariationsError } = useGetCableVariations({
    billerCode: selectedProvider?.billerCode || "",
  });

  const cableVariationsLoading = cableVariationsPending && !cableVariationsError;

  const handleClose = () => {
    setStep("form");
    setProviderOpen(false);
    setSelectedProvider(null);
    setSmartcard("");
    setSelectedPlan(null);
    setWalletPin("");
    setResultSuccess(null);
    setTransactionData(null);
    setVerifiedCustomer(null);
    setVerificationMessage("");
    setVerificationError("");
    onClose();
  };

  const onVerifySuccess = (data: any) => {
    const res = data?.data?.data;
    setVerifiedCustomer(res);
    setVerificationMessage(res?.name || "");
    setVerificationError("");
  };

  const onVerifyError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setVerificationMessage("");
    setVerificationError(errorMessage);
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage];

    ErrorToast({
      title: "Error verifying smartcard number",
      descriptions,
    });
  };

  const { mutate: verifySmartcard, isPending: verifying } = useVerifyCableNumber(
    onVerifyError,
    onVerifySuccess
  );

  // Auto-verify when smartcard + provider + variations are available (matching bills/cable page exactly)
  useEffect(() => {
    if (
      smartcard &&
      smartcard.length >= 10 &&
      smartcard.length < 15 &&
      selectedProvider &&
      selectedProvider.name && // watchedProvider equivalent
      selectedProvider.billerCode && // watchedBillerCode equivalent
      variations &&
      variations.length > 0
    ) {
      verifySmartcard({
        itemCode: variations[0].item_code,
        billerCode: selectedProvider.billerCode,
        billerNumber: smartcard,
      });
    }
  }, [
    smartcard,
    cablePlans,
    variations,
    selectedProvider,
    verifySmartcard,
  ]);

  const onPaySuccess = (data: any) => {
    setTransactionData(data?.data);
    setResultSuccess(true);
    setStep("result");
  };

  const onPayError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    setResultSuccess(false);
    setStep("result");
    ErrorToast({
      title: "Payment Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: payCable, isPending: paying } = usePayForCable(
    onPayError,
    onPaySuccess
  );

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedProvider || !selectedPlan) return;
    // Use exact same structure as bills/cable page
    payCable({
      billerCode: selectedProvider.billerCode,
      billerNumber: smartcard,
      itemCode: selectedPlan.itemCode,
      currency: "NGN",
      walletPin,
      amount: Number(selectedPlan.payAmount),
      addBeneficiary: false,
    });
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
            <h2 className="text-white text-lg font-semibold">{step === "form" ? "Cable TV" : step === "confirm" ? "Cable TV" : "Transaction History"}</h2>
            <p className="text-white/60 text-sm">{step === "form" ? "Enter payment details to continue" : step === "confirm" ? "Confirm Transactions" : "View complete information about this transaction"}</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* Smartcard - First Input */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Smartcard / IUC Number</label>
                <div className="relative w-full">
                  <input 
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 pl-4 pr-10 text-white placeholder:text-white/60 text-sm outline-none" 
                    placeholder="Enter smartcard number" 
                    value={smartcard} 
                    minLength={10} 
                    maxLength={15} 
                    onChange={(e)=> setSmartcard(e.target.value.replace(/\D/g, ""))} 
                  />
                  {(verifying || cableVariationsLoading) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <SpinnerLoader width={20} height={20} color="#D4B139" />
                    </div>
                  )}
                </div>
              </div>

              {/* Provider - Only enabled when smartcard is valid (matching bills/cable page) */}
              <div className="flex flex-col gap-2 relative" ref={providerRef}>
                <label className="text-white/70 text-sm">Provider</label>
                <div 
                  onClick={() => {
                    if (smartcard && smartcard.length >= 10 && smartcard.length < 15) {
                      setProviderOpen(!providerOpen);
                    }
                  }} 
                  className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none flex items-center justify-between ${
                    smartcard && smartcard.length >= 10 && smartcard.length < 15 
                      ? "cursor-pointer" 
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {!smartcard || smartcard.length < 10 || smartcard.length >= 15 ? (
                    <span className="text-white/50">Enter valid smartcard number</span>
                  ) : !selectedProvider ? (
                    <span className="text-white/50">Select provider</span>
                  ) : (
                    <span className="text-white">{selectedProvider.name}</span>
                  )}
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${providerOpen ? 'rotate-180' : ''}`} />
                </div>
                {providerOpen && smartcard && smartcard.length >= 10 && smartcard.length < 15 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
                    <div className="bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {isCablePlanLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : !cablePlans || cablePlans.length === 0 ? (
                        <div className="px-4 py-3 text-white/50 text-sm text-center">
                          {isCablePlanLoading ? "Loading providers..." : "No providers available"}
                        </div>
                      ) : (
                        cablePlans.map((p: any) => (
                          <button
                            key={p.billerCode || p.id}
                            onClick={() => {
                              setSelectedProvider({ name: p.shortName || p.planName || p.name, billerCode: p.billerCode });
                              setSelectedPlan(null);
                              setProviderOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                          >
                            {p.shortName || p.planName || p.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Status - Matching bills/cable page exactly */}
              {verifying || cableVariationsLoading ? (
                <div className="flex items-center gap-2 p-2 text-white/70 text-sm">
                  <SpinnerLoader width={20} height={20} color="#D4B139" />
                  <p>Fetching customer and plans...</p>
                </div>
              ) : (
                <>
                  {cablePlans &&
                  verificationMessage &&
                  !verificationError &&
                  selectedProvider &&
                  selectedProvider.name &&
                  selectedProvider.billerCode &&
                  smartcard &&
                  smartcard.length >= 10 &&
                  smartcard.length < 15 ? (
                    <div className="flex flex-col">
                      <p className="text-[#D4B139] text-sm">{verificationMessage}</p>
                    </div>
                  ) : verificationError ? (
                    <p className="flex self-start text-red-500 font-semibold text-sm">
                      {verificationError}
                    </p>
                  ) : null}
                </>
              )}

              {/* Plans Grid - Only show when verification is successful (matching bills/cable page exactly) */}
              {cablePlans &&
              verificationMessage &&
              !verificationError &&
              selectedProvider &&
              selectedProvider.name &&
              selectedProvider.billerCode &&
              smartcard &&
              smartcard.length >= 10 &&
              smartcard.length < 15 && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-white/70 text-sm font-medium">Select Plan</h2>
                  {verifying || cableVariationsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <SpinnerLoader width={20} height={20} color="#D4B139" />
                    </div>
                  ) : variations && variations.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {variations.map((item: any, index: number) => (
                        <button
                          key={item.item_code || index}
                          onClick={() => {
                            setSelectedPlan({
                              name: String(item.biller_name || item.short_name || item.name || item.item_name),
                              amount: Number(item.amount) || 0,
                              payAmount: typeof item.payAmount === 'number' ? item.payAmount : Number(item.amount) || 0,
                              itemCode: item.item_code || item.itemCode,
                            });
                          }}
                          className={`flex flex-col items-center justify-center gap-1 p-3 text-center border rounded-lg transition-colors ${
                            selectedPlan?.itemCode === (item.item_code || item.itemCode)
                              ? "bg-[#D4B139] text-black border-[#D4B139]"
                              : "border-border-600 text-white hover:bg-white/5"
                          }`}
                        >
                          <p className="text-xs">{String(item.biller_name || item.short_name || item.name || item.item_name)}</p>
                          {item.validity_period && (
                            <p className="text-xs">{String(item.validity_period)} Days</p>
                          )}
                          <p className="font-semibold text-sm">
                            ₦{new Intl.NumberFormat("en-NG", {
                              maximumFractionDigits: 2,
                            }).format(Number(item.amount))}
                          </p>
                          {item.payAmount && item.payAmount - item.amount > 0 && (
                            <p className="font-medium text-xs">
                              Fee: ₦{item.payAmount - item.amount}
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-white/50 text-sm">No plans available</div>
                  )}
                </div>
              )}

              {/* Amount Summary */}
              {selectedPlan && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    <span className="font-bold text-lg">₦{Number(selectedPlan.payAmount || 0).toLocaleString()}.00</span>
                  </div>
                </div>
              )}

              {/* Next Button - Only show when plan is selected */}
              {selectedPlan && (
              <CustomButton
                type="button"
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                  onClick={() => setStep("confirm")}
              >
                  Next
              </CustomButton>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Provider</span><span className="text-white text-sm font-medium">{selectedProvider?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Smartcard</span><span className="text-white text-sm font-medium">{smartcard}</span></div>
                {selectedPlan && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Plan</span><span className="text-white text-sm font-medium">{selectedPlan.name}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">₦{Number(selectedPlan?.payAmount || 0).toLocaleString()}</span></div>
                {verifiedCustomer && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Customer Name</span><span className="text-white text-sm font-medium">{verifiedCustomer.customerName || verifiedCustomer.name || "N/A"}</span></div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Enter Transaction PIN</label>
                <input type="password" maxLength={4} value={walletPin} onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none" />
              </div>
              <div className="flex gap-4 mt-2">
                <CustomButton onClick={()=> setStep("form")} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Back</CustomButton>
                <CustomButton onClick={handleConfirm} disabled={walletPin.length!==4 || paying} isLoading={paying} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Pay</CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: resultSuccess ? '#22c55e' : '#ef4444' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {resultSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>{resultSuccess ? 'Payment Successful' : 'Payment Failed'}</span>
              <span className="text-white text-2xl font-bold">₦{Number(selectedPlan?.payAmount || 0).toLocaleString()}.00</span>
              
              {resultSuccess && transactionData && (
                <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Transaction Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-mono">
                        {transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId || "N/A"}
                      </span>
                      {(transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId) && (
                        <button
                          onClick={() => {
                            const ref = transactionData?.transactionRef || transactionData?.transaction?.transactionRef || transactionData?.transactionId;
                            if (ref) {
                              navigator.clipboard.writeText(String(ref));
                              SuccessToast({
                                title: "Copied",
                                description: "Transaction reference copied to clipboard",
                              });
                            }
                          }}
                          className="p-1 rounded hover:bg-white/10"
                          title="Copy"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70">
                            <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V7q0-.825.588-1.412T7 5h8q.825 0 1.413.588T17 7v12q0 .825-.587 1.413T15 21zm0-2h8V7H7zm10-2V5H9V3h8q.825 0 1.413.588T19 5v12z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {transactionData?.pin && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">PIN</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-mono">{transactionData.pin}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(transactionData.pin);
                            SuccessToast({
                              title: "Copied",
                              description: "PIN copied to clipboard",
                            });
                          }}
                          className="p-1 rounded hover:bg-white/10"
                          title="Copy"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/70">
                            <path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V7q0-.825.588-1.412T7 5h8q.825 0 1.413.588T17 7v12q0 .825-.587 1.413T15 21zm0-2h8V7H7zm10-2V5H9V3h8q.825 0 1.413.588T19 5v12z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {transactionData?.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">Transaction ID</span>
                      <span className="text-white text-sm font-mono">{transactionData.transactionId}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 mt-4 w-full">
                <CustomButton onClick={handleClose} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Contact Support</CustomButton>
                <CustomButton onClick={handleClose} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Download Receipt</CustomButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CableTvModal;
