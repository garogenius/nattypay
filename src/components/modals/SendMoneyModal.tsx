"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import TransferProcess from "@/components/user/sendMoney/TransferProcess";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendMoneyModal: React.FC<SendMoneyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [step, setStep] = React.useState(0); // 0=select type, 1=account, 2=amount, 3=confirm, 4=PIN/Pay
  const [type, setType] = React.useState<"nattypay" | "bank" | null>(null);

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose}></div>
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-3xl max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        {/* Header with stepper */}
        <div className="px-5 sm:px-6 pt-1 pb-2">
          <h2 className="text-white text-base sm:text-lg font-semibold">Send Money</h2>
          <div className="mt-3 flex items-center gap-4">
            {[0,1,2,3,4].map((i)=> (
              <span key={i} className={`h-1 rounded-full ${i===step? 'bg-[#F2C94C] w-12' : 'bg-white/20 w-16'}`}/>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          {step === 0 && (
            <div className="w-full">
              <p className="text-white/90 text-sm mb-3">Select Transfer Type</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setType("nattypay"); setStep(1); }}
                  className="text-left w-full rounded-xl border border-[#2C3947] bg-white/5 hover:bg-white/10 transition-colors px-4 py-4"
                >
                  <p className="text-white font-medium">NattyPay Transfer</p>
                  <p className="text-white/60 text-xs">Instant & Free</p>
                </button>
                <button
                  onClick={() => { setType("bank"); setStep(1); }}
                  className="text-left w-full rounded-xl border border-[#2C3947] bg-white/5 hover:bg-white/10 transition-colors px-4 py-4"
                >
                  <p className="text-white font-medium">Other Banks</p>
                  <p className="text-white/60 text-xs">₦10 Fee.  Arrives in 5–10 mins</p>
                </button>
              </div>
            </div>
          )}

          {step > 0 && (
            <TransferProcess
              compact
              initialType={(type || "nattypay")}
              onStepChange={(s) => {
                // Map internal steps (0..4) to modal steps (1..4)
                const mapped = Math.min(4, 1 + s);
                setStep(mapped);
              }}
              onBackFirstStep={() => setStep(0)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMoneyModal;
