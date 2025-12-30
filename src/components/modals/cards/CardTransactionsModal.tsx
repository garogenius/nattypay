"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useGetCardTransactions } from "@/api/currency/currency.queries";
import { IVirtualCard } from "@/api/currency/currency.types";
import { format } from "date-fns";

interface CardTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard | null;
}

const CardTransactionsModal: React.FC<CardTransactionsModalProps> = ({ isOpen, onClose, card }) => {
  const [page, setPage] = React.useState(1);
  const limit = 10;

  const { transactions, isPending, totalPages } = useGetCardTransactions(
    card?.id || null,
    { page, limit }
  );

  if (!isOpen || !card) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full">
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-4">Card Transactions</h2>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-white/60 text-sm">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{txn.description || txn.merchant || txn.type}</p>
                    <p className="text-white/60 text-xs mt-1">{formatDate(txn.createdAt)}</p>
                    <p className={`text-xs mt-1 ${
                      txn.status === "COMPLETED" ? "text-green-400" :
                      txn.status === "PENDING" ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {txn.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      txn.type === "CREDIT" ? "text-green-400" : "text-white"
                    }`}>
                      {txn.type === "CREDIT" ? "+" : "-"}${txn.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Previous
                </button>
                <span className="text-white/60 text-sm">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardTransactionsModal;


