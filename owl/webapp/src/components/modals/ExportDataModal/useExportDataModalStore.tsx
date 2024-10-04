import { create } from "zustand";

interface IExportDataModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  query?: string;
  databaseId?: number;
  showModal: (
    options: Omit<
      IExportDataModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useExportDataModalStore = create<IExportDataModalState>(
  (set, get) => ({
    open: false,
    title: "Export Data",
    size: "md",
    query: undefined,
    databaseId: undefined,
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false, title: "Create Database" }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
