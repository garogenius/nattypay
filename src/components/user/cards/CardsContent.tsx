"use client";

import React from "react";
import { FiEye, FiLock, FiUnlock, FiCreditCard, FiAlertCircle, FiPlus, FiDollarSign, FiArrowDownLeft, FiArrowUpRight, FiChevronDown } from "react-icons/fi";
import NextImage from "next/image";
import ShowCardDetailsModal from "@/components/modals/cards/ShowCardDetailsModal";
import ChangePinModal from "@/components/modals/cards/ChangePinModal";
import ResetPinModal from "@/components/modals/cards/ResetPinModal";
import SpendingLimitModal from "@/components/modals/cards/SpendingLimitModal";
import ConfirmActionModal from "@/components/modals/cards/ConfirmActionModal";
import { useGetCards, useCreateCard, useFreezeCard, useUnfreezeCard, useBlockCard, useCloseCard, useGetCurrencyAccounts } from "@/api/currency/currency.queries";
import { IVirtualCard } from "@/api/currency/currency.types";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import { getCurrencyIconByString } from "@/utils/utilityFunctions";
import useOnClickOutside from "@/hooks/useOnClickOutside";

import CardPreview from "@/components/user/cards/CardPreview";

const CardsContent: React.FC = () => {
  const [tab, setTab] = React.useState<"physical" | "virtual">("virtual");
  const [isFrozen, setIsFrozen] = React.useState(false);

  const [openDetails, setOpenDetails] = React.useState(false);
  const [openChangePin, setOpenChangePin] = React.useState(false);
  const [openResetPin, setOpenResetPin] = React.useState(false);
  const [openLimit, setOpenLimit] = React.useState(false);
  const [openFreeze, setOpenFreeze] = React.useState(false);
  const [openBlock, setOpenBlock] = React.useState(false);
  const [openClose, setOpenClose] = React.useState(false);
  const [openFund, setOpenFund] = React.useState(false);
  const [openWithdraw, setOpenWithdraw] = React.useState(false);
  const [openTransactions, setOpenTransactions] = React.useState(false);
  const [openCreateCard, setOpenCreateCard] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<IVirtualCard | null>(null);
  const [cardLabel, setCardLabel] = React.useState("");
  const [selectedCurrency, setSelectedCurrency] = React.useState<"USD" | "EUR" | "GBP">("USD");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = React.useState(false);
  const currencyDropdownRef = React.useRef<HTMLDivElement>(null);
  
  useOnClickOutside(currencyDropdownRef, () => setCurrencyDropdownOpen(false));

  // Fetch all virtual cards (USD, EUR, GBP)
  const { cards, isPending: cardsLoading, refetch: refetchCards } = useGetCards();
  const virtualCards = cards.filter((card: IVirtualCard) => 
    card.isVirtual && 
    (card.currency === "USD" || card.currency === "EUR" || card.currency === "GBP")
  );

  // Fetch currency accounts to check for account availability
  const { accounts: currencyAccounts } = useGetCurrencyAccounts();
  const supportedCurrencies: Array<"USD" | "EUR" | "GBP"> = ["USD", "EUR", "GBP"];
  const hasCurrencyAccount = (currency: "USD" | "EUR" | "GBP") => 
    currencyAccounts.some((acc: any) => (acc.currency || "").toUpperCase() === currency);

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
    setSelectedCurrency("USD"); // Reset to USD after creation
    refetchCards();
  };

  const { mutate: createCard, isPending: creatingCard } = useCreateCard(
    onCreateCardError,
    onCreateCardSuccess
  );

  const onFreezeError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to freeze card"];

    ErrorToast({
      title: "Action Failed",
      descriptions,
    });
  };

  const onFreezeSuccess = () => {
    SuccessToast({
      title: "Card Frozen",
      description: "Your card has been frozen successfully.",
    });
    setOpenFreeze(false);
    refetchCards();
  };

  const onUnfreezeError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to unfreeze card"];

    ErrorToast({
      title: "Action Failed",
      descriptions,
    });
  };

  const onUnfreezeSuccess = () => {
    SuccessToast({
      title: "Card Unfrozen",
      description: "Your card has been unfrozen successfully.",
    });
    setOpenFreeze(false);
    refetchCards();
  };

  const onBlockError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to block card"];

    ErrorToast({
      title: "Action Failed",
      descriptions,
    });
  };

  const onBlockSuccess = () => {
    SuccessToast({
      title: "Card Blocked",
      description: "Your card has been blocked permanently.",
    });
    setOpenBlock(false);
    refetchCards();
  };

  const onCloseError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to close card"];

    ErrorToast({
      title: "Action Failed",
      descriptions,
    });
  };

  const onCloseSuccess = () => {
    SuccessToast({
      title: "Card Closed",
      description: "Your card has been closed successfully.",
    });
    setOpenClose(false);
    refetchCards();
  };

  const { mutate: freezeCard } = useFreezeCard(onFreezeError, onFreezeSuccess);
  const { mutate: unfreezeCard } = useUnfreezeCard(onUnfreezeError, onUnfreezeSuccess);
  const { mutate: blockCard } = useBlockCard(onBlockError, onBlockSuccess);
  const { mutate: closeCard } = useCloseCard(onCloseError, onCloseSuccess);

  const handleCreateCard = () => {
    if (!hasCurrencyAccount(selectedCurrency)) {
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
      currency: selectedCurrency,
    });
  };

  const handleFreeze = () => {
    if (!selectedCard) return;
    if (selectedCard.status === "FROZEN") {
      unfreezeCard(selectedCard.id);
    } else {
      freezeCard(selectedCard.id);
    }
  };

  const handleBlock = () => {
    if (!selectedCard) return;
    blockCard(selectedCard.id);
  };

  const handleClose = () => {
    if (!selectedCard) return;
    closeCard(selectedCard.id);
  };

  const formatExpiry = (card: IVirtualCard) => {
    if (card.expiryMonth && card.expiryYear) {
      const month = String(card.expiryMonth).padStart(2, "0");
      const year = String(card.expiryYear).slice(-2);
      return `${month}/${year}`;
    }
    return "MM/YY";
  };

  const isCardDisabled = (card: IVirtualCard) => {
    return card.status === "BLOCKED" || card.status === "CLOSED";
  };

  const renderEmptyVirtual = () => (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-6">
      <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-xl bg-white/5 flex items-center justify-center border-4 border-white/10">
        <FiCreditCard className="text-4xl text-white/40" />
      </div>
      <div className="text-center max-w-md space-y-3">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-2">
          <p className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">Important Notice</p>
          <p className="text-white/80 text-xs sm:text-sm">• NGN cards are not available</p>
          <p className="text-white/80 text-xs sm:text-sm">• You can create virtual cards for USD, EUR, or GBP</p>
          <p className="text-white/80 text-xs sm:text-sm">• You must have a corresponding currency account before creating a virtual card</p>
        </div>
        {!hasCurrencyAccount("USD") && !hasCurrencyAccount("EUR") && !hasCurrencyAccount("GBP") ? (
          <div className="space-y-2">
            <p className="text-white/60 text-sm">You need a USD, EUR, or GBP account to create a virtual card.</p>
            <p className="text-white/40 text-xs">Please create a currency account in the Accounts page first.</p>
          </div>
        ) : (
        <p className="text-white text-sm sm:text-base mb-2">You currently do not have any virtual cards (USD, EUR, or GBP) linked to this account.</p>
        )}
      </div>
      <CustomButton
        onClick={() => setOpenCreateCard(true)}
        disabled={!hasCurrencyAccount("USD") && !hasCurrencyAccount("EUR") && !hasCurrencyAccount("GBP")}
        className="bg-[#D4B139] hover:bg-[#c7a42f] text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Virtual Card
      </CustomButton>
    </div>
  );

  const renderPhysical = () => (
    <div className="relative">
      {/* Overlay - blocks all interactions */}
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-auto">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#D4B139]/20 flex items-center justify-center border-2 border-[#D4B139]">
            <FiCreditCard className="text-3xl text-[#D4B139]" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-white/70 text-sm">Physical cards will be available soon</p>
        </div>
      </div>

      {/* Content - disabled with pointer-events-none */}
      <div className="flex flex-col gap-4 items-center pointer-events-none opacity-50">
        <div className="flex justify-center w-full">
          <CardPreview cardholder="John Doe" maskedNumber="•••• •••• •••• 1234" expiry="07/28" brand="mastercard" variant="gold" issuerName="NattyPay" status={isFrozen ? "frozen" : "active"} className="h-44 sm:h-48 max-w-sm w-full" />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <button onClick={()=> setOpenDetails(true)} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
            <FiEye />
            <span className="text-sm">Show Details</span>
          </button>
          <button onClick={() => setOpenFreeze(true)} className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors">
            {isFrozen ? <FiUnlock /> : <FiLock />}
            <span className="text-sm">{isFrozen ? "Un-freeze Card" : "Freeze Card"}</span>
          </button>
        </div>

        <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 w-full max-w-sm">
          <p className="text-white/80 text-sm mb-2">Manage Card</p>
          <div className="divide-y divide-white/10">
            <button onClick={()=> setOpenChangePin(true)} className="w-full flex items-center justify-between py-3 text-left">
              <span className="text-white text-sm">Change Pin</span>
              <FiLock className="text-white/70" />
            </button>
            <button onClick={()=> setOpenResetPin(true)} className="w-full flex items-center justify-between py-3 text-left">
              <span className="text-white text-sm">Reset Pin</span>
              <FiLock className="text-white/70" />
            </button>
            <button onClick={()=> setOpenLimit(true)} className="w-full flex items-center justify-between py-3 text-left">
              <span className="text-white text-sm">Set Spending Limit</span>
              <FiAlertCircle className="text-white/70" />
            </button>
            <button onClick={()=> setOpenBlock(true)} className="w-full flex items-center justify-between py-3 text-left">
              <span className="text-red-400 text-sm">Block Card</span>
              <FiAlertCircle className="text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVirtual = () => {
    if (cardsLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#D4B139] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (filteredVirtualCards.length === 0) {
      return renderEmptyVirtual();
    }

    return (
      <div className="flex flex-col gap-4">
        {filteredVirtualCards.map((card: IVirtualCard) => {
          const isDisabled = isCardDisabled(card);
          const isFrozen = card.status === "FROZEN";
          
          return (
            <div key={card.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 items-center md:items-start">
                <div className="flex justify-center w-full">
                  <CardPreview
                    cardholder={card.cardholder || "CARDHOLDER"}
                    maskedNumber={card.maskedNumber}
                    expiry={formatExpiry(card)}
                    brand={card.brand || "visa"}
                    variant="dark"
                    issuerName="NattyPay"
                    status={isFrozen ? "frozen" : card.status === "ACTIVE" ? "active" : "frozen"}
                    isVirtual={true}
                    className="h-44 sm:h-48 max-w-sm w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 w-full max-w-sm">
                  <div>
                    <p className="text-white/60 text-xs">Balance</p>
                    <p className="text-white text-lg font-semibold">${card.balance.toLocaleString()}</p>
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
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  <CustomButton
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenDetails(true);
                    }}
                    disabled={isDisabled}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiEye />
                    <span className="text-sm">Show Details</span>
                  </CustomButton>
                  <CustomButton
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenFund(true);
                    }}
                    disabled={isDisabled}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiDollarSign />
                    <span className="text-sm">Fund Card</span>
                  </CustomButton>
                </div>
              </div>
              <div className="mt-0 md:mt-2 rounded-xl border border-white/10 bg-white/5 p-3 h-fit">
                <p className="text-white/80 text-sm mb-2">Manage Card</p>
                <div className="divide-y divide-white/10">
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenFund(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm flex items-center gap-2">
                      <FiDollarSign className="text-sm" />
                      Fund Card
                    </span>
                    <FiArrowDownLeft className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenWithdraw(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm flex items-center gap-2">
                      <FiArrowUpRight className="text-sm" />
                      Withdraw Funds
                    </span>
                    <FiArrowUpRight className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenTransactions(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm">View Transactions</span>
                    <FiEye className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenChangePin(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm">Change Pin</span>
                    <FiLock className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenResetPin(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm">Reset Pin</span>
                    <FiLock className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenLimit(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm">Set Spending Limit</span>
                    <FiAlertCircle className="text-white/70" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenFreeze(true);
                    }}
                    disabled={isDisabled || card.status === "CLOSED"}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-white text-sm">{isFrozen ? "Un-freeze Card" : "Freeze Card"}</span>
                    {isFrozen ? <FiUnlock className="text-white/70" /> : <FiLock className="text-white/70" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenBlock(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-red-400 text-sm">Block Card</span>
                    <FiAlertCircle className="text-red-400" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCard(card);
                      setOpenClose(true);
                    }}
                    disabled={isDisabled}
                    className="w-full flex items-center justify-between py-3 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-red-400 text-sm">Close Card</span>
                    <FiAlertCircle className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Filter cards by selected currency
  const filteredVirtualCards = virtualCards.filter((card: IVirtualCard) => 
    (card.currency || "").toUpperCase() === selectedCurrency
  );

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-8 pb-10 overflow-y-auto scroll-area scroll-smooth pr-1">
        {/* Header + Currency Switcher */}
        <div className="w-full flex flex-row items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl sm:text-2xl font-semibold">Cards</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-1 hidden sm:block">Manage your virtual cards</p>
          </div>
          <div className="relative flex-shrink-0" ref={currencyDropdownRef}>
            <button
              type="button"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4B139] text-black text-xs sm:text-sm font-semibold px-3 py-1.5 uppercase whitespace-nowrap hover:bg-[#c7a42f] transition-colors"
            >
              <NextImage 
                src={getCurrencyIconByString(selectedCurrency.toLowerCase()) || ""} 
                alt="flag" 
                width={16} 
                height={16} 
                className="w-4 h-4" 
              />
              <span>{selectedCurrency} Cards</span>
              <FiChevronDown className={`text-black/80 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-600 dark:bg-bg-2200 border border-border-800 dark:border-border-700 shadow-2xl p-2 text-white z-50">
                {supportedCurrencies.map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(currency);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 ${selectedCurrency === currency ? "bg-white/10" : ""}`}
                  >
                    <NextImage 
                      src={getCurrencyIconByString(currency.toLowerCase()) || ""} 
                      alt="flag" 
                      width={18} 
                      height={18} 
                      className="w-5 h-5" 
                    />
                    <span className="text-sm flex-1 text-white">{currency} Cards</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <p className="text-white/60 text-xs sm:text-sm">Manage your virtual and physical cards</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 bg-white/5 p-1.5 sm:p-2 rounded-2xl">
            {[
              { key: "physical", label: "Physical Card" },
              { key: "virtual", label: "Virtual Cards" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`rounded-full py-1.5 sm:py-2 text-[11px] xs:text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center ${
                  tab === (t.key as any) ? "bg-white/15 text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "virtual" ? renderVirtual() : renderPhysical()}
        </div>
      </div>

      {/* Modals */}
      <ShowCardDetailsModal isOpen={openDetails} onClose={()=> { setOpenDetails(false); setSelectedCard(null); }} card={selectedCard} />
      <ChangePinModal isOpen={openChangePin} onClose={()=> { setOpenChangePin(false); setSelectedCard(null); }} cardId={selectedCard?.id} />
      <ResetPinModal isOpen={openResetPin} onClose={()=> { setOpenResetPin(false); setSelectedCard(null); }} cardId={selectedCard?.id} />
      <SpendingLimitModal isOpen={openLimit} onClose={()=> { setOpenLimit(false); setSelectedCard(null); }} card={selectedCard} />
      <ConfirmActionModal 
        isOpen={openFreeze}
        onClose={()=> { setOpenFreeze(false); setSelectedCard(null); }}
        onConfirm={handleFreeze}
        title={selectedCard?.status === "FROZEN" ? "Un-freeze Card?" : "Freeze Card?"}
        description={selectedCard?.status === "FROZEN" ? "Your card will become active for transactions." : "This will temporarily disable card transactions until un-frozen."}
        confirmText={selectedCard?.status === "FROZEN" ? "Un-freeze" : "Freeze"}
      />
      <ConfirmActionModal 
        isOpen={openBlock}
        onClose={()=> { setOpenBlock(false); setSelectedCard(null); }}
        onConfirm={handleBlock}
        title="Block Card?"
        description="This action is permanent. Your card will be blocked and you'll need to create a new one."
        confirmText="Block"
        confirmTone="danger"
      />
      <ConfirmActionModal 
        isOpen={openClose}
        onClose={()=> { setOpenClose(false); setSelectedCard(null); }}
        onConfirm={handleClose}
        title="Close Card?"
        description="This action is permanent. Your card will be closed and you'll need to create a new one."
        confirmText="Close"
        confirmTone="danger"
      />
      
      {/* Create Card Modal */}
      {openCreateCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => { setOpenCreateCard(false); setCardLabel(""); setSelectedCurrency("USD"); }} />
          <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
            <h2 className="text-white text-base font-semibold mb-4">Create Virtual Card</h2>
            <div className="flex flex-col gap-3">
              {!hasCurrencyAccount(selectedCurrency) && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-400 text-xs font-medium mb-1">{selectedCurrency} Account Required</p>
                  <p className="text-white/80 text-xs">You must have a {selectedCurrency} account before creating a virtual card. Please create a {selectedCurrency} account in the Accounts page first.</p>
                </div>
              )}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-xs font-medium mb-1">Note</p>
                <p className="text-white/80 text-xs">• NGN cards are not available</p>
                <p className="text-white/80 text-xs">• You can create virtual cards for USD, EUR, or GBP</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-white/70 text-xs">Card Label</label>
                <input
                  className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3 px-3 text-white text-sm placeholder:text-white/50 outline-none"
                  placeholder={`e.g., Personal ${selectedCurrency} Card`}
                  value={cardLabel}
                  onChange={(e) => setCardLabel(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-2">
                <CustomButton
                  onClick={() => { setOpenCreateCard(false); setCardLabel(""); setSelectedCurrency("USD"); }}
                  className="flex-1 bg-transparent border border-white/15 text-white rounded-lg py-2.5"
                >
                  Cancel
                </CustomButton>
                                  <CustomButton
                                    onClick={handleCreateCard}
                                    disabled={creatingCard || !cardLabel.trim() || !hasCurrencyAccount(selectedCurrency)}
                                    isLoading={creatingCard}
                                    className="flex-1 bg-[#D4B139] hover:bg-[#c7a42f] text-black rounded-lg py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Create Card
                                  </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CardsContent;

// Modals mounted at the end to keep DOM near the page
// Rendered alongside page root using React portal-like conditional
// We place them here for code clarity and co-location

