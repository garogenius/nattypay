"use client";

import React from "react";
import Image from "next/image";
import images from "../../../../public/images";
import TransferTypeCards from "@/components/shared/TransferTypeCards";
import PaymentTransferForm from "./PaymentTransferForm";
import { useGetTransactions } from "@/api/wallet/wallet.queries";
import { useGetBeneficiaries } from "@/api/user/user.queries";
import { BENEFICIARY_TYPE, TRANSFER_TYPE } from "@/constants/types";
import CustomButton from "@/components/shared/Button";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import { format } from "date-fns";

interface PaymentTransferTabProps {
  transferType: "nattypay" | "bank" | "merchant" | null;
  setTransferType: (type: "nattypay" | "bank" | "merchant") => void;
}

const PaymentTransferTab: React.FC<PaymentTransferTabProps> = ({ transferType, setTransferType }) => {
  const { transactionsData } = useGetTransactions({ page: 1, limit: 8 });
  const [recentTab, setRecentTab] = React.useState<"recent" | "saved">("recent");
  const { beneficiaries } = useGetBeneficiaries({
    category: BENEFICIARY_TYPE.TRANSFER,
    transferType: transferType === "bank" ? TRANSFER_TYPE.INTER : TRANSFER_TYPE.INTRA,
  });

  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [sessionId, setSessionId] = React.useState("");
  const [amount, setAmount] = React.useState("");

  const { open } = useTransactionViewModalStore();
  const handleViewReceipt = (tx: any) => {
    // Open the global transaction view modal with the selected transaction
    open(tx);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Type + Form */}
      <div className="flex flex-col gap-5">
        <TransferTypeCards
          items={[
            { key: "nattypay", title: "To NattyPay", desc: "Send money instantly and free to NattyPay users" },
            { key: "bank", title: "To Banks", desc: "Send money securely to any bank account" },
            { key: "merchant", title: "To Merchant", desc: "Pay merchants easily with your NattyPay account" },
          ]}
          value={(transferType || "nattypay") as any}
          onChange={(k) => setTransferType(k as any)}
        />

        <PaymentTransferForm
          type={(transferType === "bank" ? "bank" : "nattypay")}
          accountNumber={accountNumber}
          setAccountNumber={setAccountNumber}
          accountName={accountName}
          setAccountName={setAccountName}
          sessionId={sessionId}
          setSessionId={setSessionId}
          amount={amount}
          setAmount={setAmount}
        />
      </div>

      {/* Right: Recent + Saved Beneficiary */}
      <div className="rounded-2xl border border-border-800 dark:border-border-700 bg-bg-600 dark:bg-bg-1100 p-4">
        <div className="flex items-center gap-6 border-b border-white/10 mb-3">
          <button
            className={`py-2 text-sm font-medium transition-colors ${
              recentTab === "recent" ? "text-[#D4B139] border-b-2 border-[#D4B139]" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setRecentTab("recent")}
          >
            Recent Transactions
          </button>
          <button
            className={`py-2 text-sm font-medium transition-colors ${
              recentTab === "saved" ? "text-[#D4B139] border-b-2 border-[#D4B139]" : "text-white/60 hover:text-white"
            }`}
            onClick={() => setRecentTab("saved")}
          >
            Saved Beneficiary
          </button>
        </div>
        {recentTab === "saved" ? (
          <div className="w-full flex flex-col divide-y divide-white/5 rounded-lg overflow-hidden">
            {beneficiaries?.slice(0, 6).map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setAccountNumber(b.accountNumber || "");
                }}
                className="w-full flex items-center justify-between gap-3 px-2 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-500/20 grid place-items-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-white text-sm font-medium leading-tight">{b.accountName}</p>
                    <p className="text-white/70 text-xs leading-tight">{b.accountNumber}</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white/60"><path fill="currentColor" d="M9.29 6.71a1 1 0 0 0 0 1.41L13.17 12l-3.88 3.88a1 1 0 1 0 1.42 1.41l4.59-4.58a1 1 0 0 0 0-1.41L10.71 6.7a1 1 0 0 0-1.42.01Z"/></svg>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/10">
            {transactionsData?.transactions?.slice(0, 8).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 hover:bg-white/5 rounded px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary grid place-items-center">
                    <Image src={images.singleLogo} alt="logo" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{tx.description || "Transfer"}</p>
                    <p className="text-white/50 text-xs">{format(new Date(tx.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CustomButton type="button" className="border border-[#D4B139] text-white px-3 py-1.5 rounded-lg bg-transparent" onClick={() => handleViewReceipt(tx)}>
                    View
                  </CustomButton>
                </div>
              </div>
            )) || (
              <p className="text-white/50 text-sm py-6 text-center">No recent transactions</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTransferTab;
