import { create } from "zustand";

interface EditorStore {
  code: string;
  selectedDatabase: string | null;
  setCode: (code: string) => void;
  setDatabase: (database: string | null) => void;
}

const useEditorStore = create<EditorStore>((set) => ({
  code: "",
  selectedDatabase: null,
  setCode: (code) => set({ code }),
  setDatabase: (database) => set({ selectedDatabase: database }),
}));

export default useEditorStore;
