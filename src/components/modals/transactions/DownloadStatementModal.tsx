"use client";

import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const DownloadStatementModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [email, setEmail] = React.useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold">Download Statement</h3>
            <p className="text-white/60 text-xs sm:text-sm">Access and download your account statement</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm">✕</button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="text-white/80 text-xs sm:text-sm">Start Date</label>
            <div className="mt-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-white/50 text-sm"
                placeholder="Select Start Date"
              />
            </div>
          </div>
          <div>
            <label className="text-white/80 text-xs sm:text-sm">End Date</label>
            <div className="mt-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-white/50 text-sm"
                placeholder="Select End Date"
              />
            </div>
          </div>
          <div>
            <label className="text-white/80 text-xs sm:text-sm">Email address</label>
            <div className="mt-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-white placeholder:text-white/50 text-sm"
                placeholder="Enter where you want to receive it"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 text-sm"
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadStatementModal;
