"use client";

import React from "react";
import { CgClose } from "react-icons/cg";
import CustomButton from "@/components/shared/Button";
import ErrorToast from "@/components/toast/ErrorToast";
import SuccessToast from "@/components/toast/SuccessToast";
import { useChangePin } from "@/api/user/user.queries";
import usePaymentSettingsStore from "@/store/paymentSettings.store";

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose }) => {
  const { setFingerprintPaymentEnabled } = usePaymentSettingsStore();
  const [current, setCurrent] = React.useState("");
  const [nextPin, setNextPin] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setCurrent("");
      setNextPin("");
      setConfirm("");
    }
  }, [isOpen]);

  const onError = (error: any) => {
    const errorMessage = error?.response?.data?.message;
    const descriptions = Array.isArray(errorMessage)
      ? errorMessage
      : [errorMessage || "Failed to change PIN. Please try again."];

    ErrorToast({
      title: "Change PIN Failed",
      descriptions,
    });
  };

  const onSuccess = (data: any) => {
    // Disable fingerprint payments after PIN change for safety
    setFingerprintPaymentEnabled(false);
    SuccessToast({
      title: "PIN Updated",
      description: data?.data?.message || "Your transaction PIN has been changed successfully.",
    });
    onClose();
  };

  const { mutate: changePin, isPending } = useChangePin(onError, onSuccess);

  const handleSubmit = () => {
    if (!/^\d{4}$/.test(current)) {
      ErrorToast({ title: "Validation Error", descriptions: ["Current PIN must be exactly 4 digits"] });
      return;
    }
    if (!/^\d{4}$/.test(nextPin)) {
      ErrorToast({ title: "Validation Error", descriptions: ["New PIN must be exactly 4 digits"] });
      return;
    }
    if (current === nextPin) {
      ErrorToast({ title: "Validation Error", descriptions: ["New PIN must differ from current PIN"] });
      return;
    }
    if (nextPin !== confirm) {
      ErrorToast({ title: "Validation Error", descriptions: ["PIN and confirmation do not match"] });
      return;
    }

    changePin({ oldPin: current, newPin: nextPin });
  };

  const valid = /^\d{4}$/.test(current) && /^\d{4}$/.test(nextPin) && nextPin === confirm && current !== nextPin;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-600 dark:bg-bg-1100 border border-white/10 rounded-2xl p-5 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-full"
          disabled={isPending}
        >
          <CgClose className="text-xl text-white" />
        </button>
        <h2 className="text-white text-base font-semibold mb-2">Change Transaction PIN</h2>
        <p className="text-white/60 text-sm mb-4">
          Enter your current 4-digit PIN and set a new one. For security, fingerprint payment will be disabled after a change.
        </p>
        <div className="space-y-3">
          <input
            value={current}
            onChange={(e) => setCurrent(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Current PIN"
            type="password"
            inputMode="numeric"
            className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            maxLength={4}
          />
          <input
            value={nextPin}
            onChange={(e) => setNextPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="New PIN"
            type="password"
            inputMode="numeric"
            className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            maxLength={4}
          />
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Confirm New PIN"
            type="password"
            inputMode="numeric"
            className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/50 px-3 py-2 focus:outline-none"
            maxLength={4}
          />
        </div>
        <CustomButton
          onClick={handleSubmit}
          disabled={!valid || isPending}
          isLoading={isPending}
          className="mt-5 w-full rounded-lg bg-[#D4B139] hover:bg-[#c7a42f] text-black py-3 font-semibold"
        >
          Update PIN
        </CustomButton>
      </div>
    </div>
  );
};

export default ChangePinModal;
