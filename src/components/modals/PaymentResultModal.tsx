"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import html2canvas from "html2canvas";
import Image from "next/image";
import images from "../../../public/images";

interface PaymentResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "success" | "failed";
  amount: number;
  transactionId: string;
  dateTime: string;
  paymentMethod: string; // e.g., Available Balance
  transactionType: string; // e.g., Inter-bank Transfer
  recipientName: string;
  recipientAccount: string;
  bankName: string;
  narration?: string;
}

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
  isOpen,
  onClose,
  status,
  amount,
  transactionId,
  dateTime,
  paymentMethod,
  transactionType,
  recipientName,
  recipientAccount,
  bankName,
  narration,
}) => {
  if (!isOpen) return null;

  const handleDownload = async () => {
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);

    const Receipt = () => (
      <div className="w-[520px] bg-[#0E1724] text-white rounded-xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image src={images.singleLogo} alt="logo" className="w-10 h-10" />
            <span className="text-lg font-semibold">NattyPay</span>
          </div>
          <span className="text-white/70">Smart Banking</span>
        </div>
        <div className="w-full flex items-center justify-center my-3">
          <span className="bg-[#D4B139] text-black font-medium rounded-full px-4 py-1.5">Transaction Receipt</span>
        </div>
        {[
          ["Transaction Date", dateTime],
          ["Transaction ID", transactionId],
          ["Amount", `₦${amount.toLocaleString()}`],
          ["Currency", "NGN"],
          ["Transaction Type", transactionType],
          ["Sender Name", "NattyPay User"],
          ["Beneficiary Details", `${recipientName} (${recipientAccount})`],
          ["Beneficiary Bank", bankName || "NattyPay"],
          ["Narration", narration || "-"],
          ["Status", status === "success" ? "Successful" : "Failed"],
        ].map(([label, value], i) => (
          <div key={i} className="py-3">
            <div className="w-full border-t border-dashed border-white/20" />
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-white/70">{label as string}</span>
              <span className={`${label === "Status" && status === "success" ? "text-emerald-400" : "text-white"} font-medium`}>
                {value as string}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-4 text-center text-xs text-white/60">
          Thank you for banking with NattyPay. For support, contact support@nattypay.com, call +2348134146906
        </div>
      </div>
    );

    const root = (await import("react-dom/client")).createRoot(temp);
    root.render(<Receipt />);
    try {
      await new Promise((r) => setTimeout(r, 100));
      const canvas = await html2canvas(temp, { scale: 2, useCORS: true, logging: false, backgroundColor: "#0E1724" });
      const link = document.createElement("a");
      link.download = `nattypay-receipt-${transactionId || Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      document.body.removeChild(temp);
    }
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-xl max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Transaction History</h2>
          <p className="text-white/60 text-sm">View complete information about this transaction</p>
        </div>

        <div className="px-5 sm:px-6 pb-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="w-full rounded-lg bg-[#0E2C25] text-emerald-200 text-sm px-3 py-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                {status === "success" ? "Successful" : "Failed"}
              </span>
              <span className="text-white font-semibold">₦{amount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-white/70">Transaction ID</span><span className="text-white break-all">{transactionId}</span>
              <span className="text-white/70">Date & Time</span><span className="text-white">{dateTime}</span>
              <span className="text-white/70">Payment Method</span><span className="text-white">{paymentMethod}</span>
              <span className="text-white/70">Transaction Type</span><span className="text-white">{transactionType}</span>
              <span className="text-white/70">To</span><span className="text-white">{recipientName}</span>
              <span className="text-white/70">Recipient Account</span><span className="text-white">{recipientAccount}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 items-stretch mt-4">
            <CustomButton type="button" className="w-full bg-transparent border border-[#D4B139] text-white py-3.5 rounded-xl hover:bg-transparent" onClick={()=> window.open("mailto:support@nattypay.com","_blank")}>
              Contact Support
            </CustomButton>
            <CustomButton type="button" className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3.5 rounded-xl" onClick={handleDownload}>
              Download Receipt
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultModal;
