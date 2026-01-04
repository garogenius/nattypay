"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useFreezeCard, useUnfreezeCard } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { IVirtualCard } from "@/api/currency/currency.types";

interface FreezeUnfreezeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: IVirtualCard;
  onSuccess: () => void;
}

const FreezeUnfreezeCardModal: React.FC<FreezeUnfreezeCardModalProps> = ({
  isOpen,
  onClose,
  card,
  onSuccess,
}) => {
  const isFrozen = card.status === "FROZEN";

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || `Failed to ${isFrozen ? "unfreeze" : "freeze"} card`];
    ErrorToast({
      title: "Operation Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Card Updated",
      description: `Card ${isFrozen ? "unfrozen" : "frozen"} successfully`,
    });
    onClose();
    onSuccess();
  };

  const { mutate: freezeCard, isPending: freezing } = useFreezeCard(onError, onSuccessCallback);
  const { mutate: unfreezeCard, isPending: unfreezing } = useUnfreezeCard(onError, onSuccessCallback);

  const handleConfirm = () => {
    if (isFrozen) {
      unfreezeCard(card.id);
    } else {
      freezeCard(card.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 py-4 w-full max-w-md max-h-[92vh] rounded-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors"
        >
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-4">
          <h2 className="text-white text-base sm:text-lg font-semibold">
            {isFrozen ? "Unfreeze Card" : "Freeze Card"}
          </h2>
          <p className="text-white/60 text-sm mt-1">
            {isFrozen
              ? "Unfreeze your card to enable transactions"
              : "Freeze your card to temporarily disable transactions"}
          </p>
        </div>

        <div className="px-5 sm:px-6 pb-6 space-y-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <p className="text-white text-sm">
              {isFrozen
                ? "Your card will be unfrozen and you'll be able to make transactions again."
                : "Your card will be frozen and you won't be able to make transactions until you unfreeze it."}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <CustomButton
              type="button"
              onClick={onClose}
              className="flex-1 bg-transparent border border-border-600 text-white hover:bg-white/5 py-3 rounded-lg transition-colors"
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="button"
              onClick={handleConfirm}
              isLoading={freezing || unfreezing}
              disabled={freezing || unfreezing}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              {isFrozen ? "Unfreeze Card" : "Freeze Card"}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreezeUnfreezeCardModal;






