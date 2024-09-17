import IFile from "@ts/interfaces/interfaces";
import { create } from "zustand";

interface IRenameFileModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  file: IFile;
  showModal: (
    options: Omit<
      IRenameFileModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useRenameFileModalStore = create<IRenameFileModalState>(
  (set, get) => ({
    open: false,
    title: "Rename File",
    size: "md",
    file: {},
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false, title: "Rename File", file: {} }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
