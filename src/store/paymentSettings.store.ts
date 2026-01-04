import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Currency = "NGN" | "USD" | "EUR" | "GBP";

interface PaymentSettingsState {
  selectedWalletIndex: number;
  selectedCurrency: Currency;
  fingerprintPaymentEnabled: boolean;
  setSelectedWalletIndex: (i: number) => void;
  setSelectedCurrency: (currency: Currency) => void;
  setFingerprintPaymentEnabled: (enabled: boolean) => void;
}

const usePaymentSettingsStore = create(
  persist<PaymentSettingsState>(
    (set) => ({
      selectedWalletIndex: 0,
      selectedCurrency: "NGN",
      fingerprintPaymentEnabled: false,
      setSelectedWalletIndex: (i: number) => set({ selectedWalletIndex: i }),
      setSelectedCurrency: (currency: Currency) => set({ selectedCurrency: currency }),
      setFingerprintPaymentEnabled: (enabled: boolean) => set({ fingerprintPaymentEnabled: enabled }),
    }),
    {
      name: "payment_settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default usePaymentSettingsStore;
