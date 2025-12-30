"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import useUserStore from "@/store/user.store";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

interface PaymentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentSettingsModal: React.FC<PaymentSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const wallets = user?.wallet || [];
  const { selectedWalletIndex, setSelectedWalletIndex } = usePaymentSettingsStore();

  if (!isOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]"
    >
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>

      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-xl max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Payment Setting</h2>
          <p className="text-white/60 text-sm mt-1">Choose the account you'd like to use for payments</p>
        </div>

        <div className="overflow-y-visible px-5 sm:px-6 pb-5">
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white text-sm divide-y divide-white/10">
            <div className="flex items-center justify-between py-2">
              <p className="text-white/80">Available Balance (₦{Number(wallets?.[selectedWalletIndex]?.balance || 0).toLocaleString()})</p>
              <span className="w-4 h-4 rounded-full border-2 border-[#D4B139] inline-block"/>
            </div>
            {wallets.map((w, i) => (
              <label key={i} className="flex items-center justify-between py-3 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white grid place-items-center">
                    <span className="text-black font-bold">{w.currency?.slice(0,1) || 'N'}</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white text-sm font-medium">{w.bankName || w.currency}</p>
                    <p className="text-white/60 text-xs">{w.accountNumber || '0000000000'}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  checked={selectedWalletIndex === i}
                  onChange={() => setSelectedWalletIndex(i)}
                  className="w-4 h-4 accent-[#D4B139]"
                />
              </label>
            ))}
          </div>

          <div className="mt-4">
            <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={onClose}>
              Done
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsModal;
