import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PaymentSettingsState {
  selectedWalletIndex: number;
  fingerprintPaymentEnabled: boolean;
  setSelectedWalletIndex: (i: number) => void;
  setFingerprintPaymentEnabled: (enabled: boolean) => void;
}

const usePaymentSettingsStore = create(
  persist<PaymentSettingsState>(
    (set) => ({
      selectedWalletIndex: 0,
      fingerprintPaymentEnabled: false,
      setSelectedWalletIndex: (i: number) => set({ selectedWalletIndex: i }),
      setFingerprintPaymentEnabled: (enabled: boolean) => set({ fingerprintPaymentEnabled: enabled }),
    }),
    {
      name: "payment_settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePaymentSettingsStore;
