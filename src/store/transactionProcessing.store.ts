import { create } from "zustand";

export type TransactionProcessingStatus = "idle" | "processing" | "success" | "error";

interface TransactionProcessingState {
  isOpen: boolean;
  status: TransactionProcessingStatus;
  title?: string;
  message?: string;
  autoCloseMs?: number;
}

interface TransactionProcessingActions {
  showProcessing: (opts?: { title?: string; message?: string }) => void;
  showSuccess: (opts?: { title?: string; message?: string; autoCloseMs?: number }) => void;
  showError: (opts?: { title?: string; message?: string; autoCloseMs?: number }) => void;
  close: () => void;
  reset: () => void;
}

const initialState: TransactionProcessingState = {
  isOpen: false,
  status: "idle",
  title: undefined,
  message: undefined,
  autoCloseMs: undefined,
};

export const useTransactionProcessingStore = create<
  TransactionProcessingState & TransactionProcessingActions
>((set) => ({
  ...initialState,
  showProcessing: (opts) =>
    set({
      isOpen: true,
      status: "processing",
      title: opts?.title ?? "Processing",
      message: opts?.message ?? "Please wait...",
      autoCloseMs: undefined,
    }),
  showSuccess: (opts) =>
    set({
      isOpen: true,
      status: "success",
      title: opts?.title ?? "Successful",
      message: opts?.message ?? "Transaction completed.",
      autoCloseMs: opts?.autoCloseMs ?? 900,
    }),
  showError: (opts) =>
    set({
      isOpen: true,
      status: "error",
      title: opts?.title ?? "Failed",
      message: opts?.message ?? "Transaction failed. Please try again.",
      autoCloseMs: opts?.autoCloseMs ?? 1300,
    }),
  close: () => set({ isOpen: false }),
  reset: () => set({ ...initialState }),
}));


