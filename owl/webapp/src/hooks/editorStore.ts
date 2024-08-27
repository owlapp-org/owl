import DatabaseService from "@services/databaseService";
import { create, StoreApi, UseBoundStore } from "zustand";
import { notifications } from "@mantine/notifications";
import { v4 as uuidv4 } from "uuid";
import ScriptService from "@services/scriptService";
import useScriptStore from "./scriptStore";
import IFile from "@ts/interfaces/file_interface";
import { FileType } from "@ts/enums/filetype_enum";
import useDataFileStore from "./datafileStore";

export interface IEditorTabOptions {
  databaseId: string | null;
}

export interface IEditorTabState {
  id: string;
  file: IFile;
  options: IEditorTabOptions | null;
  isBusy: boolean;
  save: (name?: string) => void;
  setIsBusy: (value: boolean) => void;
  setContent: (content: string) => void;
  setDatabase: (database: string | null) => void;
  runQuery: (
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count?: boolean
  ) => any;
  findFileName: () => string | undefined;
}

const createTabStore = () =>
  create<IEditorTabState>((set, get) => ({
    id: uuidv4(),
    file: {},
    options: null,
    isBusy: false,
    save: async (name?: string) => {
      const file = get().file;
      if (file.fileType != FileType.ScriptFile) {
        notifications.show({
          color: "yellow",
          title: "Warning",
          message: "Currently only script files are supported.",
        });
        return;
      } else if (!file.fileType) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unknown file type",
        });
        return;
      }

      if (file.id) {
        switch (file.fileType) {
          case FileType.ScriptFile:
            await ScriptService.updateContent(file.id, file.content || "");
            return;
        }
      } else if (!name && !file.name) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unknown file name",
        });
        return;
      } else {
        const filename = name || file.name || "New file";
        switch (file.fileType) {
          case FileType.ScriptFile:
            const script = await useScriptStore
              .getState()
              .create(filename, file.content || "");
            set((state) => ({
              file: {
                ...state.file,
                name: filename,
                id: script.id,
              },
            }));
            return;
        }
      }
    },
    setIsBusy: (isBusy: boolean) => set({ isBusy }),
    setContent: (content: string) =>
      set((state) => ({
        file: {
          ...state.file,
          content,
        },
      })),
    setDatabase: (databaseId: string | null) => {
      const options = { ...get().options, databaseId };
      set({ options });
    },
    runQuery: async (
      query: string,
      start_row?: number,
      end_row?: number,
      with_total_count?: boolean
    ) => {
      const { file, options } = get();

      if (file.fileType != FileType.ScriptFile) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "File type is not supported",
        });
        return;
      }
      if (!query) {
        notifications.show({
          color: "yellow",
          title: "Warning",
          message: "Nothing to run",
        });
        return;
      }

      const { databaseId } = options || {};
      try {
        set({ isBusy: true });
        const result = await DatabaseService.run(
          databaseId,
          query,
          start_row,
          end_row,
          with_total_count
        );
        if (result.affected_rows != null) {
          notifications.show({
            title: "Success",
            message: `Affected rows ${result.affected_rows}`,
          });
        } else if (!start_row) {
          // show only once not for all pagination requests
          notifications.show({
            title: "Success",
            message: `Statement executed`,
          });
        }
        return result;
      } catch (error: any) {
        notifications.show({
          color: "red",
          title: "Error",
          message: error?.response?.data as string,
        });
        throw error;
      } finally {
        set({ isBusy: false });
      }
    },
    findFileName: () => {
      const file = get().file;
      if (!file.id || !file.fileType) {
        return undefined;
      }
      switch (file.fileType) {
        case FileType.ScriptFile: {
          const { findById: findScriptById } = useScriptStore();
          const script = findScriptById(file.id);
          if (script) {
            return script.name;
          }
        }
        case FileType.DataFile: {
          const { findById: findDataFileById } = useDataFileStore();
          const dataFile = findDataFileById(file.id);
          if (dataFile) {
            return dataFile.name;
          }
        }
      }
      return undefined;
    },
  }));

export interface IEditorState {
  activeTab: string | null;
  tabs: Record<string, UseBoundStore<StoreApi<IEditorTabState>>>;
  setActiveTab(id: string | null): void;
  getTabCount(): number;
  addTab: (fileId?: number, fileType?: FileType) => void;
  closeTab: (id: string) => void;
}

const useEditorStore = create<IEditorState>((set, get) => ({
  activeTab: null,
  tabs: {},
  setActiveTab: (activeTab: string) => set({ activeTab }),
  getTabCount: () => Object.keys(get().tabs).length,
  addTab: (fileId?: number, fileType: FileType = FileType.ScriptFile) => {
    if (fileId) {
      for (const [id, store] of Object.entries(get().tabs)) {
        if (store.getState().file.id === fileId) {
          set({ activeTab: id });
          return;
        }
      }
    }
    const activeTab = uuidv4();
    const newTabStore = createTabStore();
    newTabStore.setState({ file: { fileType } });
    set((state) => ({
      activeTab,
      tabs: {
        ...state.tabs,
        [activeTab]: newTabStore,
      },
    }));
  },
  closeTab: (id: string) => {
    set((state) => {
      const tabs = { ...state.tabs };
      delete tabs[id];
      // If the closed tab was the active tab, set a new active tab
      let newActiveTab = state.activeTab === id ? null : state.activeTab;
      // If there are still tabs left, set the first tab as the active tab
      if (newActiveTab === null && Object.keys(tabs).length > 0) {
        newActiveTab = Object.keys(tabs)[0];
      }
      return { tabs, activeTab: newActiveTab };
    });
  },
}));

export default useEditorStore;
