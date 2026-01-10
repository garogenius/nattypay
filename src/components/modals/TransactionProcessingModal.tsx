"use client";

import React from "react";
import Image from "next/image";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useTransactionProcessingStore } from "@/store/transactionProcessing.store";

const TransactionProcessingModal: React.FC = () => {
  const { isOpen, status, title, message, autoCloseMs, close, reset } =
    useTransactionProcessingStore();

  React.useEffect(() => {
    if (!isOpen) return;
    if (status === "processing") return;
    if (!autoCloseMs) return;

    const t = setTimeout(() => {
      close();
      // small delay to avoid visible snap when closing
      setTimeout(() => reset(), 150);
    }, autoCloseMs);

    return () => clearTimeout(t);
  }, [autoCloseMs, close, isOpen, reset, status]);

  if (!isOpen) return null;

  const isProcessing = status === "processing";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={() => {
          // allow closing only after we have a result
          if (isProcessing) return;
          close();
          setTimeout(() => reset(), 150);
        }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-bg-600 dark:bg-bg-1100 p-5">
        <div className="flex flex-col items-center text-center gap-3">
          {isProcessing && (
            <Image
              src="/images/natty01.gif"
              alt="Processing"
              width={96}
              height={96}
              className="w-20 h-20"
              unoptimized
            />
          )}

          {isSuccess && (
            <FiCheckCircle className="text-5xl text-green-400" />
          )}
          {isError && <FiXCircle className="text-5xl text-red-400" />}

          <div>
            <p className="text-white font-semibold text-base">{title}</p>
            {message && (
              <p className="text-white/70 text-sm mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {!isProcessing && (
            <button
              type="button"
              onClick={() => {
                close();
                setTimeout(() => reset(), 150);
              }}
              className="mt-1 w-full rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black font-semibold py-2.5 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionProcessingModal;


