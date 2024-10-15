import { create } from "zustand";

interface IAppAboutModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showModal: (
    options: Omit<
      IAppAboutModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useAppAboutModalStore = create<IAppAboutModalState>(
  (set, get) => ({
    open: false,
    size: "md",
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
