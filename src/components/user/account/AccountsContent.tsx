"use client";

import React, { useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import useUserStore from "@/store/user.store";
import { useGetNotifications } from "@/api/notifications/notifications.queries";
import { format, formatDistanceToNow } from "date-fns";
import { FiArrowDownLeft, FiArrowUpRight, FiCheckCircle, FiXCircle, FiChevronDown, FiPlus } from "react-icons/fi";
import { LuWifi } from "react-icons/lu";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import { LuCopy } from "react-icons/lu";
import CardPreview from "@/components/user/cards/CardPreview";
import ShowCardDetailsModal from "@/components/modals/cards/ShowCardDetailsModal";
import ChangePinModal from "@/components/modals/cards/ChangePinModal";
import ConfirmActionModal from "@/components/modals/cards/ConfirmActionModal";
import { useGetCurrencyAccounts, useCreateCurrencyAccount } from "@/api/currency/currency.queries";
import { ICurrencyAccount } from "@/api/currency/currency.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import Tier2UpgradeModal from "@/components/modals/tiers/Tier2UpgradeModal";
import Tier3UpgradeModal from "@/components/modals/tiers/Tier3UpgradeModal";

const AccountsContent: React.FC = () => {
  const { user } = useUserStore();
  const { open } = useTransactionViewModalStore();

  const { notifications, isPending, isError } = useGetNotifications();
  const recent = (notifications || []).slice(0, 6);
  const hasActivity = recent.length > 0;

  // Fetch currency accounts
  const { accounts: currencyAccounts, isPending: accountsLoading, refetch: refetchAccounts } = useGetCurrencyAccounts();

  const currencies: Array<"NGN" | "USD" | "EUR" | "GBP"> = ["NGN", "USD", "EUR", "GBP"];
  const initialCurrency = (user?.wallet?.[0]?.currency || "NGN").toUpperCase() as typeof currencies[number];
  const [selectedCurrency, setSelectedCurrency] = useState<typeof currencies[number]>(initialCurrency);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountLabel, setAccountLabel] = useState("");

  // Find currency account for selected currency
  const currencyAccount = useMemo(() => {
    if (selectedCurrency === "NGN") {
      // NGN uses wallet
      return null;
    }
    return currencyAccounts.find((acc: ICurrencyAccount) => 
      (acc.currency || "").toUpperCase() === selectedCurrency
    );
  }, [currencyAccounts, selectedCurrency]);

  // Fallback to wallet for NGN, or use currency account for others
  const activeWallet = useMemo(() => {
    if (selectedCurrency === "NGN") {
      return user?.wallet?.find(w => (w.currency || "").toUpperCase() === "NGN");
    }
    return null;
  }, [user?.wallet, selectedCurrency]);

  const bankName = selectedCurrency === "NGN" 
    ? (activeWallet?.bankName || "NattyPay")
    : (currencyAccount?.bankName || "NattyPay");
  const accountName = selectedCurrency === "NGN"
    ? (activeWallet?.accountName || user?.fullname || "-")
    : (currencyAccount?.label || user?.fullname || "-");
  const cardHolderOnly = (accountName || "").split("/").pop()?.trim() || accountName;
  const accountNumber = selectedCurrency === "NGN"
    ? (activeWallet?.accountNumber || "-")
    : (currencyAccount?.accountNumber || "-");
  const balance = selectedCurrency === "NGN"
    ? (activeWallet?.balance || 0)
    : (currencyAccount?.balance || 0);
  const tier = user?.tierLevel ? `Tier ${user.tierLevel === "one" ? "1" : user.tierLevel === "two" ? "2" : "3"}` : "Tier 1";

  const onCreateAccountError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create currency account"];

    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onCreateAccountSuccess = () => {
    SuccessToast({
      title: "Account Created Successfully!",
      description: `Your ${selectedCurrency} account has been created.`,
    });
    setShowCreateAccount(false);
    setAccountLabel("");
    refetchAccounts();
  };

  const { mutate: createAccount, isPending: creatingAccount } = useCreateCurrencyAccount(
    onCreateAccountError,
    onCreateAccountSuccess
  );

  const handleCreateAccount = () => {
    if (!accountLabel.trim()) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Account label is required"],
      });
      return;
    }

    createAccount({
      currency: selectedCurrency as "USD" | "EUR" | "GBP",
      label: accountLabel.trim(),
    });
  };

  // Switcher dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setMenuOpen(false));

  // Card action modals
  const [openDetails, setOpenDetails] = useState(false);
  const [openChangePin, setOpenChangePin] = useState(false);
  const [openBlock, setOpenBlock] = useState(false);
  const [openTier2Modal, setOpenTier2Modal] = useState(false);
  const [openTier3Modal, setOpenTier3Modal] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header + Currency Switcher */}
      <div className="w-full flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="w-full">
          <h1 className="text-white text-2xl font-semibold">Accounts</h1>
          <p className="text-white/60 text-sm mt-1">Manage your account settings, limits, and verification</p>
        </div>
        <div className="relative self-start sm:self-auto" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D4B139] text-black text-xs sm:text-sm font-semibold px-3 py-1.5 uppercase whitespace-nowrap"
          >
            <NextImage 
              src={getCurrencyIconByString(selectedCurrency.toLowerCase()) || ""} 
              alt="flag" 
              width={16} 
              height={16} 
              className="w-4 h-4" 
            />
            <span>{selectedCurrency} Account</span>
            <FiChevronDown className="text-black/80" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-2 text-white z-50">
              {currencies.map((k) => {
                const isNGN = k === "NGN";
                const hasWallet = isNGN && user?.wallet?.some(w => (w.currency || "").toUpperCase() === k);
                const hasCurrencyAccount = !isNGN && currencyAccounts.some((acc: ICurrencyAccount) => 
                  (acc.currency || "").toUpperCase() === k
                );
                const isSetup = !hasWallet && !hasCurrencyAccount;
                
                return (
                  <button
                    key={k}
                    onClick={() => { setSelectedCurrency(k); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 ${selectedCurrency === k ? "bg-white/10" : ""}`}
                  >
                    <NextImage 
                      src={getCurrencyIconByString(k.toLowerCase()) || ""} 
                      alt="flag" 
                      width={18} 
                      height={18} 
                      className="w-5 h-5" 
                    />
                    <span className="text-sm flex-1 text-white">{k} Account</span>
                    {isSetup && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Setup
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Account details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <h3 className="text-white font-semibold mb-4">Account Details</h3>
          
          {/* Show Create Account if account doesn't exist for non-NGN currencies */}
          {selectedCurrency !== "NGN" && !currencyAccount && !accountsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <FiPlus className="text-2xl text-white/40" />
              </div>
              <p className="text-white/60 text-sm text-center">
                You don't have a {selectedCurrency} account yet
              </p>
              {!showCreateAccount ? (
                <CustomButton
                  onClick={() => setShowCreateAccount(true)}
                  className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2.5 rounded-lg text-sm font-medium"
                >
                  Create {selectedCurrency} Account
                </CustomButton>
              ) : (
                <div className="w-full max-w-sm flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-white/70 text-xs">Account Label</label>
                    <input
                      className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                      placeholder="e.g., Personal USD Account"
                      value={accountLabel}
                      onChange={(e) => setAccountLabel(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <CustomButton
                      onClick={() => {
                        setShowCreateAccount(false);
                        setAccountLabel("");
                      }}
                      className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      onClick={handleCreateAccount}
                      disabled={creatingAccount || !accountLabel.trim()}
                      isLoading={creatingAccount}
                      className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5"
                    >
                      Create
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>
          ) : accountsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60">Bank Name</p>
                  <p className="text-white">{bankName}</p>
                </div>
                <div>
                  <p className="text-white/60">Account Name</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-white truncate">{accountName}</p>
                    <button
                      title="Copy"
                      onClick={() => navigator.clipboard.writeText(accountName)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <LuCopy className="w-4 h-4 text-white/80" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-white/60">Account Number</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-white">{accountNumber}</p>
                    <button
                      title="Copy"
                      onClick={() => navigator.clipboard.writeText(accountNumber)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <LuCopy className="w-4 h-4 text-white/80" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-white/60">Balance</p>
                  <p className="text-white">{selectedCurrency} {balance.toLocaleString()}</p>
                </div>
                {selectedCurrency === "NGN" && (
                  <div>
                    <p className="text-white/60">Account Tier</p>
                    <p className="text-white">{tier}</p>
                  </div>
                )}
                {currencyAccount?.status && (
                  <div>
                    <p className="text-white/60">Status</p>
                    <p className="text-white capitalize">{currencyAccount.status.toLowerCase()}</p>
                  </div>
                )}
              </div>

              {/* Virtual Card - Only for NGN */}
              {selectedCurrency === "NGN" && (
                <div className="mt-5">
                  <CardPreview
                    variant="gold"
                    brand="mastercard"
                    cardholder={cardHolderOnly}
                    maskedNumber={`•••• •••• •••• ${String(accountNumber).slice(-4).padStart(4, "•")}`}
                    issuerName="NattyPay"
                    className="h-52 sm:h-56 max-w-sm w-full"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Tier & Limits */}
        <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Account Tier & Limits</h3>
            <Link href="/user/settings/tiers" className="text-xs sm:text-sm text-white/80 underline underline-offset-4">Manage</Link>
          </div>

          <div className="flex flex-col gap-3">
            {/* Tier 1 */}
            <div className={`rounded-xl p-3 ${user?.tierLevel === "one" ? "border-2 border-[#D4B139] bg-white/10" : "border border-white/10 bg-white/5"}`}>
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Tier 1</p>
                <span className="text-xs px-2 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400">Completed</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Daily Debit Limit: ₦1,000,000.00 · Single Debit Limit: ₦600,000.00</p>
              <ul className="mt-2 text-xs text-white/80 space-y-1">
                <li>Phone Number</li>
                <li>BVN</li>
              </ul>
            </div>

            {/* Tier 2 */}
            <div className={`rounded-xl p-3 ${user?.tierLevel === "two" ? "border-2 border-[#D4B139] bg-white/10" : "border border-white/10 bg-white/5"}`}>
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Tier 2</p>
                <span className="text-xs px-2 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400">{(user?.tierLevel === "two" || user?.tierLevel === "three") ? "Completed" : "Upgrade"}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Daily Debit Limit: ₦5,000,000.00 · Single Debit Limit: ₦3,000,000.00</p>
              <ul className="mt-2 text-xs text-white/80 space-y-1">
                <li>NIN Verification</li>
              </ul>
              {(user?.tierLevel !== "two" && user?.tierLevel !== "three") && (
                <button
                  onClick={() => setOpenTier2Modal(true)}
                  className="inline-flex mt-2 text-xs text-black bg-[#D4B139] hover:bg-[#c7a42f] font-semibold px-3 py-1 rounded-lg w-max"
                >
                  Upgrade
                </button>
              )}
            </div>

            {/* Tier 3 */}
            <div className={`rounded-xl p-3 ${user?.tierLevel === "three" ? "border-2 border-[#D4B139] bg-white/10" : "border border-white/10 bg-white/5"}`}>
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Tier 3</p>
                <span className="text-xs px-2 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400">{user?.tierLevel === "three" ? "Completed" : "Upgrade"}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Daily Debit Limit: Unlimited · Single Debit Limit: Unlimited</p>
              <ul className="mt-2 text-xs text-white/80 space-y-1">
                <li>Address</li>
                <li>Address Verification</li>
              </ul>
              {user?.tierLevel !== "three" && (
                <button
                  onClick={() => setOpenTier3Modal(true)}
                  className="inline-flex mt-2 text-xs text-black bg-[#D4B139] hover:bg-[#c7a42f] font-semibold px-3 py-1 rounded-lg w-max"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="w-full bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-4 sm:p-5">
        <div className="w-full flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Recent Activity</h3>
          <Link href="/user/notifications" className="text-secondary font-semibold text-sm">View All</Link>
        </div>
        {isPending && !isError ? (
          <div className="w-full flex items-center justify-center py-6">
            <NextImage
              src="/images/natty01.gif"
              alt="Loading"
              width={64}
              height={64}
              className="w-12 h-12"
            />
          </div>
        ) : hasActivity ? (
          <ul className="flex flex-col gap-1.5">
            {recent.map((n, idx) => {
              const isPositive = /login|successful|completed/i.test(`${n.title} ${n.body}`);
              const Icon = isPositive ? FiCheckCircle : FiXCircle;
              return (
                <li key={n.id ?? idx} className="grid grid-cols-[auto,1fr,auto] items-center gap-3 py-2.5">
                  <div className={`w-9 h-9 rounded-md grid place-items-center ${isPositive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    <Icon className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-200 dark:text-text-800 text-sm sm:text-base truncate">{n.title}</p>
                    <p className="text-xs text-white/80 truncate">{n.body}</p>
                  </div>
                  <div className="text-[11px] text-white/70 whitespace-nowrap">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center text-text-200/70 py-8">No activity</div>
        )}
      </div>

      {/* Modals */}
      <ShowCardDetailsModal isOpen={openDetails} onClose={() => setOpenDetails(false)} />
      <ChangePinModal isOpen={openChangePin} onClose={() => setOpenChangePin(false)} />
      <ConfirmActionModal
        isOpen={openBlock}
        onClose={() => setOpenBlock(false)}
        onConfirm={() => setOpenBlock(false)}
        title="Block Card?"
        description="This action is permanent. Your card will be blocked and you'll need to create a new one."
        confirmText="Block"
        confirmTone="danger"
      />
      <Tier2UpgradeModal isOpen={openTier2Modal} onClose={() => setOpenTier2Modal(false)} />
      <Tier3UpgradeModal isOpen={openTier3Modal} onClose={() => setOpenTier3Modal(false)} />
    </div>
  );
};

export default AccountsContent;
