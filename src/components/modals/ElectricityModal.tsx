"use client";

import React, { useEffect, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetElectricityPlans,
  useGetElectricityVariations,
  useVerifyElectricityNumber,
  usePayForElectricity,
} from "@/api/electricity/electricity.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface ElectricityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ElectricityModal: React.FC<ElectricityModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "verify" | "confirm" | "result">("form");
  const [discoOpen, setDiscoOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState<{name: string; billerCode: string} | null>(null);
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<{name: string; amount: number; itemCode: string; payAmount: number} | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);
  const [verificationMessage, setVerificationMessage] = useState<string>("");
  const [verificationError, setVerificationError] = useState<string>("");

  const discoRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(discoRef, () => setDiscoOpen(false));
  useOnClickOutside(planRef, () => setPlanOpen(false));

  // Fetch electricity plans - enabled when meter number is entered (matching bills/electricity page exactly)
  const { electricityPlans, isPending: isElectricityPlanPending, isError: isElectricityPlanError } = useGetElectricityPlans({
    currency: "NGN",
    isEnabled: isOpen && !!meterNumber && meterNumber.length >= 10,
  });

  const isElectricityPlanLoading = isElectricityPlanPending && !isElectricityPlanError;

  // Fetch variations when disco is selected (matching bills/electricity page exactly)
  const { variations, isLoading: electricityVariationsPending, isError: electricityVariationsError } = useGetElectricityVariations({
    billerCode: selectedDisco?.billerCode || "",
  });

  const electricityVariationsLoading = electricityVariationsPending && !electricityVariationsError;

  const handleClose = () => {
    setStep("form");
    setSelectedDisco(null);
    setMeterNumber("");
    setSelectedPlan(null);
    setAmount("");
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
      title: "Error verifying meter number",
      descriptions,
    });
  };

  const { mutate: verifyMeter, isPending: verifying } = useVerifyElectricityNumber(
    onVerifyError,
    onVerifySuccess
  );

  // Auto-verify when meter number + provider + variations are available (matching bills/electricity page exactly)
  useEffect(() => {
    if (
      meterNumber &&
      meterNumber.length >= 10 &&
      selectedDisco &&
      selectedDisco.name && // watchedProvider equivalent
      selectedDisco.billerCode && // watchedBillerCode equivalent
      variations &&
      variations.length > 0
    ) {
    verifyMeter({
        itemCode: variations[0].item_code,
      billerCode: selectedDisco.billerCode,
      billerNumber: meterNumber,
    });
    }
  }, [
    meterNumber,
    electricityPlans,
    variations,
    selectedDisco,
    verifyMeter,
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

  const { mutate: payElectricity, isPending: paying } = usePayForElectricity(
    onPayError,
    onPaySuccess
  );

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedDisco) return;
    if (!selectedPlan && (!amount || Number(amount) < 500)) return;
    
    // Use selected plan's itemCode and payAmount, or use first variation's itemCode and entered amount (matching bills/electricity page)
    const itemCodeToUse = selectedPlan?.itemCode || (variations && variations.length > 0 ? variations[0].item_code : "");
    const amountToUse = selectedPlan ? selectedPlan.payAmount : Number(amount);
    
    payElectricity({
      amount: amountToUse,
      itemCode: itemCodeToUse,
      billerCode: selectedDisco.billerCode,
      billerNumber: meterNumber,
      currency: "NGN",
      walletPin,
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
            <h2 className="text-white text-lg font-semibold">{step === "form" ? "Electricity" : step === "confirm" ? "Electricity" : "Transaction History"}</h2>
            <p className="text-white/60 text-sm">{step === "form" ? "Enter payment details to continue" : step === "confirm" ? "Confirm Transactions" : "View complete information about this transaction"}</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* Meter Number - First Input */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Meter Number</label>
                <div className="relative w-full">
                  <input 
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 pl-4 pr-10 text-white placeholder:text-white/60 text-sm outline-none" 
                    placeholder="Enter meter number" 
                    value={meterNumber} 
                    minLength={10} 
                    maxLength={12} 
                    onChange={(e)=> setMeterNumber(e.target.value.replace(/\D/g, ""))} 
                  />
                  {(verifying || electricityVariationsLoading) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <SpinnerLoader width={20} height={20} color="#D4B139" />
                    </div>
                  )}
                </div>
              </div>

              {/* Disco - Only enabled when meter number is valid (matching bills/electricity page) */}
              <div className="flex flex-col gap-2 relative" ref={discoRef}>
                <label className="text-white/70 text-sm">Select Disco</label>
                <div 
                  onClick={() => {
                    if (meterNumber && meterNumber.length >= 10) {
                      setDiscoOpen(!discoOpen);
                    }
                  }} 
                  className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none flex items-center justify-between ${
                    meterNumber && meterNumber.length >= 10 
                      ? "cursor-pointer" 
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  {!meterNumber || meterNumber.length < 10 ? (
                    <span className="text-white/50">Enter valid meter number</span>
                  ) : !selectedDisco ? (
                    <span className="text-white/50">Select provider</span>
                  ) : (
                    <span className="text-white">{selectedDisco.name}</span>
                  )}
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${discoOpen ? 'rotate-180' : ''}`} />
                </div>
                {discoOpen && meterNumber && meterNumber.length >= 10 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
                    <div className="bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                      {isElectricityPlanLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : !electricityPlans || electricityPlans.length === 0 ? (
                        <div className="px-4 py-3 text-white/50 text-sm text-center">
                          {isElectricityPlanLoading ? "Loading providers..." : "No providers available"}
                        </div>
                      ) : (
                        electricityPlans.map((d: any) => (
                        <button
                            key={d.billerCode || d.id}
                          onClick={() => {
                              setSelectedDisco({ name: d.shortName || d.planName || d.name, billerCode: d.billerCode });
                            setSelectedPlan(null);
                              setAmount("");
                            setDiscoOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                        >
                            {d.shortName || d.planName || d.name}
                        </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Verification Status - Matching bills/electricity page exactly */}
              {verifying || electricityVariationsLoading ? (
                <div className="flex items-center gap-2 p-2 text-white/70 text-sm">
                  <SpinnerLoader width={20} height={20} color="#D4B139" />
                  <p>Fetching customer and plans...</p>
                </div>
              ) : (
                <>
                  {electricityPlans &&
                  verificationMessage &&
                  !verificationError &&
                  selectedDisco &&
                  selectedDisco.name &&
                  selectedDisco.billerCode &&
                  meterNumber &&
                  meterNumber.length >= 10 ? (
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

              {/* Plan - Only show when verification is successful (matching bills/electricity page exactly) */}
              {electricityPlans &&
              verificationMessage &&
              !verificationError &&
              selectedDisco &&
              selectedDisco.name &&
              selectedDisco.billerCode &&
              meterNumber &&
              meterNumber.length >= 10 && (
                <div className="flex flex-col gap-2 relative" ref={planRef}>
                  <label className="text-white/70 text-sm">Select Plan</label>
                  <div 
                    onClick={() => {
                      if (meterNumber && selectedDisco && verificationMessage && !verificationError) {
                        setPlanOpen(!planOpen);
                      }
                    }} 
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between"
                  >
                    <span className={selectedPlan ? "text-white" : "text-white/50"}>
                      {selectedPlan?.name || 'Select plan'}
                    </span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${planOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {planOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-[100]">
                      <div className="bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {electricityVariationsLoading ? (
                          <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                        ) : variations && variations.length > 0 ? (
                          variations.map((item: any, index: number) => (
                          <button
                              key={item.item_code || index}
                            onClick={() => {
                                setSelectedPlan({
                                  name: item.short_name || item.name || item.item_name,
                                  amount: Number(item.amount) || 0,
                                  payAmount: typeof item.payAmount === 'number' ? item.payAmount : Number(item.amount) || 0,
                                  itemCode: item.item_code || item.itemCode,
                                });
                                setAmount(String(item.payAmount || item.amount));
                              setPlanOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm flex items-center justify-between"
                          >
                              <span>{item.short_name || item.name || item.item_name}</span>
                              <span className="text-[#D4B139] font-medium">₦{Number(item.payAmount || item.amount).toLocaleString()}</span>
                          </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-white/50 text-sm">No plans available</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Input - Always show when verification is successful (matching bills/electricity page exactly) */}
              {electricityPlans &&
              verificationMessage &&
              !verificationError &&
              selectedDisco &&
              meterNumber &&
              meterNumber.length >= 10 && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input 
                    className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" 
                    placeholder="₦5,000" 
                    type="number"
                    value={amount} 
                    onChange={(e)=> setAmount(e.target.value.replace(/[^\d.]/g, ''))} 
                  />
                  {selectedPlan && selectedPlan.payAmount - selectedPlan.amount > 0 && (
                    <p className="text-[#D4B139] text-sm">
                      Fee: ₦{selectedPlan.payAmount - selectedPlan.amount}
                    </p>
                  )}
                </div>
              )}

              {/* Next Button - Only show when verification is successful and (plan is selected or amount is entered) */}
              {electricityPlans &&
              verificationMessage &&
              !verificationError &&
              selectedDisco &&
              meterNumber &&
              meterNumber.length >= 10 &&
              (selectedPlan || (amount && Number(amount) >= 500)) && (
              <CustomButton
                type="button"
                  disabled={!selectedPlan && (!amount || Number(amount) < 500)}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                  onClick={() => {
                    if (selectedPlan || (amount && Number(amount) >= 500)) {
                      setStep("confirm");
                    }
                  }}
              >
                  Next
              </CustomButton>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Disco</span><span className="text-white text-sm font-medium">{selectedDisco?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Meter Number</span><span className="text-white text-sm font-medium">{meterNumber}</span></div>
                {selectedPlan && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Plan</span><span className="text-white text-sm font-medium">{selectedPlan.name}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">₦{Number(selectedPlan?.payAmount || amount || 0).toLocaleString()}</span></div>
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
                <CustomButton onClick={handleConfirm} disabled={(walletPin.length!==4 || paying || (!selectedPlan && (!amount || Number(amount) < 500)))} isLoading={paying} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Pay</CustomButton>
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
              <span className="text-white text-2xl font-bold">₦{Number(selectedPlan?.payAmount || amount || 0).toLocaleString()}.00</span>
              
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

export default ElectricityModal;

