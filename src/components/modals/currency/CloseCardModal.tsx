"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useCloseCard } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { IVirtualCard } from "@/api/currency/currency.types";
import PinInputWithFingerprint from "@/components/shared/PinInputWithFingerprint";

interface CloseCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard;
  onSuccess: () => void;
}

const CloseCardModal: React.FC<CloseCardModalProps> = ({
  isOpen,
  onClose,
  card,
  onSuccess,
}) => {
  const [walletPin, setWalletPin] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setWalletPin("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setWalletPin("");
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to close card"];
    ErrorToast({
      title: "Closure Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Card Closed",
      description: "Card has been permanently closed. Any remaining balance has been transferred back to your wallet.",
    });
    handleClose();
    onSuccess();
  };

  const { mutate: closeCard, isPending } = useCloseCard(onError, onSuccessCallback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletPin || walletPin.length !== 4) return;
    closeCard({ cardId: card.id, formdata: { walletPin } });
  };

  if (!isOpen) return null;

  const canSubmit = walletPin.length === 4;

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
          <h2 className="text-white text-base sm:text-lg font-semibold">Close Card</h2>
          <p className="text-white/60 text-sm mt-1">Permanently close your virtual card</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
            <p className="text-red-400 text-sm font-medium mb-2">Warning</p>
            <p className="text-red-300 text-sm">
              This action cannot be undone. The card will be permanently closed. Any remaining balance will be transferred back to your wallet.
            </p>
          </div>

          {card.balance > 0 && (
            <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
              <p className="text-yellow-400 text-sm">
                This card has a balance of {card.currency} {card.balance.toLocaleString()}. It will be transferred back to your wallet upon closure.
              </p>
            </div>
          )}

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
              disabled={!canSubmit || isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Close Card
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseCardModal;






