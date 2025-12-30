import { Transaction } from "@/constants/types";
import { create } from "zustand";

type State = {
  isOpen: boolean;
  transaction: Transaction | null;
};

type Actions = {
  open: (tx: Transaction) => void;
  close: () => void;
};

const useTransactionViewModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  transaction: null,
  open: (tx) => set({ isOpen: true, transaction: tx }),
  close: () => set({ isOpen: false, transaction: null }),
}));

export default useTransactionViewModalStore;
