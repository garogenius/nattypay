"use client";

import React, { useState } from "react";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import ReceiptContainer from "@/components/user/receipt/ReceiptFields";
import useTransactionStore from "@/store/useTransaction.store";
import html2canvas from "html2canvas";
import { createRoot } from "react-dom/client";
import { FiShare2, FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";

const TransactionViewModal: React.FC = () => {
  const { isOpen, transaction, close } = useTransactionViewModalStore();
  const setTransaction = useTransactionStore((state) => state.setTransaction);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (isOpen && transaction) {
      setTransaction(transaction);
    }
  }, [isOpen, transaction, setTransaction]);

  if (!isOpen || !transaction) return null;

  const generateReceiptImage = async () => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "500px";
    document.body.appendChild(tempDiv);

    const root = createRoot(tempDiv);
    root.render(
      <div className="bg-white">
        <ReceiptContainer />
      </div>
    );

    // Wait for content and images to load
    await new Promise((resolve) => setTimeout(resolve, 600));

    const canvas = await html2canvas(tempDiv, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    root.unmount();
    document.body.removeChild(tempDiv);
    return canvas;
  };

  const handleDownload = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const toastId = toast.loading("Preparing receipt...");
    
    try {
      const canvas = await generateReceiptImage();
      const link = document.createElement("a");
      link.download = `NattyPay_Receipt_${transaction.transactionRef || 'transaction'}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Receipt downloaded!", { id: toastId });
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (isProcessing) return;
    
    // Check if sharing is supported
    if (!navigator.share) {
      toast.error("Sharing is not supported on this browser. Try downloading instead.");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Preparing to share...");

    try {
      const canvas = await generateReceiptImage();
      const dataUrl = canvas.toDataURL("image/png");
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `NattyPay_Receipt_${transaction.transactionRef || 'transaction'}.png`, { type: "image/png" });

      await navigator.share({
        files: [file],
        title: 'NattyPay Transaction Receipt',
        text: `Transaction Receipt from NattyPay - Ref: ${transaction.transactionRef || 'N/A'}`,
      });
      
      toast.success("Receipt shared successfully!", { id: toastId });
    } catch (error) {
      // Don't show error if user cancelled the share
      if ((error as any).name !== 'AbortError') {
        console.error("Error sharing receipt:", error);
        toast.error("Failed to share receipt", { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#141C2B] rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        {/* Receipt content wrapper with scroll if needed */}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
          <ReceiptContainer />
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 dark:bg-black/20 flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-black dark:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <FiDownload className="text-lg" />
              Download
            </button>
            <button
              onClick={handleShare}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-[#D4B139] hover:bg-[#c7a42f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <FiShare2 className="text-lg" />
              Share Receipt
            </button>
          </div>
          <button
            onClick={close}
            disabled={isProcessing}
            className="w-full py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionViewModal;
