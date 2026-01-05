import { create } from "zustand";

type Currency = "NGN" | "USD" | "EUR" | "GBP";

type State = {
  isOpen: boolean;
  requiredAmount: number | null;
  currentBalance: number | null;
  currency: Currency;
};

type Actions = {
  open: (data: { requiredAmount: number; currentBalance: number; currency?: Currency }) => void;
  close: () => void;
};

const useInsufficientBalanceModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  requiredAmount: null,
  currentBalance: null,
  currency: "NGN",
  open: (data) =>
    set({
      isOpen: true,
      requiredAmount: data.requiredAmount,
      currentBalance: data.currentBalance,
      currency: data.currency || "NGN",
    }),
  close: () =>
    set({
      isOpen: false,
      requiredAmount: null,
      currentBalance: null,
      currency: "NGN",
    }),
}));

export default useInsufficientBalanceModalStore;






















