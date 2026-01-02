"use client";

import React, { useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import Link from "next/link";
import useNavigate from "@/hooks/useNavigate";
import useUserStore from "@/store/user.store";
import { useGetNotifications } from "@/api/notifications/notifications.queries";
import { format, formatDistanceToNow } from "date-fns";
import { FiArrowDownLeft, FiArrowUpRight, FiCheckCircle, FiXCircle, FiChevronDown, FiPlus, FiClock, FiCopy } from "react-icons/fi";
import { LuWifi } from "react-icons/lu";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useTransactionViewModalStore from "@/store/transactionViewModal.store";
import { LuCopy } from "react-icons/lu";
import CardPreview from "@/components/user/cards/CardPreview";
import ShowCardDetailsModal from "@/components/modals/cards/ShowCardDetailsModal";
import ChangePinModal from "@/components/modals/cards/ChangePinModal";
import ConfirmActionModal from "@/components/modals/cards/ConfirmActionModal";
import { useGetCurrencyAccounts, useGetCurrencyAccountByCurrency, useCreateCurrencyAccount, useGetCards, useCreateCard } from "@/api/currency/currency.queries";
import { ICurrencyAccount, IVirtualCard } from "@/api/currency/currency.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import Tier2UpgradeModal from "@/components/modals/tiers/Tier2UpgradeModal";
import Tier3UpgradeModal from "@/components/modals/tiers/Tier3UpgradeModal";
import ProfileInfoRequiredModal from "@/components/modals/ProfileInfoRequiredModal";
import { FiCreditCard } from "react-icons/fi";

const AccountsContent: React.FC = () => {
  const { user } = useUserStore();
  const { open } = useTransactionViewModalStore();
  const navigate = useNavigate();

  const { notifications, isPending, isError } = useGetNotifications();
  const recent = (notifications || []).slice(0, 6);
  const hasActivity = recent.length > 0;

  // Fetch currency accounts
  const { accounts: currencyAccounts, isPending: accountsLoading, refetch: refetchAccounts } = useGetCurrencyAccounts();

  // Fetch cards
  const { cards, isPending: cardsLoading, refetch: refetchCards } = useGetCards();
  
  // Initialize currency state first
  // Only NGN and USD are available for account creation
  const allCurrencies: Array<"NGN" | "USD" | "EUR" | "GBP"> = ["NGN", "USD", "EUR", "GBP"];
  const availableCurrencies: Array<"NGN" | "USD"> = ["NGN", "USD"]; // Only these can be created
  const currencies: Array<"NGN" | "USD" | "EUR" | "GBP"> = allCurrencies; // Show all for viewing
  const initialCurrency = (user?.wallet?.[0]?.currency || "NGN").toUpperCase() as typeof currencies[number];
  const [selectedCurrency, setSelectedCurrency] = useState<typeof currencies[number]>(initialCurrency);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountLabel, setAccountLabel] = useState("");
  const [showProfileInfoModal, setShowProfileInfoModal] = useState(false);
  const [missingInfo, setMissingInfo] = useState<"phone" | "email" | "both">("both");
  
  // Fetch specific currency account details when currency is selected
  const { account: fetchedCurrencyAccount, isPending: fetchingAccountDetails } = useGetCurrencyAccountByCurrency(
    selectedCurrency !== "NGN" ? selectedCurrency : ""
  );
  
  // Filter cards for selected currency (including NGN)
  const currencyCards = useMemo(() => {
    return cards.filter((card: IVirtualCard) => 
      card.isVirtual && 
      (card.currency || "").toUpperCase() === selectedCurrency
    );
  }, [cards, selectedCurrency]);

  // Use fetched account details if available, otherwise fall back to finding from list
  const currencyAccount = useMemo(() => {
    if (selectedCurrency === "NGN") {
      // NGN uses wallet
      return null;
    }
    
    // Prioritize fetched account details (more complete)
    if (fetchedCurrencyAccount) {
      return fetchedCurrencyAccount;
    }
    
    // Fallback to finding from list
    if (!Array.isArray(currencyAccounts) || currencyAccounts.length === 0) {
      return null;
    }
    const found = currencyAccounts.find((acc: ICurrencyAccount) => {
      if (!acc || !acc.currency) return false;
      const accCurrency = String(acc.currency).toUpperCase().trim();
      const selected = String(selectedCurrency).toUpperCase().trim();
      return accCurrency === selected;
    });
    return found || null;
  }, [fetchedCurrencyAccount, currencyAccounts, selectedCurrency]);

  // Memoize account status for each currency to avoid recalculating
  const currencyAccountStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    
    // Debug: Log currency accounts to help diagnose issues
    if (process.env.NODE_ENV === 'development' && currencyAccounts.length > 0) {
      console.log('Currency Accounts:', currencyAccounts);
    }
    
    currencies.forEach((k) => {
      const isNGN = k === "NGN";
      const hasWallet = isNGN && user?.wallet?.some(w => {
        const walletCurrency = String(w?.currency || "").toUpperCase().trim();
        return walletCurrency === k.toUpperCase();
      });
      
      // Check if account exists in list
      const hasCurrencyAccountInList = !isNGN && Array.isArray(currencyAccounts) && currencyAccounts.length > 0 && currencyAccounts.some((acc: ICurrencyAccount) => {
        if (!acc || !acc.currency) return false;
        const accCurrency = String(acc.currency).toUpperCase().trim();
        const targetCurrency = String(k).toUpperCase().trim();
        return accCurrency === targetCurrency;
      });
      
      // Check if fetched account exists (for the currently selected currency)
      const hasFetchedAccount = !isNGN && k === selectedCurrency && fetchedCurrencyAccount && fetchedCurrencyAccount.currency;
      
      status[k] = hasWallet || hasCurrencyAccountInList || hasFetchedAccount;
    });
    return status;
  }, [currencyAccounts, user?.wallet, currencies, selectedCurrency, fetchedCurrencyAccount]);

  // Fallback to wallet for NGN, or use currency account for others
  const activeWallet = useMemo(() => {
    if (selectedCurrency === "NGN") {
      return user?.wallet?.find(w => (w.currency || "").toUpperCase() === "NGN");
    }
    return null;
  }, [user?.wallet, selectedCurrency]);

  const bankName = selectedCurrency === "NGN" 
    ? (activeWallet?.bankName || "NattyPay")
    : (currencyAccount?.bankName || currencyAccount?.bank_name || "NattyPay");
  const displayName = (user?.accountType === "BUSINESS" || user?.isBusiness) && user?.businessName
    ? user.businessName
    : user?.fullname || "-";
  
  const accountName = selectedCurrency === "NGN"
    ? (activeWallet?.accountName || displayName)
    : (currencyAccount?.label || currencyAccount?.accountName || currencyAccount?.account_name || displayName);
  const cardHolderOnly = (accountName || "").split("/").pop()?.trim() || accountName;
  const accountNumber = selectedCurrency === "NGN"
    ? (activeWallet?.accountNumber || "-")
    : (currencyAccount?.accountNumber || currencyAccount?.account_number || "-");
  const balance = selectedCurrency === "NGN"
    ? (activeWallet?.balance || 0)
    : (currencyAccount?.balance || 0);
  const tier = user?.tierLevel ? `Tier ${user.tierLevel === "one" ? "1" : user.tierLevel === "two" ? "2" : user.tierLevel === "three" ? "3" : "1"}` : "Tier 1";

  const onCreateAccountError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const errorMessages = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create currency account"];

    // Check if the error is about missing phone number or email
    const hasPhoneError = errorMessages.some((msg: string) =>
      msg.toLowerCase().includes("phone number") && msg.toLowerCase().includes("required")
    );
    const hasEmailError = errorMessages.some((msg: string) =>
      msg.toLowerCase().includes("email") && msg.toLowerCase().includes("required")
    );

    // Check if the error is about missing KYC documents (passport, bank statement, etc.)
    const hasKycError = errorMessages.some((msg: string) =>
      msg.toLowerCase().includes("passport") || 
      msg.toLowerCase().includes("kyc") ||
      msg.toLowerCase().includes("document") ||
      msg.toLowerCase().includes("international passport") ||
      msg.toLowerCase().includes("utilities bill") ||
      msg.toLowerCase().includes("bank statement")
    );

    if (hasKycError) {
      ErrorToast({
        title: "KYC Profile Incomplete",
        descriptions: [
          "To create a foreign currency account, you need to complete your KYC profile.",
          "Please go to Profile Settings and complete your KYC information."
        ],
      });
      return;
    }

    // Check if the error is about ID validation (tier verification required)
    const hasIdValidationError = errorMessages.some((msg: string) =>
      msg.toLowerCase().includes("unable to validate") || 
      msg.toLowerCase().includes("verify provided id") ||
      msg.toLowerCase().includes("invalid id number")
    );

    if (hasIdValidationError) {
      ErrorToast({
        title: "Tier Verification Required",
        descriptions: [
          "To create a foreign currency account, you need to complete tier verification.",
          "Please upgrade your tier by verifying your identity in Settings."
        ],
      });
      return;
    }

    if (hasPhoneError || hasEmailError) {
      // Determine what's missing based on user data and error message
      const hasPhone = !!user?.phoneNumber;
      const hasEmail = !!user?.email;

      if (hasPhoneError && !hasEmailError) {
        setMissingInfo("phone");
      } else if (hasEmailError && !hasPhoneError) {
        setMissingInfo("email");
      } else {
        // Both are missing or error is ambiguous
        if (!hasPhone && !hasEmail) {
          setMissingInfo("both");
        } else if (!hasPhone) {
          setMissingInfo("phone");
        } else if (!hasEmail) {
          setMissingInfo("email");
        } else {
          setMissingInfo("both");
        }
      }
      setShowProfileInfoModal(true);
      return;
    }

    ErrorToast({
      title: "Creation Failed",
      descriptions: errorMessages,
    });
  };

  const onCreateAccountSuccess = async (responseData: any) => {
    SuccessToast({
      title: "Account Created Successfully!",
      description: `Your ${selectedCurrency} account has been created.`,
    });
    setShowCreateAccount(false);
    setAccountLabel("");
    // Refetch accounts to update the UI immediately and update badges
    // The mutation already invalidates the query, but we explicitly refetch to ensure UI updates
    try {
      const result = await refetchAccounts();
      // If refetch fails or returns no data, the query invalidation should still trigger a refetch
      if (!result?.data) {
        // Force a refetch after a short delay to ensure data is available
        setTimeout(() => {
          refetchAccounts();
        }, 500);
      }
    } catch (error) {
      console.error("Error refetching accounts:", error);
      // Even if refetch fails, the query invalidation should trigger a refetch
    }
  };

  const { mutate: createAccount, isPending: creatingAccount } = useCreateCurrencyAccount(
    onCreateAccountError,
    onCreateAccountSuccess
  );

  const onCreateCardError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create virtual card"];

    ErrorToast({
      title: "Creation Failed",
      descriptions,
    });
  };

  const onCreateCardSuccess = () => {
    SuccessToast({
      title: "Card Created Successfully!",
      description: `Your virtual ${selectedCurrency} card has been created.`,
    });
    setOpenCreateCard(false);
    setCardLabel("");
    refetchCards();
  };

  const { mutate: createCard, isPending: creatingCard } = useCreateCard(
    onCreateCardError,
    onCreateCardSuccess
  );

  const handleCreateCard = () => {
    // Only allow cards for USD, EUR, and GBP (not NGN)
    if (selectedCurrency === "NGN") {
      ErrorToast({
        title: "Card Not Available",
        descriptions: ["NGN virtual cards are not available. You can create virtual cards for USD, EUR, or GBP."],
      });
      return;
    }

    // Check if currency is one of the supported card currencies
    const supportedCardCurrencies: Array<"USD" | "EUR" | "GBP"> = ["USD", "EUR", "GBP"];
    if (!supportedCardCurrencies.includes(selectedCurrency as "USD" | "EUR" | "GBP")) {
      ErrorToast({
        title: "Card Not Available",
        descriptions: [`${selectedCurrency} virtual cards are not available. You can create virtual cards for USD, EUR, or GBP.`],
      });
      return;
    }

    if (!currencyAccount) {
      ErrorToast({
        title: `${selectedCurrency} Account Required`,
        descriptions: [`You must have a ${selectedCurrency} account before creating a virtual card. Please create a ${selectedCurrency} account first.`],
      });
      return;
    }

    if (!cardLabel.trim()) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Card label is required"],
      });
      return;
    }

    createCard({
      label: cardLabel.trim(),
      currency: selectedCurrency as "USD" | "EUR" | "GBP",
    });
  };

  const formatExpiry = (card: IVirtualCard) => {
    if (card.expiryMonth && card.expiryYear) {
      const month = String(card.expiryMonth).padStart(2, "0");
      const year = String(card.expiryYear).slice(-2);
      return `${month}/${year}`;
    }
    return "MM/YY";
  };

  const handleCreateAccount = () => {
    if (!accountLabel.trim()) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Account label is required"],
      });
      return;
    }

    // Only allow creating USD accounts (NGN uses wallet)
    if (selectedCurrency === "NGN") {
      ErrorToast({
        title: "Invalid Currency",
        descriptions: ["NGN accounts are managed through your wallet. Please use your NGN wallet instead."],
      });
      return;
    }

    if (!availableCurrencies.includes(selectedCurrency as "NGN" | "USD")) {
      ErrorToast({
        title: "Currency Not Available",
        descriptions: [`${selectedCurrency} account creation is not available. Only NGN and USD accounts can be created.`],
      });
      return;
    }

    createAccount({
      currency: selectedCurrency as "USD",
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
  const [openCreateCard, setOpenCreateCard] = useState(false);
  const [cardLabel, setCardLabel] = useState("");
  const [selectedCard, setSelectedCard] = useState<IVirtualCard | null>(null);

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
                const hasAccount = currencyAccountStatus[k] || false;
                const isAvailable = availableCurrencies.includes(k as "NGN" | "USD");
                
                return (
                  <button
                    key={k}
                    onClick={() => { 
                      if (isAvailable) {
                        setSelectedCurrency(k); 
                        setMenuOpen(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${
                      isAvailable 
                        ? `hover:bg-white/5 ${selectedCurrency === k ? "bg-white/10" : ""} cursor-pointer` 
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <NextImage 
                      src={getCurrencyIconByString(k.toLowerCase()) || ""} 
                      alt="flag" 
                      width={18} 
                      height={18} 
                      className="w-5 h-5" 
                    />
                    <span className="text-sm flex-1 text-white">{k} Account</span>
                    {!isAvailable ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
                        Unavailable
                      </span>
                    ) : hasAccount ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        View
                      </span>
                    ) : (
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
          {/* For NGN, check if wallet exists; for others, check if currency account exists */}
          {selectedCurrency === "NGN" && !activeWallet ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <FiPlus className="text-2xl text-white/40" />
              </div>
              <p className="text-white/60 text-sm text-center">
                NGN account (wallet) not found. Please contact support.
              </p>
            </div>
          ) : selectedCurrency !== "NGN" && !currencyAccount && !accountsLoading && !fetchingAccountDetails ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <FiPlus className="text-2xl text-white/40" />
              </div>
              {availableCurrencies.includes(selectedCurrency as "NGN" | "USD") ? (
                <>
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
                </>
              ) : (
                <div className="text-center">
                  <p className="text-white/60 text-sm mb-2">
                    {selectedCurrency} account creation is not available
                  </p>
                  <p className="text-white/40 text-xs">
                    Only NGN and USD accounts can be created at this time
                  </p>
                </div>
              )}
            </div>
          ) : (selectedCurrency === "NGN" ? false : (accountsLoading || fetchingAccountDetails)) ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (selectedCurrency === "NGN" && activeWallet) || (selectedCurrency !== "NGN" && currencyAccount) ? (
            <>
              {/* Copy All Account Details Button */}
              <div className="mb-4">
                <CustomButton
                  onClick={() => {
                    const accountDetails = `Account Name: ${accountName}\nAccount Number: ${accountNumber}\nBank Name: ${bankName}\nCurrency: ${selectedCurrency}`;
                    navigator.clipboard.writeText(accountDetails);
                    SuccessToast({
                      title: "Account Details Copied",
                      description: "All account details have been copied to clipboard",
                    });
                  }}
                  className="w-full bg-[#D4B139] hover:bg-[#c7a42f] text-black font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <FiCopy />
                  <span>Copy Account Details</span>
                </CustomButton>
              </div>

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
                      onClick={() => {
                        navigator.clipboard.writeText(accountName);
                        SuccessToast({
                          title: "Copied",
                          description: "Account name copied to clipboard",
                        });
                      }}
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
                      onClick={() => {
                        navigator.clipboard.writeText(accountNumber);
                        SuccessToast({
                          title: "Copied",
                          description: "Account number copied to clipboard",
                        });
                      }}
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

              {/* Virtual Cards - For non-NGN currencies (USD, EUR, GBP) */}
              {selectedCurrency !== "NGN" && (
                <div className="mt-5">
                  <h4 className="text-white font-medium mb-3">Virtual Cards</h4>
                  {cardsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : currencyCards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 border border-white/10 rounded-xl bg-white/5">
                      <div className="w-16 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                        <FiCreditCard className="text-2xl text-white/40" />
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-sm mb-2">No virtual {selectedCurrency} card created</p>
                        {!currencyAccount ? (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-3">
                            <p className="text-yellow-400 text-xs font-medium mb-1">{selectedCurrency} Account Required</p>
                            <p className="text-white/80 text-xs">You must have a {selectedCurrency} account before creating a virtual card. Please create a {selectedCurrency} account above first.</p>
                          </div>
                        ) : (
                          <CustomButton
                            onClick={() => navigate("/user/cards")}
                            className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 py-2 rounded-lg text-sm font-medium"
                          >
                            Create Virtual Card
                          </CustomButton>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {currencyCards.map((card: IVirtualCard) => (
                        <div key={card.id} className="border border-white/10 rounded-xl p-4 bg-white/5">
                          <CardPreview
                            variant="dark"
                            brand={card.brand || "visa"}
                            cardholder={card.cardholder || cardHolderOnly}
                            maskedNumber={card.maskedNumber}
                            expiry={formatExpiry(card)}
                            issuerName="NattyPay"
                            status={card.status === "ACTIVE" ? "active" : card.status === "FROZEN" ? "frozen" : "frozen"}
                            isVirtual={true}
                            className="h-44 sm:h-48 max-w-sm w-full"
                          />
                          <div className="mt-3 flex items-center justify-between">
                            <div>
                              <p className="text-white/60 text-xs">Balance</p>
                              <p className="text-white text-lg font-semibold">{card.currency} {card.balance.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/60 text-xs">Status</p>
                              <p className={`text-xs font-medium capitalize ${
                                card.status === "ACTIVE" ? "text-green-400" :
                                card.status === "FROZEN" ? "text-yellow-400" :
                                card.status === "BLOCKED" ? "text-red-400" :
                                "text-gray-400"
                              }`}>
                                {card.status.toLowerCase()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <CustomButton
                              onClick={() => {
                                setSelectedCard(card);
                                setOpenDetails(true);
                              }}
                              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-sm"
                            >
                              View Details
                            </CustomButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Virtual Cards - For NGN */}
              {selectedCurrency === "NGN" && (
                <div className="mt-5">
                  <h4 className="text-white font-medium mb-3">Virtual Cards</h4>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                    <p className="text-yellow-400 text-sm font-medium mb-2">NGN Cards Not Available</p>
                    <p className="text-white/80 text-xs mb-1">• NGN virtual cards are not available at this time</p>
                    <p className="text-white/80 text-xs mb-1">• You can create virtual cards for USD, EUR, or GBP</p>
                    <p className="text-white/80 text-xs">• Switch to a USD, EUR, or GBP account to create a virtual card</p>
                  </div>
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
              {user?.tierLevel === "two" && (
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
                          <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                              <FiClock className="text-3xl text-white/40" />
                            </div>
                            <div className="text-center">
                              <p className="text-white/80 text-sm font-medium mb-1">No Recent Activity</p>
                              <p className="text-white/60 text-xs">Your login history, transactions, and other activities will appear here</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Modals */}
                      <ShowCardDetailsModal isOpen={openDetails} onClose={() => { setOpenDetails(false); setSelectedCard(null); }} card={selectedCard} />
                      <ChangePinModal isOpen={openChangePin} onClose={() => { setOpenChangePin(false); setSelectedCard(null); }} />
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
                      <ProfileInfoRequiredModal
                        isOpen={showProfileInfoModal}
                        onClose={() => setShowProfileInfoModal(false)}
                        missingInfo={missingInfo}
                      />
    </div>
  );
};

export default AccountsContent;
