import { FileType } from "@ts/enums/filetype_enum";
import { create } from "zustand";

interface ICreateFileModalState {
  open: boolean;
  title?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tabId?: string;
  fileType: FileType | null;
  content: string;
  showModal: (
    options: Omit<
      ICreateFileModalState,
      "showModal" | "open" | "reset" | "destroy" | "closeModal"
    >
  ) => void;
  closeModal: () => void;
  reset: () => void;
  destroy: () => void;
}

export const useCreateFileModalStore = create<ICreateFileModalState>(
  (set, get) => ({
    open: false,
    title: "Create File",
    size: "md",
    tabId: undefined,
    fileType: null,
    content: "",
    showModal: (options) => set({ ...options, open: true }),
    closeModal: () => set({ open: false }),
    reset: () => set({ open: false, title: "Create File" }),
    destroy: () => {
      const state = get();
      state.closeModal();
      state.reset();
    },
  })
);
