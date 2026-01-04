"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import { useUpdateCurrencyAccount } from "@/api/currency/currency.queries";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { ICurrencyAccount } from "@/api/currency/currency.types";

interface UpdateCurrencyAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: ICurrencyAccount;
  onSuccess: () => void;
}

const UpdateCurrencyAccountModal: React.FC<UpdateCurrencyAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const [label, setLabel] = React.useState(account.label || "");

  React.useEffect(() => {
    if (isOpen && account) {
      setLabel(account.label || "");
    }
  }, [isOpen, account]);

  const handleClose = () => {
    setLabel(account.label || "");
    onClose();
  };

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to update account"];
    ErrorToast({
      title: "Update Failed",
      descriptions,
    });
  };

  const onSuccessCallback = (data: any) => {
    SuccessToast({
      title: "Account Updated",
      description: "Account label updated successfully",
    });
    handleClose();
    onSuccess();
  };

  const { mutate: updateAccount, isPending } = useUpdateCurrencyAccount(onError, onSuccessCallback);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !account.currency) return;
    updateAccount({ currency: account.currency, formdata: { label: label.trim() } });
  };

  if (!isOpen || !account) return null;

  const canSubmit = label.trim().length > 0;

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
          <h2 className="text-white text-base sm:text-lg font-semibold">Update Account Label</h2>
          <p className="text-white/60 text-sm mt-1">Change the label for your {account.currency} account</p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1.5">Account Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., My USD Account"
              className="w-full bg-bg-2400 dark:bg-bg-2100 border border-border-600 rounded-lg py-3.5 px-3 text-white placeholder:text-white/50 outline-none focus:border-primary"
              maxLength={50}
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
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium py-3 rounded-lg transition-colors"
            >
              Update Account
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCurrencyAccountModal;






