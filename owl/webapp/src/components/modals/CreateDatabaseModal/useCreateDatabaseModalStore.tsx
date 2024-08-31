import { create } from "zustand";

interface ICreateDatabaseModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showModal: (
    options: Omit<
      ICreateDatabaseModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useCreateDatabaseModalStore = create<ICreateDatabaseModalState>(
  (set, get) => ({
    open: false,
    title: "Create Database",
    size: "md",
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
