"use client";

import React, { useState, useEffect } from "react";
import { CgClose } from "react-icons/cg";
import { useDeleteAccount } from "@/api/user/user.queries";
import useUserStore from "@/store/user.store";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import CustomButton from "@/components/shared/Button";
import useNavigate from "@/hooks/useNavigate";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [openSelect, setOpenSelect] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setOpenSelect(false);
      setConfirmStep(false);
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to delete account"];

    ErrorToast({
      title: "Deletion Failed",
      descriptions,
    });
  };

  const onSuccess = () => {
    SuccessToast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted",
    });
    // Clear all data and redirect to login
    navigate("/login", "replace");
  };

  const { mutate: deleteAccount, isPending: deleting } = useDeleteAccount(onError, onSuccess);

  if (!isOpen) return null;

  const reasons = [
    "I found a better alternative",
    "I'm concerned about security",
    "I'm not using the service anymore",
    "I have too many accounts",
    "Other",
  ];
  const valid = !!reason;

  const handleNext = () => {
    if (!valid) {
      ErrorToast({
        title: "Validation Error",
        descriptions: ["Please select a reason"],
      });
      return;
    }
    setConfirmStep(true);
  };

  const handleConfirm = () => {
    if (!user?.id) {
      ErrorToast({
        title: "Error",
        descriptions: ["User ID not found"],
      });
      return;
    }

    deleteAccount(user.id);
  };

  return (
    <div className="z-[999999] overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 flex justify-center items-center w-full md:inset-0 h-[100dvh]">
      <div className="fixed inset-0 transition-opacity" aria-hidden="true">
        <div className="absolute inset-0 bg-black/80 dark:bg-black/60" onClick={onClose} />
      </div>
      <div className="relative mx-2.5 2xs:mx-4 bg-bg-600 dark:bg-bg-1100 border border-border-800 dark:border-border-700 px-0 pt-4 pb-5 w-full max-w-lg max-h-[92vh] rounded-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 cursor-pointer bg-bg-1400 rounded-full hover:bg-bg-1200 transition-colors">
          <CgClose className="text-xl text-text-200 dark:text-text-400" />
        </button>

        <div className="px-5 sm:px-6 pt-1 pb-3">
          <h2 className="text-white text-base sm:text-lg font-semibold">Delete Account</h2>
          <p className="text-white/60 text-sm">This action will permanently delete your account details</p>
        </div>

        <div className="px-5 sm:px-6">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-white/80 text-sm space-y-2">
            <p className="font-medium text-white">By deleting your account, you will</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Lose access to your wallet balance</li>
              <li>End all active savings and deposits</li>
              <li>Forfeit benefits, rewards, and cashback</li>
              <li>Stop access to bill payments and services</li>
              <li>Lose transaction history and account records</li>
              <li>Be unable to reopen this account later</li>
              <li>Permanently stop using NattyPay services</li>
            </ul>
          </div>
        </div>

        {!confirmStep ? (
          <>
            <div className="px-5 sm:px-6 pt-4">
              <label className="block text-sm text-white/80 mb-1.5">Select Reason</label>
              <div className="relative">
                <button onClick={()=> setOpenSelect(v=>!v)} className="w-full flex items-center justify-between rounded-lg border border-border-600 bg-bg-2400 dark:bg-bg-2100 py-3.5 px-3 text-white/80 text-sm">
                  <span>{reason || "Select a reason why you are leaving"}</span>
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" /></svg>
                </button>
                {openSelect && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-bg-2400 dark:bg-bg-2100 shadow-xl">
                    {reasons.map((r)=> (
                      <button key={r} onClick={()=> { setReason(r); setOpenSelect(false); }} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10">{r}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-6 pt-4 flex gap-3">
              <CustomButton
                onClick={onClose}
                className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
              >
                Cancel
              </CustomButton>
              <CustomButton
                onClick={handleNext}
                disabled={!valid}
                className="flex-1 rounded-xl py-3 font-semibold bg-[#D4B139] hover:bg-[#c7a42f] text-black disabled:bg-[#D4B139]/60 disabled:text-black/70"
              >
                Next
              </CustomButton>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 sm:px-6 pt-4">
              <p className="text-white/80 text-sm mb-4 text-center">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
            </div>
            <div className="px-5 sm:px-6 pt-4 flex gap-3">
              <CustomButton
                onClick={() => setConfirmStep(false)}
                className="flex-1 bg-transparent border border-white/15 text-white rounded-xl py-3"
              >
                Back
              </CustomButton>
              <CustomButton
                onClick={handleConfirm}
                disabled={deleting}
                isLoading={deleting}
                className="flex-1 rounded-xl py-3 font-semibold bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Account
              </CustomButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
