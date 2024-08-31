import { create } from "zustand";

interface IUpdateDatabaseModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  databaseId: number | null;
  showModal: (
    options: Omit<
      IUpdateDatabaseModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useUpdateDatabaseModalStore = create<IUpdateDatabaseModalState>(
  (set, get) => ({
    open: false,
    title: "Update Database",
    size: "md",
    databaseId: null,
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false, title: "Update Database" }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
