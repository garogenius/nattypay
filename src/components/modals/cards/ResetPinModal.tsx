"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface ResetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPinModal: React.FC<ResetPinModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  React.useEffect(() => { if (isOpen) { setPin(""); setConfirm(""); } }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full">
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-4">Reset PIN</h2>
        <div className="space-y-3">
          <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="New PIN" type="password" className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none" />
          <input value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm New PIN" type="password" className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none" />
        </div>
        <button className="mt-5 w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-2.5 rounded-lg font-medium">Update PIN</button>
      </div>
    </div>
  );
};

export default ResetPinModal;
