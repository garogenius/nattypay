"use client";

import React from "react";
import { FiEdit2, FiTrash2, FiPlus, FiCopy, FiArrowDownLeft, FiArrowUpRight, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { LuCopy } from "react-icons/lu";
import {
  useGetCurrencyAccountByCurrency,
  useGetCurrencyAccountTransactions,
  useGetCurrencyAccountDeposits,
  useGetCurrencyAccountPayouts,
  useGetCurrencyAccountPayoutDestinations,
  useUpdateCurrencyAccount,
  useCloseCurrencyAccount,
} from "@/api/currency/currency.queries";
import { ICurrencyAccount } from "@/api/currency/currency.types";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import UpdateCurrencyAccountModal from "@/components/modals/currency/UpdateCurrencyAccountModal";
import CloseCurrencyAccountModal from "@/components/modals/currency/CloseCurrencyAccountModal";
import CreatePayoutDestinationModal from "@/components/modals/currency/CreatePayoutDestinationModal";
import CreatePayoutModal from "@/components/modals/currency/CreatePayoutModal";
import { formatDistanceToNow } from "date-fns";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import Image from "next/image";
import EmptyState from "@/components/user/table/EmptyState";
import images from "../../../../public/images";

interface MultiCurrencyAccountDetailsProps {
  currency: "USD" | "EUR" | "GBP";
  onRefetch: () => void;
}

const MultiCurrencyAccountDetails: React.FC<MultiCurrencyAccountDetailsProps> = ({
  currency,
  onRefetch,
}) => {
  const [tab, setTab] = React.useState<"transactions" | "deposits" | "payouts" | "destinations">("transactions");
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [openClose, setOpenClose] = React.useState(false);
  const [openCreateDestination, setOpenCreateDestination] = React.useState(false);
  const [openCreatePayout, setOpenCreatePayout] = React.useState(false);
  const [transactionsPage, setTransactionsPage] = React.useState(0);
  const [depositsPage, setDepositsPage] = React.useState(0);
  const [payoutsPage, setPayoutsPage] = React.useState(0);
  const limit = 10;

  const { account, isPending: accountLoading, refetch: refetchAccount } = useGetCurrencyAccountByCurrency(currency);
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
  const { destinations, isPending: destinationsLoading, refetch: refetchDestinations } = useGetCurrencyAccountPayoutDestinations(currency);

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

  const handleUpdateSuccess = () => {
    setOpenUpdate(false);
    refetchAccount();
    onRefetch();
  };

  const handleCloseSuccess = () => {
    setOpenClose(false);
    refetchAccount();
    onRefetch();
  };

  const handleCreateDestinationSuccess = () => {
    setOpenCreateDestination(false);
    refetchDestinations();
  };

  const handleCreatePayoutSuccess = () => {
    setOpenCreatePayout(false);
    setTab("payouts");
    refetchAccount();
    onRefetch();
  };

  if (!account && !accountLoading) {
    return (
      <div className="rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-sm">No {currency} account found</p>
      </div>
    );
  }

  const transactionsTotalPages = Math.ceil((transactionsCount || 0) / limit);
  const depositsTotalPages = Math.ceil((depositsCount || 0) / limit);
  const payoutsTotalPages = Math.ceil((payoutsCount || 0) / limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Account Details Card */}
      <div className="rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 p-4 sm:p-6">
        {accountLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="h-3 w-20 bg-white/10 rounded mb-2 animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : account ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Image
                  src={getCurrencyIconByString(currency.toLowerCase()) || ""}
                  alt={currency}
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <div>
                  <h2 className="text-white text-lg sm:text-xl font-semibold">
                    {account.accountName || account.label || `${currency} Account`}
                  </h2>
                  <p className="text-white/60 text-sm">{currency} Account Details</p>
                </div>
              </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOpenUpdate(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              <FiEdit2 className="text-base" />
              <span className="hidden sm:inline">Edit Label</span>
            </button>
            <button
              onClick={() => setOpenClose(true)}
              disabled={account.balance && account.balance > 0}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiTrash2 className="text-base" />
              <span className="hidden sm:inline">Close Account</span>
            </button>
            </div>
          </div>

          {/* Account Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Account Number</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium">{account.accountNumber || "N/A"}</p>
              {account.accountNumber && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(account.accountNumber || "");
                    SuccessToast({
                      title: "Copied",
                      description: "Account number copied to clipboard",
                    });
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="Copy"
                >
                  <LuCopy className="w-4 h-4 text-white/80" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Bank Name</p>
            <p className="text-white text-sm font-medium">{account.bankName || "N/A"}</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Balance</p>
            <p className="text-white text-lg font-bold">
              {currency} {formatAmount(account.balance || 0)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Account Name</p>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium truncate">{account.accountName || account.label || "N/A"}</p>
              {account.accountName && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(account.accountName || "");
                    SuccessToast({
                      title: "Copied",
                      description: "Account name copied to clipboard",
                    });
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  title="Copy"
                >
                  <LuCopy className="w-4 h-4 text-white/80" />
                </button>
              )}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Status</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              account.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
              account.status === "INACTIVE" ? "bg-gray-500/20 text-gray-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {account.status || "ACTIVE"}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white/60 text-xs mb-1">Currency</p>
            <p className="text-white text-sm font-medium">{currency}</p>
          </div>
        </div>

          {/* Copy All Details Button */}
          <CustomButton
            onClick={() => {
              const accountDetails = `Account Name: ${account.accountName || account.label || "N/A"}\nAccount Number: ${account.accountNumber || "N/A"}\nBank Name: ${account.bankName || "N/A"}\nBalance: ${currency} ${formatAmount(account.balance || 0)}\nCurrency: ${currency}`;
              navigator.clipboard.writeText(accountDetails);
              SuccessToast({
                title: "Account Details Copied",
                description: "All account details have been copied to clipboard",
              });
            }}
            className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            <FiCopy />
            <span>Copy All Account Details</span>
          </CustomButton>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-white/60 text-sm">No {currency} account found</p>
          </div>
        )}
      </div>

      {/* Tabs Section */}
      {account && (
        <div className="rounded-2xl bg-bg-600 dark:bg-bg-1100 border border-white/10 overflow-hidden">
          {/* Tabs Header */}
          <div className="px-4 sm:px-6 pt-4 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { key: "transactions", label: "Transactions" },
                { key: "deposits", label: "Deposits" },
                { key: "payouts", label: "Payouts" },
                { key: "destinations", label: "Payout Destinations" },
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
          <div className="p-4 sm:p-6">
          {tab === "transactions" && (
            <div>
              {!transactionsLoading && (!transactions || transactions.length === 0) ? (
                <EmptyState
                  image={images.emptyState.emptyTransactions}
                  title="No transactions"
                  path="/user/multi-currency"
                  placeholder="Transactions will appear here"
                  showButton={false}
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {transactions.map((txn: any) => (
                      <div
                        key={txn.id}
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusIcon(txn.status)}
                              <span className={`text-xs font-semibold ${getStatusColor(txn.status)}`}>
                                {txn.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
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
                  {transactionsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setTransactionsPage((p) => Math.max(0, p - 1))}
                        disabled={transactionsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {transactionsPage + 1} of {transactionsTotalPages}
                      </span>
                      <button
                        onClick={() => setTransactionsPage((p) => Math.min(transactionsTotalPages - 1, p + 1))}
                        disabled={transactionsPage >= transactionsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
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
            <div>
              {!depositsLoading && (!deposits || deposits.length === 0) ? (
                <EmptyState
                  image={images.emptyState.emptyTransactions}
                  title="No deposits"
                  path="/user/multi-currency"
                  placeholder="Deposits will appear here"
                  showButton={false}
                />
              ) : (
                <>
                  <div className="space-y-3">
                    {deposits.map((deposit: any) => (
                      <div
                        key={deposit.id}
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/20">
                          <FiArrowDownLeft className="text-green-400 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium text-sm">Deposit</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusIcon(deposit.status)}
                              <span className={`text-xs font-semibold ${getStatusColor(deposit.status)}`}>
                                {deposit.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="text-sm font-semibold text-green-400">
                              +{currency} {formatAmount(deposit.amount)}
                            </p>
                            <p className="text-white/50 text-xs">
                              {formatDate(deposit.created_at)}
                            </p>
                          </div>
                          {deposit.reference && (
                            <p className="text-white/40 text-xs mt-1 truncate">
                              Ref: {deposit.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {depositsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setDepositsPage((p) => Math.max(0, p - 1))}
                        disabled={depositsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {depositsPage + 1} of {depositsTotalPages}
                      </span>
                      <button
                        onClick={() => setDepositsPage((p) => Math.min(depositsTotalPages - 1, p + 1))}
                        disabled={depositsPage >= depositsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Payout History</h3>
                <button
                  onClick={() => setOpenCreatePayout(true)}
                  className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="text-base" />
                  <span className="hidden sm:inline">Create Payout</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
              {!payoutsLoading && (!payouts || payouts.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <EmptyState
                    image={images.emptyState.emptyTransactions}
                    title="No payouts"
                    path="/user/multi-currency"
                    placeholder="Create your first payout"
                    showButton={false}
                  />
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
                        className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/20">
                          <FiArrowUpRight className="text-red-400 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium text-sm">Payout</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusIcon(payout.status)}
                              <span className={`text-xs font-semibold ${getStatusColor(payout.status)}`}>
                                {payout.status?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="text-sm font-semibold text-red-400">
                                -{currency} {formatAmount(payout.amount)}
                              </p>
                              {payout.fee && (
                                <p className="text-white/40 text-xs mt-0.5">
                                  Fee: {currency} {formatAmount(payout.fee)}
                                </p>
                              )}
                            </div>
                            <p className="text-white/50 text-xs">
                              {formatDate(payout.created_at)}
                            </p>
                          </div>
                          {payout.reference && (
                            <p className="text-white/40 text-xs mt-1 truncate">
                              Ref: {payout.reference}
                            </p>
                          )}
                          {payout.description && (
                            <p className="text-white/60 text-xs mt-1 truncate">
                              {payout.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {payoutsTotalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-white/10">
                      <button
                        onClick={() => setPayoutsPage((p) => Math.max(0, p - 1))}
                        disabled={payoutsPage === 0}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-white/60 text-sm">
                        Page {payoutsPage + 1} of {payoutsTotalPages}
                      </span>
                      <button
                        onClick={() => setPayoutsPage((p) => Math.min(payoutsTotalPages - 1, p + 1))}
                        disabled={payoutsPage >= payoutsTotalPages - 1}
                        className="px-4 py-2 rounded-lg border border-white/10 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
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
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Payout Destinations</h3>
                <button
                  onClick={() => setOpenCreateDestination(true)}
                  className="flex items-center gap-2 bg-[#D4B139] hover:bg-[#c7a42f] text-black px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiPlus className="text-base" />
                  <span className="hidden sm:inline">Add Destination</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
              {!destinationsLoading && (!destinations || destinations.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <EmptyState
                    image={images.emptyState.emptyTransactions}
                    title="No payout destinations"
                    path="/user/multi-currency"
                    placeholder="Add your first destination"
                    showButton={false}
                  />
                  <button
                    onClick={() => setOpenCreateDestination(true)}
                    className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Add First Destination
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {destinations.map((dest: any) => (
                    <div
                      key={dest.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          {dest.type?.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-white/60 text-xs mb-0.5">Account Name</p>
                          <p className="text-white text-sm font-medium">{dest.account_name}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-0.5">Account Number</p>
                          <p className="text-white text-sm font-mono">{dest.account_number}</p>
                        </div>
                        {dest.bank_name && (
                          <div>
                            <p className="text-white/60 text-xs mb-0.5">Bank</p>
                            <p className="text-white text-sm">{dest.bank_name}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-white/40 text-xs mt-2">
                            Added {formatDate(dest.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Modals */}
      {account && (
        <>
          <UpdateCurrencyAccountModal
            isOpen={openUpdate}
            onClose={() => setOpenUpdate(false)}
            account={account}
            onSuccess={handleUpdateSuccess}
          />
          <CloseCurrencyAccountModal
            isOpen={openClose}
            onClose={() => setOpenClose(false)}
            account={account}
            onSuccess={handleCloseSuccess}
          />
          <CreatePayoutDestinationModal
            isOpen={openCreateDestination}
            onClose={() => setOpenCreateDestination(false)}
            account={account}
            onSuccess={handleCreateDestinationSuccess}
          />
          <CreatePayoutModal
            isOpen={openCreatePayout}
            onClose={() => setOpenCreatePayout(false)}
            account={account}
            destinations={destinations || []}
            onSuccess={handleCreatePayoutSuccess}
          />
        </>
      )}
    </div>
  );
};

export default MultiCurrencyAccountDetails;


