"use client";

import React from "react";
import NextImage from "next/image";
import images from "../../../../public/images";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import { format } from "date-fns";
import { Transaction, TRANSACTION_CATEGORY } from "@/constants/types";

const Row = ({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <div className="w-full">
    <div className="flex items-center justify-between py-3">
      <span className="text-white/70 text-xs sm:text-sm">{label}</span>
      <span className={`text-xs sm:text-sm ${strong ? "font-semibold text-white" : "text-white"}`}>{value || "-"}</span>
    </div>
    <div className="border-t border-dashed border-white/20" />
  </div>
);

const TransactionViewModal: React.FC = () => {
  const { isOpen, transaction, close } = useTransactionViewModalStore();
  const receiptRef = React.useRef<HTMLDivElement | null>(null);

  if (!isOpen || !transaction) return null;

  const tx: Transaction = transaction;
  const created = tx.createdAt ? format(new Date(tx.createdAt), "dd-MM-yyyy h:mm a") : "-";

  // resolve details safely
  const category = tx.category;
  const trxId = tx.transactionRef;
  const amountPaid = ((): string => {
    if (category === TRANSACTION_CATEGORY.TRANSFER) return `₦${tx.transferDetails?.amountPaid ?? tx.transferDetails?.amount ?? "-"}`;
    if (category === TRANSACTION_CATEGORY.DEPOSIT) return `₦${tx.depositDetails?.amountPaid ?? tx.depositDetails?.amount ?? "-"}`;
    if (category === TRANSACTION_CATEGORY.BILL_PAYMENT) return `₦${tx.billDetails?.amountPaid ?? tx.billDetails?.amount ?? "-"}`;
    return "-";
  })();

  // Derive sender/beneficiary by category with robust fallbacks
  const walletName = tx.wallet?.accountName || tx.wallet?.user?.fullname || "-";
  const walletAccount = tx.wallet?.accountNumber || "-";
  const walletBank = tx.wallet?.bankName || "NattyPay";

  let senderName = "-";
  let senderAccount = "-";
  let senderBank = "-";
  let beneficiaryName = "-";
  let beneficiaryAccount = "-";
  let beneficiaryBank = "-";

  if (category === TRANSACTION_CATEGORY.TRANSFER) {
    // Our user sending money out
    senderName = tx.transferDetails?.senderName || walletName;
    senderAccount = tx.transferDetails?.senderAccountNumber || walletAccount;
    senderBank = tx.transferDetails?.senderBankName || walletBank;

    beneficiaryName = tx.transferDetails?.beneficiaryName || "-";
    beneficiaryAccount = tx.transferDetails?.beneficiaryAccountNumber || "-";
    beneficiaryBank = tx.transferDetails?.beneficiaryBankName || "-";
  } else if (category === TRANSACTION_CATEGORY.DEPOSIT) {
    // Money coming to our user
    senderName = tx.depositDetails?.senderName || "-";
    senderAccount = tx.depositDetails?.senderAccountNumber || "-";
    senderBank = tx.depositDetails?.senderBankName || "-";

    beneficiaryName = walletName;
    beneficiaryAccount = walletAccount;
    beneficiaryBank = walletBank;
  } else if (category === TRANSACTION_CATEGORY.BILL_PAYMENT) {
    // Bill purchase: sender is our user, beneficiary is bill recipient/number
    senderName = walletName;
    senderAccount = walletAccount;
    senderBank = walletBank;

    beneficiaryName = tx.billDetails?.recipientPhone || tx.billDetails?.billerName || "-";
    beneficiaryAccount = tx.billDetails?.recipientPhone || "-";
    beneficiaryBank = tx.billDetails?.billerName || "-";
  }
  const narration = tx.description || tx.billDetails?.type || "-";
  const status = tx.status || "-";

  const handleDownload = () => {
    // Render receipt to a canvas directly (no DOM capture) to avoid tainted canvas
    const scale = 2; // for sharper output
    const width = 360; // px logical width
    let y = 24; // cursor
    const paddingX = 16;
    const lineHeight = 22;
    const sectionGap = 10;

    // Estimate height: header + items + footer
    const items = [
      ["Transaction Date", created],
      ["Transaction ID", trxId || "-"],
      ["Amount", amountPaid],
      ["Currency", "NGN"],
      ["Transaction Type", String(category)],
      ["Sender Name", senderName],
      ["Sender Account", senderAccount],
      ["Sender Bank", senderBank],
      ["Beneficiary Details", beneficiaryName],
      ["Beneficiary Account", beneficiaryAccount],
      ["Beneficiary Bank", beneficiaryBank],
      ["Narration", narration],
      ["Status", String(status)],
    ];
    const estHeight = 24 + 40 + 16 + (items.length * (lineHeight + 8)) + 80 + 24;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = estHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#0b0f1a"; // dark
    ctx.fillRect(0, 0, width, estHeight);

    // Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 14px Inter, Arial, sans-serif";
    ctx.fillText("NattyPay", paddingX, y);
    ctx.font = "400 11px Inter, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Smart Banking", width - paddingX - 90, y);
    y += 20;

    // Gold receipt chip
    const chipText = "Transaction Receipt";
    const chipPaddingX = 12;
    const chipPaddingY = 6;
    ctx.font = "600 12px Inter, Arial, sans-serif";
    const chipTextWidth = ctx.measureText(chipText).width;
    const chipW = chipTextWidth + chipPaddingX * 2;
    const chipH = 24;
    const chipX = (width - chipW) / 2;
    const chipY = y;
    ctx.fillStyle = "#D4B139";
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(chipX + r, chipY);
    ctx.lineTo(chipX + chipW - r, chipY);
    ctx.quadraticCurveTo(chipX + chipW, chipY, chipX + chipW, chipY + r);
    ctx.lineTo(chipX + chipW, chipY + chipH - r);
    ctx.quadraticCurveTo(chipX + chipW, chipY + chipH, chipX + chipW - r, chipY + chipH);
    ctx.lineTo(chipX + r, chipY + chipH);
    ctx.quadraticCurveTo(chipX, chipY + chipH, chipX, chipY + chipH - r);
    ctx.lineTo(chipX, chipY + r);
    ctx.quadraticCurveTo(chipX, chipY, chipX + r, chipY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.fillText(chipText, chipX + chipPaddingX, chipY + chipH - chipPaddingY - 2);
    y += chipH + sectionGap;

    // Rows
    items.forEach(([label, value]) => {
      ctx.font = "400 12px Inter, Arial, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(String(label), paddingX, y);
      ctx.fillStyle = "#ffffff";
      ctx.font = label === "Beneficiary Details" ? "600 12px Inter, Arial, sans-serif" : "400 12px Inter, Arial, sans-serif";
      const val = String(value ?? "-");
      // right align value
      const valWidth = ctx.measureText(val).width;
      ctx.fillText(val, width - paddingX - valWidth, y);
      y += lineHeight - 4;
      // dashed separator
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 8;
    });

    // Footer
    y += 8;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "400 10px Inter, Arial, sans-serif";
    const footer =
      "Thank you for banking with NattyPay. For support, contact us at Support@nattypay.com, call +2348134146906 or Head Office: C38C4 Suite 2nd Floor Ejison Plaza 9a New Market Road Main Market Onitsha";
    // simple wrap
    const words = footer.split(" ");
    let line = "";
    const maxWidth = width - paddingX * 2;
    words.forEach((word) => {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth) {
        ctx.fillText(line, paddingX, y);
        line = word;
        y += 14;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, paddingX, y);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `receipt-${trxId || "transaction"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 overflow-hidden">
        <div ref={receiptRef} className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 export-hide">
              <NextImage alt="logo" src={images.singleLogo} className="w-6 h-6" />
              <span className="text-white font-semibold">NattyPay</span>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Smart Banking</p>
            </div>
          </div>

          <div className="mt-4 w-full flex justify-center">
            <span className="inline-flex rounded-lg bg-[#D4B139] text-black text-xs sm:text-sm font-semibold px-4 py-2">Transaction Receipt</span>
          </div>

          <div className="mt-4 flex flex-col">
            <Row label="Transaction Date" value={created} />
            <Row label="Transaction ID" value={trxId} />
            <Row label="Amount" value={amountPaid} />
            <Row label="Currency" value="NGN" />
            <Row label="Transaction Type" value={category} />

            <Row label="Sender Name" value={senderName} />
            <Row label="Sender Account" value={senderAccount} />
            <Row label="Sender Bank" value={senderBank} />

            <Row label="Beneficiary Details" value={beneficiaryName} strong />
            <Row label="Beneficiary Account" value={beneficiaryAccount} />
            <Row label="Beneficiary Bank" value={beneficiaryBank} />

            <Row label="Narration" value={narration} />
            <Row label="Status" value={<span className="text-green-400 font-semibold">{status}</span>} />
          </div>

          <div className="mt-5 text-[11px] text-white/60 leading-relaxed">
            Thank you for banking with NattyPay. For support, contact us at Support@nattypay.com, call +2348134146906 or Head Office: C38C4 Suite 2nd Floor Ejison Plaza 9a New Market Road Main Market Onitsha
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button onClick={handleDownload} className="px-4 py-2 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black text-sm font-semibold">Download</button>
            <button onClick={close} className="px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 text-sm">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionViewModal;
