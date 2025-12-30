"use client";

import React, { useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import CustomButton from "@/components/shared/Button";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import {
  useGetTransportPlans,
  useGetTransportBillInfo,
  usePayForTransport,
} from "@/api/transport/transport.queries";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";

interface TransportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TransportModal: React.FC<TransportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [providerOpen, setProviderOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<{name: string; billerCode: string} | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{name: string; amount: number; itemCode: string} | null>(null);
  const [billerNumber, setBillerNumber] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  const providerRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(providerRef, () => setProviderOpen(false));
  useOnClickOutside(planRef, () => setPlanOpen(false));

  // Fetch transport plans
  const { transportPlans, isPending: plansLoading } = useGetTransportPlans({
    currency: "NGN",
    isEnabled: isOpen,
  });

  // Fetch bill info when provider is selected
  const { billInfo, isLoading: billInfoLoading } = useGetTransportBillInfo({
    billerCode: selectedProvider?.billerCode || "",
  });

  // Normalize plan items from billInfo
  const plans = (billInfo?.items || []).map((v: any) => ({
    name: v.short_name || v.name || v.item_name,
    amount: typeof v.payAmount === 'number' ? v.payAmount : Number(v.amount) || 0,
    itemCode: v.item_code || v.itemCode,
  }));

  const canProceed = !!selectedProvider && !!selectedPlan && billerNumber.length > 0;

  const handleClose = () => {
    setStep("form");
    setProviderOpen(false);
    setPlanOpen(false);
    setSelectedProvider(null);
    setSelectedPlan(null);
    setBillerNumber("");
    setWalletPin("");
    setResultSuccess(null);
    setTransactionData(null);
    onClose();
  };

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

  const { mutate: payTransport, isPending: paying } = usePayForTransport(
    onPayError,
    onPaySuccess
  );

  const handleConfirm = () => {
    if (walletPin.length !== 4 || !selectedProvider || !selectedPlan) return;
    payTransport({
      amount: selectedPlan.amount,
      itemCode: selectedPlan.itemCode,
      billerCode: selectedProvider.billerCode,
      billerNumber,
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
            <h2 className="text-white text-lg font-semibold">{step === "form" ? "Transport" : step === "confirm" ? "Transport" : "Transaction History"}</h2>
            <p className="text-white/60 text-sm">{step === "form" ? "Enter payment details to continue" : step === "confirm" ? "Confirm Transactions" : "View complete information about this transaction"}</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <CgClose className="text-xl text-white/70" />
          </button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              {/* Provider */}
              <div className="flex flex-col gap-2" ref={providerRef}>
                <label className="text-white/70 text-sm">Provider</label>
                <div onClick={() => setProviderOpen(!providerOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={selectedProvider ? "text-white" : "text-white/50"}>{selectedProvider?.name || "Select provider"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${providerOpen ? 'rotate-180' : ''}`} />
                </div>
                {providerOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {plansLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : (transportPlans || []).map((p: any) => (
                        <button
                          key={p.billerCode}
                          onClick={() => {
                            setSelectedProvider({ name: p.shortName || p.name, billerCode: p.billerCode });
                            setSelectedPlan(null);
                            setProviderOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                        >
                          {p.shortName || p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Biller Number */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Ticket/Booking Number</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder="Enter number" value={billerNumber} onChange={(e)=> setBillerNumber(e.target.value)} />
              </div>

              {/* Plan */}
              {selectedProvider && (
                <div className="flex flex-col gap-2" ref={planRef}>
                  <label className="text-white/70 text-sm">Plan</label>
                  <div onClick={() => selectedProvider && setPlanOpen(!planOpen)} className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between ${!selectedProvider ? 'opacity-60 pointer-events-none' : ''}`}>
                    <span className={selectedPlan ? "text-white" : "text-white/50"}>{selectedPlan?.name || (selectedProvider ? 'Select plan' : 'Select provider first')}</span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${planOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {planOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {billInfoLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <SpinnerLoader width={20} height={20} color="#D4B139" />
                          </div>
                        ) : plans.length ? plans.map((pl) => (
                          <button
                            key={pl.itemCode}
                            onClick={() => {
                              setSelectedPlan(pl);
                              setPlanOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/5 text-sm flex items-center justify-between"
                          >
                            <span>{pl.name}</span>
                            <span className="text-[#D4B139] font-medium">₦{pl.amount.toLocaleString()}</span>
                          </button>
                        )) : (
                          <div className="px-4 py-3 text-white/50 text-sm">No plans available</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Amount Display */}
              {selectedPlan && (
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-green-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-lg">₦{Number(selectedPlan.amount || 0).toLocaleString()}.00</span>
                  </div>
                </div>
              )}

              <CustomButton
                type="button"
                disabled={!canProceed}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                onClick={() => setStep("confirm")}
              >
                Next
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Provider</span><span className="text-white text-sm font-medium">{selectedProvider?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Number</span><span className="text-white text-sm font-medium">{billerNumber}</span></div>
                {selectedPlan && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Plan</span><span className="text-white text-sm font-medium">{selectedPlan.name}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">₦{Number(selectedPlan?.amount || 0).toLocaleString()}</span></div>
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
              <span className="text-white text-2xl font-bold">₦{Number(selectedPlan?.amount || 0).toLocaleString()}.00</span>
              
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

export default TransportModal;






