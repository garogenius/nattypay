"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useCreateCurrencyAccountPayout, useGetTransferFee } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { ICurrencyAccount, IPayoutDestination } from "@/api/currency/currency.types";
import PinInputWithFingerprint from "@/components/shared/PinInputWithFingerprint";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface CreatePayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ICurrencyAccount;
  destinations: IPayoutDestination[];
  onSuccess: () => void;
}

const CreatePayoutModal: React.FC<CreatePayoutModalProps> = ({
  isOpen,
  onClose,
  account,
  destinations,
  onSuccess,
}) => {
  const [selectedDestination, setSelectedDestination] = React.useState<IPayoutDestination | null>(null);
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [walletPin, setWalletPin] = React.useState("");
  const [destinationOpen, setDestinationOpen] = React.useState(false);
  const destinationRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(destinationRef, () => setDestinationOpen(false));

  const currency = account.currency || "USD";
  const accountNumber = account.accountNumber || "";

  // Calculate fee when amount and destination are selected
  const { feeData, isPending: feeLoading } = useGetTransferFee({
    currency,
    amount: Number(amount) || 0,
    accountNumber: selectedDestination?.account_number || "",
    enabled: !!selectedDestination && Number(amount) > 0 && !!selectedDestination.account_number,
  });

  React.useEffect(() => {
    if (isOpen) {
      setSelectedDestination(null);
      setAmount("");
      setReference("");
      setDescription("");
      setWalletPin("");
      setDestinationOpen(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedDestination(null);
    setAmount("");
    setReference("");
    setDescription("");
    setWalletPin("");
    setDestinationOpen(false);
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to create payout"];
    ErrorToast({
      title: "Payout Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Payout Created",
      description: "Payout created successfully",
    });
    handleClose();
    onSuccess();
  };

  const { mutate: createPayout, isPending } = useCreateCurrencyAccountPayout(onError, onSuccessCallback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestination || !amount || Number(amount) <= 0 || walletPin.length !== 4) return;

    createPayout({
      currency,
      formdata: {
        destinationId: selectedDestination.id,
        amount: Number(amount),
        reference: reference.trim() || undefined,
        description: description.trim() || undefined,
      },
    });
  };

  if (!isOpen || !account) return null;

  const canSubmit =
    !!selectedDestination &&
    Number(amount) > 0 &&
    Number(amount) <= (account.balance || 0) &&
    walletPin.length === 4;
  const totalAmount = feeData ? Number(amount) + feeData.fee : Number(amount);
  const hasInsufficientBalance = Number(amount) > (account.balance || 0);

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={handleClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">Create Payout</h2>
          <p className="text-white/60 text-sm mt-1">Send funds from your {currency} account</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          {/* Destination Selection */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Payout Destination</label>
            <div className="relative" ref={destinationRef}>
              <button
                type="button"
                onClick={() => setDestinationOpen(!destinationOpen)}
                className="w-full flex items-center justify-between bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white"
              >
                <span>
                  {selectedDestination
                    ? `${selectedDestination.account_name} - ${selectedDestination.account_number}`
                    : "Select destination"}
                </span>
                <svg
                  className={`w-5 h-5 text-white/60 transition-transform ${destinationOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {destinationOpen && (
                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-bg-600 dark:bg-bg-1100 border border-border-600 rounded-lg">
                  {destinations.length === 0 ? (
                    <div className="p-3 text-white/60 text-sm">No destinations available</div>
                  ) : (
                    destinations.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => {
                          setSelectedDestination(dest);
                          setDestinationOpen(false);
                        }}
                        className="w-full px-3 py-3 text-left hover:bg-white/5 transition-colors text-white border-b border-white/5 last:border-b-0"
                      >
                        <div className="font-medium">{dest.account_name}</div>
                        <div className="text-xs text-white/60">{dest.account_number}</div>
                        {dest.bank_name && <div className="text-xs text-white/60">{dest.bank_name}</div>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Amount ({currency})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                  setAmount(value);
                }
              }}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
            />
            {hasInsufficientBalance && (
              <p className="text-red-400 text-xs mt-1">Insufficient balance</p>
            )}
            <p className="text-white/60 text-xs mt-1">Available: {currency} {account.balance?.toLocaleString() || "0.00"}</p>
          </div>

          {/* Fee Display */}
          {feeData && Number(amount) > 0 && (
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/60">Amount</span>
                <span className="text-white">{currency} {Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-white/60">Fee</span>
                <span className="text-white">{currency} {feeData.fee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-bold">{currency} {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Reference (Optional) */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Reference (Optional)</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter reference"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary resize-none"
            />
          </div>

          {/* PIN */}
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Enter Wallet PIN</label>
            <PinInputWithFingerprint
              value={walletPin}
              onChange={setWalletPin}
              placeholder="••••"
              disabled={isPending}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <CustomButton
              type="button"
              onClick={handleClose}
              className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg transition-colors"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="submit"
              isLoading={isPending}
              disabled={!canSubmit || isPending || hasInsufficientBalance}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              Create Payout
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePayoutModal;






