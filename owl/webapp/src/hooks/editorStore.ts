import DatabaseService from "@services/databaseService";
import { create, StoreApi, UseBoundStore } from "zustand";
import { notifications } from "@mantine/notifications";
import { v4 as uuidv4 } from "uuid";
import ScriptService from "@services/scriptService";
import useScriptStore from "./scriptStore";
import IFile from "@ts/interfaces/file_interface";
import { FileType } from "@ts/enums/filetype_enum";
import useDataFileStore from "./datafileStore";
import { IQueryResult } from "@ts/interfaces/database_interface";
import useMacroFileStore from "./macrofileStore";
import MacroFileService from "@services/macrofileService";

export interface IEditorTabState {
  id: string;
  file: IFile;
  content: string;
  setFile: (file: IFile) => void;
  fetchContent: () => Promise<void>;
  save: (name?: string) => void;
  setContent: (content: string) => void;
  findFileName: () => string | undefined;
}

export interface IEditorScriptTabOptions {
  databaseId: string | null;
}

export interface IEditorScriptTabState extends IEditorTabState {
  options: IEditorScriptTabOptions | null;
  setDatabase: (database: string | null) => void;
  runQuery: (
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count?: boolean
  ) => Promise<IQueryResult | undefined>;
  getDatabaseIdOption: () => string | null;
}

export interface IEditorMacroFileTabState extends IEditorTabState {}
export interface IEditorDashboardFileTabState extends IEditorTabState {}

const createScriptTabStore = () =>
  create<IEditorScriptTabState>((set, get) => ({
    id: uuidv4(),
    file: {},
    options: null,
    content: "",
    setFile: (file: IFile) => {
      set({ file });
    },
    fetchContent: async () => {
      const file = get().file;
      if (!file.id) {
        return;
      }
      try {
        const content = await ScriptService.fetchContent(file.id);
        set({ content });
        return Promise.resolve();
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "error",
          title: "Error",
          message: "Failed to fetch file content",
        });
        return Promise.reject(error);
      }
    },
    save: async (name?: string) => {
      const file = get().file;
      const content = get().content;

      if (file.id) {
        await ScriptService.updateContent(file.id, content || "");
      } else if (!name) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unknown file name",
        });
        return;
      } else {
        const filename = name || "New file";
        const script = await useScriptStore
          .getState()
          .create(filename, content || "");
        set((state) => ({
          file: {
            ...state.file,
            name: filename,
            id: script.id,
          },
        }));
      }
    },
    setContent: async (content: string) => {
      set({ content: content });
    },
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
          message: "Failed to execute statement",
        });
      }
    },
    findFileName: () => {
      const file = get().file;
      if (!file.id || !file.fileType) {
        return undefined;
      }
      switch (file.fileType) {
        case FileType.ScriptFile: {
          const { findById: findScriptById } = useScriptStore.getState();
          const script = findScriptById(file.id);
          if (script) {
            return script.name;
          }
        }
        case FileType.DataFile: {
          const { findById: findDataFileById } = useDataFileStore.getState();
          const dataFile = findDataFileById(file.id);
          if (dataFile) {
            return dataFile.name;
          }
        }
      }
      return undefined;
    },
    getDatabaseIdOption: () => {
      const options = get().options;
      if (!options) return null;
      return options.databaseId;
    },
  }));

const createMacroFileTabStore = () =>
  create<IEditorMacroFileTabState>((set, get) => ({
    id: uuidv4(),
    file: {},
    options: null,
    content: "",
    setFile: (file: IFile) => {
      set({ file });
    },
    fetchContent: async () => {
      const file = get().file;
      if (!file.id) {
        return;
      }
      try {
        const content = await MacroFileService.fetchContent(file.id);
        set({ content });
        return Promise.resolve();
      } catch (error) {
        console.error(error);
        notifications.show({
          color: "error",
          title: "Error",
          message: "Failed to fetch file content",
        });
        return Promise.reject(error);
      }
    },
    save: async (name?: string) => {
      const file = get().file;
      const content = get().content;
      if (!file.fileType) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unknown file type",
        });
        return;
      }

      if (file.id) {
        await MacroFileService.updateContent(file.id, content || "");
      } else if (!name) {
        notifications.show({
          color: "red",
          title: "Error",
          message: "Unknown file name",
        });
      } else {
        const filename = name || "New file";
        const macrofile = await useMacroFileStore
          .getState()
          .create(filename, content || "");
        set((state) => ({
          file: {
            ...state.file,
            name: filename,
            id: macrofile.id,
          },
        }));
      }
    },
    setContent: async (content: string) => {
      set({ content: content });
    },
    findFileName: () => {
      const file = get().file;
      if (!file.id || !file.fileType) {
        return undefined;
      }
      switch (file.fileType) {
        case FileType.ScriptFile: {
          const { findById: findScriptById } = useScriptStore.getState();
          const script = findScriptById(file.id);
          if (script) {
            return script.name;
          }
        }
        case FileType.DataFile: {
          const { findById: findDataFileById } = useDataFileStore.getState();
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
  addTab: (fileId?: number | null, fileType?: FileType) => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  findTabById: (
    id: string
  ) => UseBoundStore<StoreApi<IEditorTabState>> | undefined;
}

const useEditorStore = create<IEditorState>((set, get) => ({
  activeTab: null,
  tabs: {},
  setActiveTab: (activeTab: string) => set({ activeTab }),
  getTabCount: () => Object.keys(get().tabs).length,
  addTab: (
    fileId?: number | null,
    fileType: FileType = FileType.ScriptFile
  ) => {
    if (fileId) {
      for (const [id, store] of Object.entries(get().tabs)) {
        if (
          store.getState().file.id === fileId &&
          store.getState().file.fileType === fileType
        ) {
          set({ activeTab: id });
          return;
        }
      }
    }
    let name = undefined;
    const activeTab = uuidv4();
    if (fileId) {
      switch (fileType) {
        case FileType.ScriptFile: {
          const script = useScriptStore.getState().findById(fileId);
          if (script) {
            name = script.name;
          } else {
            notifications.show({
              color: "red",
              title: "Error",
              message: "File not found on scripts",
            });
            return;
          }
          break;
        }
        case FileType.MacroFile: {
          const macrofile = useMacroFileStore.getState().findById(fileId);
          if (macrofile) {
            name = macrofile.name;
          } else {
            notifications.show({
              color: "red",
              title: "Error",
              message: "File not found on macro files",
            });
            return;
          }
          break;
        }
        default: {
          notifications.show({
            color: "red",
            title: "Error",
            message: "Unsupported file type",
          });
          break;
        }
      }
    }

    let newTabStore: UseBoundStore<StoreApi<IEditorTabState>> | undefined =
      undefined;
    switch (fileType) {
      case FileType.ScriptFile: {
        newTabStore = createScriptTabStore();
        break;
      }
      case FileType.MacroFile: {
        newTabStore = createMacroFileTabStore();
        break;
      }
    }
    if (!newTabStore) {
      return;
    }

    newTabStore.setState({
      id: activeTab,
      file: { id: fileId, fileType, name },
    });
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
  closeAllTabs: () => {
    set({ tabs: {}, activeTab: null });
  },
  closeOtherTabs: (id: string) => {
    set((state) => {
      const tabs = { ...state.tabs };
      const ids = Object.keys(tabs);
      for (let i = 0; i < ids.length; i++) {
        if (ids[i] === id) continue;
        delete tabs[ids[i]];
      }
      return { tabs, activeTab: id };
    });
  },
  findTabById: (id: string) => {
    return get().tabs[id];
  },
}));

export default useEditorStore;
