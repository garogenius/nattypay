"use client";

import React from "react";
import Image from "next/image";
import { CgClose } from "react-icons/cg";
import { FiPlus } from "react-icons/fi";
import { ICurrencyAccount } from "@/api/currency/currency.types";
import {
  useGetCurrencyAccountTransactions,
  useGetCurrencyAccountDeposits,
  useGetCurrencyAccountPayouts,
  useGetCurrencyAccountPayoutDestinations,
} from "@/api/currency/currency.queries";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import CreatePayoutDestinationModal from "./CreatePayoutDestinationModal";
import CreatePayoutModal from "./CreatePayoutModal";
import Loader from "@/components/Loader/Loader";

interface CurrencyAccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ICurrencyAccount;
}

const CurrencyAccountDetailsModal: React.FC<CurrencyAccountDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const [tab, setTab] = React.useState<"transactions" | "deposits" | "payouts" | "destinations">("transactions");
  const [openCreateDestination, setOpenCreateDestination] = React.useState(false);
  const [openCreatePayout, setOpenCreatePayout] = React.useState(false);
  const [transactionsPage, setTransactionsPage] = React.useState(0);
  const [depositsPage, setDepositsPage] = React.useState(0);
  const [payoutsPage, setPayoutsPage] = React.useState(0);
  const limit = 10;

  const currency = account.currency || "USD";

  const { transactions, count: transactionsCount, isPending: transactionsLoading } = useGetCurrencyAccountTransactions(
    currency,
    { limit, offset: transactionsPage * limit }
  );

  const { deposits, count: depositsCount, isPending: depositsLoading } = useGetCurrencyAccountDeposits(
    currency,
    { limit, offset: depositsPage * limit }
  );

  const { payouts, count: payoutsCount, isPending: payoutsLoading } = useGetCurrencyAccountPayouts(
    currency,
    { limit, offset: payoutsPage * limit }
  );

  const { destinations, count: destinationsCount, isPending: destinationsLoading, refetch: refetchDestinations } = useGetCurrencyAccountPayoutDestinations(currency);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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

  if (!isOpen) return null;

  const transactionsTotalPages = Math.ceil((transactionsCount || 0) / limit);
  const depositsTotalPages = Math.ceil((depositsCount || 0) / limit);
  const payoutsTotalPages = Math.ceil((payoutsCount || 0) / limit);

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-4xl max-h-[92vh] rounded-2xl overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors z-10"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        {/* Header */}
        <div className="px-5 sm:px-6 pt-1 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={getCurrencyIconByString(currency.toLowerCase()) || ""}
              alt={currency}
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div>
              <h2 className="text-white text-base sm:text-lg font-semibold">
                {account.accountName || account.label || `${currency} Account`}
              </h2>
              <p className="text-white/60 text-sm">{account.accountNumber || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-white/60 text-xs">Balance</p>
              <p className="text-white text-2xl font-bold">
                {currency} {formatAmount(account.balance || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Bank</p>
              <p className="text-white text-sm font-medium">{account.bankName || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-6 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { key: "transactions", label: "Transactions" },
              { key: "deposits", label: "Deposits" },
              { key: "payouts", label: "Payouts" },
              { key: "destinations", label: "Destinations" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === (t.key as any)
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-4">
          {tab === "transactions" && (
            <div className="py-4">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-white/60 text-sm">No transactions found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {transactions.map((txn: any) => (
                      <div
                        key={txn.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${
                                txn.transaction_type === "credit"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {txn.transaction_type?.toUpperCase()}
                            </span>
                            <span className={`text-xs font-medium ${getStatusColor(txn.status)}`}>
                              {txn.status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white text-sm font-medium">{txn.description || "Transaction"}</p>
                          <p className="text-white/60 text-xs mt-1">{formatDate(txn.created_at)}</p>
                          {txn.reference && (
                            <p className="text-white/40 text-xs mt-1">Ref: {txn.reference}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              txn.transaction_type === "credit" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {txn.transaction_type === "credit" ? "+" : "-"}
                            {currency} {formatAmount(txn.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {transactionsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setTransactionsPage((p) => Math.max(0, p - 1))}
                        disabled={transactionsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {transactionsPage + 1} of {transactionsTotalPages}
                      </span>
                      <button
                        onClick={() => setTransactionsPage((p) => Math.min(transactionsTotalPages - 1, p + 1))}
                        disabled={transactionsPage >= transactionsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "deposits" && (
            <div className="py-4">
              {depositsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : !deposits || deposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-white/60 text-sm">No deposits found</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {deposits.map((deposit: any) => (
                      <div
                        key={deposit.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${getStatusColor(deposit.status)}`}>
                              {deposit.status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white text-sm font-medium">Deposit</p>
                          <p className="text-white/60 text-xs mt-1">{formatDate(deposit.created_at)}</p>
                          {deposit.reference && (
                            <p className="text-white/40 text-xs mt-1">Ref: {deposit.reference}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            +{currency} {formatAmount(deposit.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {depositsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setDepositsPage((p) => Math.max(0, p - 1))}
                        disabled={depositsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {depositsPage + 1} of {depositsTotalPages}
                      </span>
                      <button
                        onClick={() => setDepositsPage((p) => Math.min(depositsTotalPages - 1, p + 1))}
                        disabled={depositsPage >= depositsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "payouts" && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Payouts</h3>
                <button
                  onClick={() => setOpenCreatePayout(true)}
                  className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="text-base" />
                  <span>Create Payout</span>
                </button>
              </div>
              {payoutsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : !payouts || payouts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-white/60 text-sm mb-4">No payouts found</p>
                  <button
                    onClick={() => setOpenCreatePayout(true)}
                    className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create First Payout
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {payouts.map((payout: any) => (
                      <div
                        key={payout.id}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium ${getStatusColor(payout.status)}`}>
                              {payout.status?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-white text-sm font-medium">Payout</p>
                          <p className="text-white/60 text-xs mt-1">{formatDate(payout.created_at)}</p>
                          {payout.reference && (
                            <p className="text-white/40 text-xs mt-1">Ref: {payout.reference}</p>
                          )}
                          {payout.fee && (
                            <p className="text-white/40 text-xs mt-1">Fee: {currency} {formatAmount(payout.fee)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-400">
                            -{currency} {formatAmount(payout.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {payoutsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setPayoutsPage((p) => Math.max(0, p - 1))}
                        disabled={payoutsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {payoutsPage + 1} of {payoutsTotalPages}
                      </span>
                      <button
                        onClick={() => setPayoutsPage((p) => Math.min(payoutsTotalPages - 1, p + 1))}
                        disabled={payoutsPage >= payoutsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "destinations" && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Payout Destinations</h3>
                <button
                  onClick={() => setOpenCreateDestination(true)}
                  className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="text-base" />
                  <span>Add Destination</span>
                </button>
              </div>
              {destinationsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader />
                </div>
              ) : !destinations || destinations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-white/60 text-sm mb-4">No payout destinations found</p>
                  <button
                    onClick={() => setOpenCreateDestination(true)}
                    className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add First Destination
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {destinations.map((dest: any) => (
                    <div
                      key={dest.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                            {dest.type?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-white text-sm font-medium">{dest.account_name}</p>
                        <p className="text-white/60 text-xs mt-1">{dest.account_number}</p>
                        {dest.bank_name && (
                          <p className="text-white/60 text-xs mt-1">{dest.bank_name}</p>
                        )}
                        <p className="text-white/40 text-xs mt-1">Added {formatDate(dest.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <CreatePayoutDestinationModal
          isOpen={openCreateDestination}
          onClose={() => setOpenCreateDestination(false)}
          account={account}
          onSuccess={() => {
            setOpenCreateDestination(false);
            refetchDestinations();
          }}
        />
        <CreatePayoutModal
          isOpen={openCreatePayout}
          onClose={() => setOpenCreatePayout(false)}
          account={account}
          destinations={destinations || []}
          onSuccess={() => {
            setOpenCreatePayout(false);
            setTab("payouts");
          }}
        />
      </div>
    </div>
  );
};

export default CurrencyAccountDetailsModal;






