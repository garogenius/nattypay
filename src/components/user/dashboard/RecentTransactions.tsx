"use client";

import { useGetTransactions } from "@/api/wallet/wallet.queries";

import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { useTheme } from "@/store/theme.store";
import { TRANSACTION_CATEGORY } from "@/constants/types";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import { format } from "date-fns";
import { LuWifi, LuSmartphone } from "react-icons/lu";
import { FiArrowDownLeft, FiArrowUpRight, FiInbox } from "react-icons/fi";

const RecentTransactions = () => {
  const theme = useTheme();
  const pageSize = 6;
  const pageNumber = 1;

  const { transactionsData, isPending, isError } = useGetTransactions({
    page: pageNumber,
    limit: pageSize,
  });

  const { open } = useTransactionViewModalStore();

  const hasTransactions =
    transactionsData?.transactions && transactionsData.transactions.length > 0;
  const tableLoading = isPending && !isError;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 rounded-2xl p-4 sm:p-5 h-full min-h-[400px] flex flex-col">
        <div className="w-full flex items-center justify-between mb-2">
          <h2 className="text-text-200 dark:text-text-800 text-lg sm:text-xl font-semibold">
            Recent Transactions
          </h2>
          <Link href="/user/transactions" className="text-secondary font-semibold text-sm">
            View All
          </Link>
        </div>
        <div className="flex-1 flex flex-col">
          {tableLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(6)].map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-8"
                  baseColor={theme === "light" ? "#e0e0e0" : "#202020"}
                  highlightColor={theme === "light" ? "#f5f5f5" : "#444444"}
                />
              ))}
            </div>
          ) : hasTransactions ? (
            <ul className="flex flex-col gap-2">
              {(transactionsData?.transactions || []).slice(0, 6).map((tx, idx) => {
                const category = tx.category as TRANSACTION_CATEGORY;
                const isIncoming =
                  category === TRANSACTION_CATEGORY.DEPOSIT ||
                  tx?.depositDetails?.amountPaid > 0;
                const amount =
                  category === TRANSACTION_CATEGORY.TRANSFER
                    ? tx.transferDetails?.amountPaid
                    : category === TRANSACTION_CATEGORY.DEPOSIT
                    ? tx.depositDetails?.amountPaid
                    : tx.billDetails?.amountPaid;
                const title =
                  category === TRANSACTION_CATEGORY.BILL_PAYMENT
                    ? `${tx.billDetails?.type} Purchase`
                    : category === TRANSACTION_CATEGORY.TRANSFER
                    ? `Transfer to ${tx.transferDetails?.beneficiaryName ?? "Beneficiary"}`
                    : `Transfer From ${tx.depositDetails?.senderName ?? "Sender"}`;
                const iconNode =
                  category === TRANSACTION_CATEGORY.BILL_PAYMENT ? (
                    <LuWifi className="text-lg" />
                  ) : isIncoming ? (
                    <FiArrowDownLeft className="text-lg" />
                  ) : (
                    <FiArrowUpRight className="text-lg" />
                  );
                return (
                  <li key={idx} className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-3 py-3">
                    <div className={`w-9 h-9 rounded-md grid place-items-center ${
                      isIncoming ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {iconNode}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-200 dark:text-text-800 text-sm sm:text-base truncate">{title}</p>
                      <p className="text-[11px] text-white">{format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div className={`text-sm sm:text-base font-semibold ${
                      isIncoming ? "text-green-500" : "text-red-500"
                    }`}>
                      {isIncoming ? "+" : "-"}₦{Number(amount || 0).toLocaleString()}
                    </div>
                    <button onClick={() => open(tx)} className="text-white/90 hover:text-white underline underline-offset-4 text-xs sm:text-sm">View</button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 dark:bg-white/5 flex items-center justify-center mb-4">
                <FiInbox className="text-2xl text-text-200/40 dark:text-text-800/40" />
              </div>
              <h3 className="text-text-200 dark:text-text-800 text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-text-200/60 dark:text-text-800/60 text-sm text-center">
                Your recent transactions will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;
