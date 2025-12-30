"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CgClose } from "react-icons/cg";
import { IoChevronDown } from "react-icons/io5";
import Image from "next/image";
import CustomButton from "@/components/shared/Button";
import { useGetInternationalAirtimePlan, usePayForInternationalAirtime } from "@/api/airtime/airtime.queries";
import { formatNumberWithoutExponential, handleInput } from "@/utils/utilityFunctions";
import SpinnerLoader from "@/components/Loader/SpinnerLoader";

interface Props { isOpen: boolean; onClose: () => void; }

const InternationalAirtimeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "confirm" | "result">("form");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [walletPin, setWalletPin] = useState("");
  const [operatorId, setOperatorId] = useState<number | undefined>();
  const [plan, setPlan] = useState<any>(null);
  const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);

  const { data: internationalAirtimePlan, isLoading, isError } = useGetInternationalAirtimePlan({ phone });
  const iaLoading = isLoading && !isError;

  useEffect(() => {
    const planData = internationalAirtimePlan?.data?.data;
    if (planData) {
      setOperatorId(planData.operatorId);
      setPlan(planData);
      if (planData?.denominationType === "FIXED") {
        setAmount(String(planData?.localFixedAmounts?.[0] || ""));
      }
    } else {
      setPlan(null);
      setOperatorId(undefined);
    }
  }, [internationalAirtimePlan?.data?.data]);

  const minAmt = plan ? Number(formatNumberWithoutExponential(plan?.minAmount * (plan?.fx?.rate || 1), 4)) : 0;
  const maxAmt = plan ? Number(formatNumberWithoutExponential(plan?.maxAmount * (plan?.fx?.rate || 1), 4)) : 0;

  const canProceed = phone && operatorId && (Number(amount) > 0);

  const handleClose = () => {
    setStep("form");
    setPhone("");
    setAmount("");
    setWalletPin("");
    setOperatorId(undefined);
    setPlan(null);
    onClose();
  };

  const onPayAirtimeSuccess = () => { setResultSuccess(true); setStep("result"); };
  const onPayAirtimeError = () => { setResultSuccess(false); setStep("result"); };
  const { mutate: PayForInternationalAirtime, isPending: paying, isError: payError } = usePayForInternationalAirtime(onPayAirtimeError, onPayAirtimeSuccess);
  const isPaying = paying && !payError;

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose}></div>
      </div>
      <div className="relative mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 w-full max-w-md rounded-2xl overflow-visible">
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            <h2 className="text-white text-lg font-semibold">{step === "form" ? "International Airtime" : step === "confirm" ? "International Airtime" : "Transaction History"}</h2>
            <p className="text-white/60 text-sm">{step === "form" ? "Enter payment details to continue" : step === "confirm" ? "Confirm Transactions" : "View complete information about this transaction"}</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded transition-colors"><CgClose className="text-xl text-white/70" /></button>
        </div>

        <div className="px-4 pb-4">
          {step === "form" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Phone Number</label>
                <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder="Enter phone number" value={phone} onChange={(e)=> setPhone(e.target.value)} onInput={handleInput} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white/70 text-sm">Detected Network</label>
                <div className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm flex items-center justify-between">
                  {iaLoading ? (
                    <div className="flex items-center gap-2 text-white/70"><SpinnerLoader width={16} height={16} color="#D4B139" /><span>Detecting...</span></div>
                  ) : plan ? (
                    <div className="flex items-center gap-2">
                      {plan?.logoUrls?.[0] ? <Image src={plan.logoUrls[0]} alt={plan?.name} width={20} height={20} className="w-5 h-5 rounded-full" unoptimized /> : null}
                      <span className="uppercase">{plan?.name}</span>
                    </div>
                  ) : (
                    <span className="text-white/50">Enter valid phone number</span>
                  )}
                </div>
                {plan && plan?.destinationCurrencyCode !== "NGN" ? (
                  <p className="text-white/60 text-xs">1 {plan?.senderCurrencyCode} = {Number(formatNumberWithoutExponential(plan?.fx?.rate || 1, 2))} {plan?.destinationCurrencyCode}</p>
                ) : null}
              </div>

              {plan?.denominationType === "RANGE" && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Amount ({plan?.destinationCurrencyCode})</label>
                  <input className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white placeholder:text-white/60 text-sm outline-none" placeholder={`Min ${minAmt} / Max ${maxAmt}`} type="number" value={amount} onChange={(e)=> setAmount(e.target.value)} />
                  <div className="text-[#D4B139] text-xs">{plan?.payAmount ? `Fee: ₦${plan?.payAmount}` : null} {amount && plan?.fx?.rate ? `• Paying: ₦${Number(formatNumberWithoutExponential(Number(amount)/(plan.fx.rate||1) + (plan?.payAmount||0), 2)).toLocaleString()}` : null}</div>
                </div>
              )}

              {plan?.denominationType === "FIXED" && (
                <div className="flex flex-col gap-2">
                  <label className="text-white/70 text-sm">Select Amount ({plan?.destinationCurrencyCode})</label>
                  <select className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none" value={amount} onChange={(e)=> setAmount(e.target.value)}>
                    {plan?.localFixedAmounts?.map((v:number, i:number)=> (
                      <option key={i} value={String(v)}>{v} {plan?.destinationCurrencyCode}</option>
                    ))}
                  </select>
                  <div className="text-[#D4B139] text-xs">{plan?.payAmount ? `Fee: ₦${plan?.payAmount}` : null}</div>
                </div>
              )}

              <CustomButton type="button" disabled={!canProceed || iaLoading} className="w-full bg-[#D4B139] hover:bg-[#D4B139]/90 text-black font-medium py-3 rounded-lg mt-2" onClick={()=> setStep("confirm")}>Next</CustomButton>
            </div>
          )}

          {step === "confirm" && (
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Network</span><span className="text-white text-sm font-medium">{plan?.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Phone</span><span className="text-white text-sm font-medium">+{phone}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount</span><span className="text-white text-sm font-medium">{amount} {plan?.destinationCurrencyCode}</span></div>
                <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Amount Debited</span><span className="text-white text-sm font-medium">₦{Number(formatNumberWithoutExponential(Number(amount)/(plan?.fx?.rate||1) + (plan?.payAmount||0), 2)).toLocaleString()}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-sm">Enter Transaction PIN</label>
                <input type="password" maxLength={4} value={walletPin} onChange={(e)=> setWalletPin(e.target.value.replace(/\D/g, ""))} className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-4 text-white text-sm outline-none" />
              </div>
              <div className="flex gap-4 mt-2">
                <CustomButton onClick={()=> setStep("form")} className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg">Back</CustomButton>
                <CustomButton onClick={()=> {
                  if (!operatorId) return; 
                  PayForInternationalAirtime({ phone, currency: "NGN", walletPin, operatorId, amount: Number(amount), addBeneficiary: false });
                }} disabled={walletPin.length!==4 || isPaying} isLoading={isPaying} className="flex-1 bg-[#D4B139] hover:bg-[#D4B139]/90 text-black py-3 rounded-lg">Pay</CustomButton>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: resultSuccess ? '#22c55e' : '#ef4444' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">{resultSuccess ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />)}</svg>
              </div>
              <span className={`${resultSuccess ? 'text-emerald-400' : 'text-red-400'} text-sm font-medium`}>{resultSuccess ? 'Successful' : 'Failed'}</span>
              <span className="text-white text-2xl font-bold">₦{Number(formatNumberWithoutExponential(Number(amount)/(plan?.fx?.rate||1) + (plan?.payAmount||0), 2)).toLocaleString()}</span>
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

export default InternationalAirtimeModal;
