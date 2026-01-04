"use client";

import React from "react";
import { useGetCurrencyAccountTransactions } from "@/api/currency/currency.queries";
import { formatDistanceToNow } from "date-fns";
import { FiArrowDownLeft, FiArrowUpRight, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import Link from "next/link";
import EmptyState from "@/components/user/table/EmptyState";
import images from "../../../../public/images";

interface MultiCurrencyTransactionsProps {
  currency: "USD" | "EUR" | "GBP";
}

const MultiCurrencyTransactions: React.FC<MultiCurrencyTransactionsProps> = ({ currency }) => {
  const [page, setPage] = React.useState(0);
  const limit = 10;

  const { transactions, count, isPending } = useGetCurrencyAccountTransactions(currency, {
    limit,
    offset: page * limit,
  });

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <FiCheckCircle className="text-green-400" />;
      case "pending":
        return <FiClock className="text-yellow-400" />;
      case "failed":
        return <FiXCircle className="text-red-400" />;
      default:
        return <FiClock className="text-white/40" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-white/60";
    }
  };

  const totalPages = Math.ceil((count || 0) / limit);
  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex items-center justify-between gap-4">
        <h2 className="text-white text-xl sm:text-2xl font-semibold">
          Recent Transactions
        </h2>
        <Link
          className="px-5 py-2 rounded-lg text-white/80 font-medium text-sm border border-white/10 hover:bg-white/5 transition-colors"
          href="/user/transactions"
        >
          View all
        </Link>
      </div>

      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl overflow-hidden">
        {!isPending && !hasTransactions ? (
          <div className="p-8">
            <EmptyState
              image={images.emptyState.emptyTransactions}
              title="No transactions"
              path="/user/multi-currency"
              placeholder="Create an account"
              showButton={false}
            />
          </div>
        ) : (
          <>
            <div className="p-4">
              {isPending ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-3 w-24 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {transactions.map((txn: any) => (
                  <div
                    key={txn.id}
                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      txn.transaction_type === "credit" 
                        ? "bg-green-500/20" 
                        : "bg-red-500/20"
                    }`}>
                      {txn.transaction_type === "credit" ? (
                        <FiArrowDownLeft className="text-green-400 text-xl" />
                      ) : (
                        <FiArrowUpRight className="text-red-400 text-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium text-sm truncate">
                          {txn.description || txn.reference || "Transaction"}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(txn.status)}
                          <span className={`text-xs font-semibold ${getStatusColor(txn.status)}`}>
                            {txn.status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${
                          txn.transaction_type === "credit" ? "text-green-400" : "text-red-400"
                        }`}>
                          {txn.transaction_type === "credit" ? "+" : "-"}
                          {currency} {formatAmount(txn.amount)}
                        </p>
                        <p className="text-white/50 text-xs">
                          {formatDate(txn.created_at)}
                        </p>
                      </div>
                      {txn.reference && (
                        <p className="text-white/40 text-xs mt-1 truncate">
                          Ref: {txn.reference}
                        </p>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 px-4 pb-4 border-t border-white/10 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                >
                  Previous
                </button>
                <span className="text-white/60 text-sm">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
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

export default MultiCurrencyTransactions;
