"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface StartNewPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: "target" | "fixed" | "easylife") => void;
}

const StartNewPlanModal: React.FC<StartNewPlanModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-lg max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Start New Plan</h2>
          <p className="text-white/60 text-sm">Select Plan Type</p>
        </div>

        <div className="px-5 sm:px-6 pb-6 flex flex-col gap-3">
          {[{k:"target",t:"Target Savings",d:"Achieve your financial goals faster with scheduled contributions"},{k:"fixed",t:"Fixed Deposit",d:"Earn consistent interest on your savings while keeping your funds secure"},{k:"easylife",t:"Easy-life Savings",d:"Enjoy flexible savings that fit your lifestyle while earning steady interest on your balance"}].map((it:any)=> (
            <button key={it.k} onClick={()=> onSelect(it.k)} className="w-full text-left rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-4">
              <p className="text-white font-medium">{it.t}</p>
              <p className="text-white/60 text-sm mt-1">{it.d}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartNewPlanModal;
