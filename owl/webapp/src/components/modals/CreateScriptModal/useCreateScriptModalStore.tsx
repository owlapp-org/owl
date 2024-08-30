import { create } from "zustand";

interface ICreateScriptModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showModal: (
    options: Omit<
      ICreateScriptModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useCreateScriptModalStore = create<ICreateScriptModalState>(
  (set, get) => ({
    open: false,
    title: "Create Script",
    size: "md",
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false, title: "Create Script" }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
