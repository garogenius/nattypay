"use client";

import React, { useState } from "react";
import { CgClose } from "react-icons/cg";
import { FiPlus } from "react-icons/fi";
import useUserStore from "@/store/user.store";
import CreateAccountModal from "./CreateAccountModal";

interface LinkedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LinkedAccountsModal: React.FC<LinkedAccountsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const [openCreatePersonal, setOpenCreatePersonal] = useState(false);
  const [openCreateBusiness, setOpenCreateBusiness] = useState(false);
  const [openCreateForeign, setOpenCreateForeign] = useState(false);

  if (!isOpen) return null;

  const wallets = user?.wallet || [];

  return (
    <>
      <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
        </div>
        <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
          <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
            <CgClose className="text-xl text-text-200 dark:text-text-400" />
          </button>

          <div className="px-5 sm:px-6 pt-1 pb-3">
            <h2 className="text-white text-base sm:text-lg font-semibold">Virtual Accounts</h2>
            <p className="text-white/60 text-sm">Manage your virtual accounts</p>
          </div>

          <div className="px-5 sm:px-6 space-y-3">
            {/* Account Creation Options */}
            <div className="space-y-2">
              <p className="text-white/80 text-sm font-medium">Create New Account</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => setOpenCreatePersonal(true)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white text-sm">NGN Personal Account</span>
                  <FiPlus className="text-[#D4B139]" />
                </button>
                <button
                  onClick={() => setOpenCreateBusiness(true)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white text-sm">NGN Business Account</span>
                  <FiPlus className="text-[#D4B139]" />
                </button>
                <button
                  onClick={() => setOpenCreateForeign(true)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white text-sm">Foreign Currency Account</span>
                  <FiPlus className="text-[#D4B139]" />
                </button>
              </div>
            </div>

            {/* Existing Accounts */}
            {wallets.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-white/80 text-sm font-medium">Your Accounts</p>
                {wallets.map((wallet: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-white text-sm font-medium">{wallet.bankName || "NattyPay"}</p>
                      <p className="text-white/60 text-xs">
                        {wallet.accountNumber || "N/A"} • {wallet.currency || "NGN"}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Account Modals */}
      <CreateAccountModal
        isOpen={openCreatePersonal}
        onClose={() => setOpenCreatePersonal(false)}
        accountType="personal"
      />
      <CreateAccountModal
        isOpen={openCreateBusiness}
        onClose={() => setOpenCreateBusiness(false)}
        accountType="business"
      />
      <CreateAccountModal
        isOpen={openCreateForeign}
        onClose={() => setOpenCreateForeign(false)}
        accountType="foreign"
      />
    </>
  );
};

export default LinkedAccountsModal;
