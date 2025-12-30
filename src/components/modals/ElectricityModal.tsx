"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

interface ElectricityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ElectricityModal: React.FC<ElectricityModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "verify" | "confirm" | "result">("form");
  const [discoOpen, setDiscoOpen] = useState(false);
  const [meterTypeOpen, setMeterTypeOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState<{name: string; billerCode: string} | null>(null);
  const [meterType, setMeterType] = useState<string>("");
  const [meterNumber, setMeterNumber] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<{name: string; amount: number; itemCode: string} | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState<string>("");
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);

  const discoRef = useRef<HTMLDivElement>(null);
  const meterTypeRef = useRef<HTMLDivElement>(null);
  const planRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(discoRef, () => setDiscoOpen(false));
  useOnClickOutside(meterTypeRef, () => setMeterTypeOpen(false));
  useOnClickOutside(planRef, () => setPlanOpen(false));

  // Fetch electricity plans
  const { electricityPlans, isPending: plansLoading } = useGetElectricityPlans({
    currency: "NGN",
    isEnabled: isOpen,
  });

  // Fetch variations when disco is selected
  const { variations, isLoading: variationsLoading } = useGetElectricityVariations({
    billerCode: selectedDisco?.billerCode || "",
  });

  // Normalize plan items
  const plans = (variations || []).map((v: any) => ({
    name: v.short_name || v.name || v.item_name,
    amount: typeof v.payAmount === 'number' ? v.payAmount : Number(v.amount) || 0,
    itemCode: v.item_code || v.itemCode,
  }));

  const meterTypes = ["Prepaid", "Postpaid"];

  const canProceed = !!selectedDisco && meterType && meterNumber.length >= 7;
  const canVerify = canProceed && meterNumber.length >= 10;

  const handleClose = () => {
    setStep("form");
    setSelectedDisco(null);
    setMeterType("");
    setMeterNumber("");
    setSelectedPlan(null);
    setAmount("");
    setWalletPin("");
    setResultSuccess(null);
    setVerifiedCustomer(null);
    onClose();
  };

  const onVerifySuccess = (data: any) => {
    setVerifiedCustomer(data?.data?.data);
    if (selectedPlan) {
      setStep("confirm");
    } else {
      setStep("form");
    }
  };

  const onVerifyError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    ErrorToast({
      title: "Verification Failed",
      descriptions: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
    });
  };

  const { mutate: verifyMeter, isPending: verifying } = useVerifyElectricityNumber(
    onVerifyError,
    onVerifySuccess
  );

  const handleVerify = () => {
    if (!selectedDisco || !meterType || !meterNumber || !selectedPlan) return;
    verifyMeter({
      billerCode: selectedDisco.billerCode,
      itemCode: selectedPlan.itemCode,
      billerNumber: meterNumber,
    });
  };

  const onPaySuccess = (data: any) => {
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
    if (walletPin.length !== 4 || !selectedDisco || !selectedPlan) return;
    payElectricity({
      amount: selectedPlan.amount || Number(amount),
      itemCode: selectedPlan.itemCode,
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
              {/* Disco */}
              <div className="flex flex-col gap-2" ref={discoRef}>
                <label className="text-white/70 text-sm">Select Disco</label>
                <div onClick={() => setDiscoOpen(!discoOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={selectedDisco ? "text-white" : "text-white/50"}>{selectedDisco?.name || "Choose provider"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${discoOpen ? 'rotate-180' : ''}`} />
                </div>
                {discoOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {plansLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                      ) : (electricityPlans || []).map((d: any) => (
                        <button
                          key={d.billerCode}
                          onClick={() => {
                            setSelectedDisco({ name: d.shortName || d.name, billerCode: d.billerCode });
                            setSelectedPlan(null);
                            setDiscoOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm"
                        >
                          {d.shortName || d.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meter Type */}
              <div className="flex flex-col gap-2" ref={meterTypeRef}>
                <label className="text-white/70 text-sm">Meter Type</label>
                <div onClick={() => setMeterTypeOpen(!meterTypeOpen)} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between">
                  <span className={meterType ? "text-white" : "text-white/50"}>{meterType || "Select meter type"}</span>
                  <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${meterTypeOpen ? 'rotate-180' : ''}`} />
                </div>
                {meterTypeOpen && (
                  <div className="relative">
                    <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden">
                      {meterTypes.map((m)=> (
                        <button key={m} onClick={()=> { setMeterType(m); setMeterTypeOpen(false); }} className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/5 text-sm">{m}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meter Number */}
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Meter Number</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder="Enter meter number" value={meterNumber} maxLength={12} onChange={(e)=> setMeterNumber(e.target.value.replace(/\D/g, ""))} />
              </div>

              {/* Plan */}
              {selectedDisco && (
                <div className="flex flex-col gap-2" ref={planRef}>
                  <label className="text-white/70 text-sm">Plan</label>
                  <div onClick={() => selectedDisco && setPlanOpen(!planOpen)} className={`w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none cursor-pointer flex items-center justify-between ${!selectedDisco ? 'opacity-60 pointer-events-none' : ''}`}>
                    <span className={selectedPlan ? "text-white" : "text-white/50"}>{selectedPlan?.name || (selectedDisco ? 'Select plan' : 'Select disco first')}</span>
                    <IoChevronDown className={`w-4 h-4 text-white/70 transition-transform ${planOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {planOpen && (
                    <div className="relative">
                      <div className="absolute top-1 left-0 right-0 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-lg shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {variationsLoading ? (
                          <div className="flex items-center justify-center py-4">
                          <SpinnerLoader width={20} height={20} color="#D4B139" />
                        </div>
                        ) : plans.length ? plans.map((pl) => (
                          <button
                            key={pl.itemCode}
                            onClick={() => {
                              setSelectedPlan(pl);
                              setAmount(String(pl.amount));
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
                    <span className="font-bold text-lg">₦{Number(selectedPlan.amount || amount || 0).toLocaleString()}.00</span>
                  </div>
                </div>
              )}

              {/* Custom Amount Input (if plan doesn't have fixed amount) */}
              {selectedDisco && !selectedPlan && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount</label>
                  <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder="Enter amount" value={amount} onChange={(e)=> setAmount(e.target.value.replace(/[^\d.]/g, ''))} />
                </div>
              )}

              <CustomButton
                type="button"
                disabled={!canVerify || !selectedPlan}
                isLoading={verifying}
                className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg transition-colors mt-2"
                onClick={handleVerify}
              >
                Verify Meter
              </CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Disco</span><span className="text-white text-sm font-medium">{selectedDisco?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Meter Type</span><span className="text-white text-sm font-medium">{meterType}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Meter Number</span><span className="text-white text-sm font-medium">{meterNumber}</span></div>
                {selectedPlan && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Plan</span><span className="text-white text-sm font-medium">{selectedPlan.name}</span></div>
                )}
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">₦{Number(selectedPlan?.amount || amount || 0).toLocaleString()}</span></div>
                {verifiedCustomer && (
                  <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Customer Name</span><span className="text-white text-sm font-medium">{verifiedCustomer.customerName || "N/A"}</span></div>
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
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>{resultSuccess ? 'Successful' : 'Failed'}</span>
              <span className="text-white text-2xl font-bold">₦{Number(selectedPlan?.amount || amount || 0).toLocaleString()}.00</span>
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
