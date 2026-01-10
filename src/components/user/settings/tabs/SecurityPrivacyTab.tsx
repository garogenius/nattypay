"use client";

import React from "react";
import { FiChevronRight, FiKey, FiLock, FiShield, FiCreditCard, FiTrash2 } from "react-icons/fi";

type Props = {
  fingerprint: boolean;
  onToggleFingerprint: () => void;
  onOpenChangePin: () => void;
  onOpenChangePassword: () => void;
  onOpenChangePasscode?: () => void;
  onOpenSetSecurity: () => void;
  onOpenLinked: () => void;
  onOpenDelete: () => void;
};

const SecurityPrivacyTab: React.FC<Props> = ({
  fingerprint,
  onToggleFingerprint,
  onOpenChangePin,
  onOpenChangePassword,
  onOpenChangePasscode,
  onOpenSetSecurity,
  onOpenLinked,
  onOpenDelete,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Security */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <p className="text-white font-semibold mb-3">Security</p>
        <div className="divide-y divide-white/10">
          {[
            { icon: <FiKey className="text-[#D4B139]" />, title: "Forget Transaction PIN", desc: "Reset your transaction PIN using an OTP sent to your registered phone number", onClick: onOpenChangePin },
            { icon: <FiLock className="text-[#D4B139]" />, title: "Change Password", desc: "Protect your account by setting a new, stronger password", onClick: onOpenChangePassword },
            ...(onOpenChangePasscode ? [{ icon: <FiLock className="text-[#D4B139]" />, title: "Change Login Passcode", desc: "Update your 6-digit login passcode", onClick: onOpenChangePasscode }] : []),
            { icon: <FiShield className="text-[#D4B139]" />, title: "Set Security Question", desc: "Add an extra layer of protection with a security question", onClick: onOpenSetSecurity },
          ].map((it, i) => (
            <button key={i} onClick={it.onClick} className="w-full flex items-center justify-between gap-3 py-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white">{it.icon}</div>
                <div>
                  <p className="text-white text-sm sm:text-base font-medium">{it.title}</p>
                  <p className="text-white/60 text-xs sm:text-sm">{it.desc}</p>
                </div>
              </div>
              <FiChevronRight className="text-white/60" />
            </button>
          ))}

          {/* Fingerprint toggle - HIDDEN FOR NOW */}
          {/* <div className="w-full flex items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiShield className="text-[#D4B139]" /></div>
              <div>
                <p className="text-white text-sm sm:text-base font-medium">Use Fingerprint for Payment</p>
                <p className="text-white/60 text-xs sm:text-sm">Enable quick and secure payments with your fingerprint.</p>
              </div>
            </div>
            <button onClick={onToggleFingerprint} className={`relative w-12 h-6 rounded-full ${fingerprint ? "bg-[#D4B139]" : "bg-white/20"}`}>
              <span className={`absolute top-0.5 ${fingerprint ? "right-0.5" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`} />
            </button>
          </div> */}
        </div>
      </div>

      {/* Privacy */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <p className="text-white font-semibold mb-3">Privacy</p>
        <div className="divide-y divide-white/10">
          <div className="w-full flex items-center justify-between gap-3 py-3 opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiCreditCard className="text-[#D4B139]" /></div>
              <div>
                <p className="text-white text-sm sm:text-base font-medium">Linked Cards/ Account</p>
                <p className="text-white/60 text-xs sm:text-sm">View, add, or remove your linked accounts and cards</p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-full bg-[#D4B139]/20 text-[#D4B139] text-xs font-medium">Coming Soon</span>
          </div>

          <div className="w-full flex items-center justify-between gap-3 py-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white/5 grid place-items-center text-white"><FiTrash2 className="text-red-400" /></div>
              <div>
                <p className="text-white text-sm sm:text-base font-medium">Delete Account</p>
                <p className="text-white/60 text-xs sm:text-sm">Permanently delete your NattyPay account</p>
              </div>
            </div>
            <button onClick={onOpenDelete} className="px-3 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/20 text-red-300 text-sm font-medium">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPrivacyTab;
