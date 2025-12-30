"use client";

import React from "react";
import { CgClose } from "react-icons/cg";

interface UpdateUsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (username: string) => Promise<void> | void;
}

const UpdateUsernameModal: React.FC<UpdateUsernameModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [username, setUsername] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(()=>{ setUsername(""); }, [isOpen]);

  if (!isOpen) return null;

  const valid = username.trim().length >= 3;

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    try {
      setSubmitting(true);
      if (onSubmit) await onSubmit(username.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3">
          <h2 className="text-white text-base sm:text-lg font-semibold">Update Username</h2>
          <p className="text-white/60 text-sm">Enter a new username that will appear on your profile</p>
        </div>

        <div className="px-5 sm:px-6 pb-2">
          <label className="block text-sm text-white/80 mb-1.5">New Username</label>
          <div className="w-full flex items-center bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3">
            <input
              type="text"
              placeholder="Enter your new username"
              className="w-full bg-transparent outline-none border-none text-white placeholder:text-white/50 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-2">
          <button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className={`w-full rounded-xl py-3 font-semibold ${!valid || submitting ? "bg-[#D4B139]/60 text-black/70" : "bg-[#D4B139] hover:bg-[#c7a42f] text-black"}`}
          >
            {submitting ? "Processing..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateUsernameModal;
