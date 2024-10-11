import { create, StoreApi, UseBoundStore } from "zustand";
import { v4 as uuidv4 } from "uuid";
import IFile, { IFileModel, IScript } from "@ts/interfaces/interfaces";
import { FileType } from "@ts/enums";
import { notify } from "@lib/notify";
import { getStoreWithFileType, IFileState } from "./hooks";
import {
  FileService,
  macroFileService,
  scriptService,
} from "@services/services";
import _ from "lodash";

export interface IEditorTabState<T> {
  id: string;
  file: IFile;
  content: string;
  options: Record<string, any> | null;
  setFile: (file: IFile) => void;
  fetchAndSetContent: () => Promise<string>;
  save: (name?: string) => void;
  setContent: (content: string) => void;
  findFileName: () => string | undefined;
  getOption: <K>(option: string) => K | undefined;
  setOption: (option: string, value: any) => void;
}

export interface IEditorScriptTabState<T extends IScript>
  extends IEditorTabState<T> {
  lastExecution: Record<string, any> | null;
  setLastExecution: (lastExec: Record<string, any>) => void;
}

export interface IEditorState<T extends IFileModel> {
  activeTabId: string | null;
  tabs: Record<string, UseBoundStore<StoreApi<IEditorTabState<T>>>>;
  setActiveTab(tabId: string | null): void;
  activateTab: (fileType: FileType, fileId?: number | null) => string | null;
  getTabCount(): number;
  addTab: (fileType?: FileType, fileId?: number | null) => void;
  closeTab: (id: string) => void;
  closeTabByFile: (fileId: number, fileType: FileType) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (id: string) => void;
  findTabById: (
    id: string
  ) => UseBoundStore<StoreApi<IEditorTabState<T>>> | undefined;
}

type SetStateFunction<T> = (
  partial:
    | IEditorTabState<T>
    | Partial<IEditorTabState<T>>
    | ((
        state: IEditorTabState<T>
      ) => IEditorTabState<T> | Partial<IEditorTabState<T>>),
  replace?: boolean
) => void;

const editorTabStateManager = <T>(
  service: FileService<T>,
  set: SetStateFunction<T>,
  get: () => IEditorTabState<T>
) => ({
  id: uuidv4(),
  file: {},
  options: null,
  content: "",
  setFile: (file: IFile) => {
    set({ file });
  },
  fetchAndSetContent: async () => {
    const file = get().file;
    if (!file.id) return "";
    try {
      const content = await service.fetchContent(file.id);
      set({ content });
      return content;
    } catch (error) {
      console.error(error);
      notify.error("Failed to fetch file content");
      return Promise.reject(error);
    }
  },
  save: async (name?: string) => {
    const { file, content } = get();
    if (file.id) {
      await service.updateContent(file.id, content);
    } else if (!name) {
      notify.error("Unknown file name");
      throw new Error("Unknown file name");
    } else {
      const filename = name || "New file";
      const { id } = await getStoreWithFileType(file.fileType!)
        .getState()
        .create({ name: filename, content });
      set((state) => ({
        file: {
          ...state.file,
          name: filename,
          id,
        },
      }));
    }
  },
  setContent: async (content: string) => {
    set({ content: content });
  },
  setDatabase: (databaseId: string | null) => {
    set({ options: { ...get().options, databaseId } });
  },
  findFileName: () => {
    const { file } = get();
    if (!file.id || !file.fileType) return undefined;
    const store = getStoreWithFileType(file.fileType);
    const item = store.getState().findById(file.id);
    if (!item) return undefined;
    return item.name;
  },
  getOption: <K>(option: string) => {
    const options = get().options;
    if (options) return options[option] as K;
    return undefined;
  },
  setOption: (option: string, value: any) => {
    const options = get().options;
    set({ options: { ...options, ...{ [option]: value } } });
  },
});

const createTabStore = <T>(service: FileService<T>) =>
  create<IEditorTabState<T>>((set, get) =>
    editorTabStateManager(service, set, get)
  );

const createScriptTabStore = <T extends IScript>(
  service: FileService<T>
): UseBoundStore<StoreApi<IEditorScriptTabState<T>>> =>
  create<IEditorScriptTabState<T>>((set, get) => ({
    ...editorTabStateManager(service, set, get),
    lastExecution: null,
    setLastExecution: (lastExecution: Record<string, any>) => {
      set({ lastExecution: { ...lastExecution } });
    },
  }));

const useEditorStore = create<IEditorState<IFileModel>>((set, get) => ({
  activeTabId: null,
  tabs: {},
  setActiveTab: (activeTabId: string) => set({ activeTabId }),
  getTabCount: () => Object.keys(get().tabs).length,
  activateTab: (
    fileType: FileType = FileType.ScriptFile,
    fileId?: number | null
  ) => {
    if (!fileId) return null;
    for (const [id, store] of Object.entries(get().tabs)) {
      if (
        store.getState().file.id === fileId &&
        store.getState().file.fileType === fileType
      ) {
        set({ activeTabId: id });
        return id;
      }
    }
    return null;
  },
  addTab: (
    fileType: FileType = FileType.ScriptFile,
    fileId?: number | null
  ) => {
    const { activateTab } = get();
    if (activateTab(fileType, fileId)) {
      return;
    }

    let name = undefined;
    if (fileId) {
      try {
        const store = getStoreWithFileType(fileType);
        const state = store.getState() as IFileState<any>;
        const { name: itemName } = state.findById(fileId);
        name = itemName;
      } catch (e) {
        notify.error(`Internal error: ${e}`);
      }
    }

    let newTabStore:
      | UseBoundStore<StoreApi<IEditorTabState<IFileModel>>>
      | undefined = undefined;

    switch (fileType) {
      case FileType.ScriptFile: {
        newTabStore = createScriptTabStore(scriptService);
        break;
      }
      case FileType.MacroFile: {
        newTabStore = createTabStore(macroFileService);
        break;
      }
      default:
        return;
    }

    const activeTabId = uuidv4();
    newTabStore.setState({
      id: activeTabId,
      file: { id: fileId, fileType, name },
    });
    set((state) => ({
      activeTabId,
      tabs: {
        ...state.tabs,
        [activeTabId]: newTabStore,
      },
    }));
  },
  closeTab: (id: string) => {
    set((state) => {
      const tabs = { ...state.tabs };
      delete tabs[id];
      // If the closed tab was the active tab, set a new active tab
      let newActiveTab = state.activeTabId === id ? null : state.activeTabId;
      // If there are still tabs left, set the first tab as the active tab
      if (newActiveTab === null && Object.keys(tabs).length > 0) {
        newActiveTab = Object.keys(tabs)[0];
      }
      return { tabs, activeTabId: newActiveTab };
    });
  },
  closeTabByFile: (fileId: number, fileType: FileType) => {
    const { tabs, closeTab } = get();
    const tab = Object.entries(tabs).find(
      ([_, tab]) =>
        tab.getState().file.id === fileId &&
        tab.getState().file.fileType === fileType
    );
    if (tab) {
      const [tabId, _] = tab;
      closeTab(tabId);
    }
  },
  closeAllTabs: () => {
    set({ tabs: {}, activeTabId: null });
  },
  closeOtherTabs: (id: string) => {
    set((state) => {
      const tabs = { ...state.tabs };
      const ids = Object.keys(tabs);
      for (let i = 0; i < ids.length; i++) {
        if (ids[i] === id) continue;
        delete tabs[ids[i]];
      }
      return { tabs, activeTabId: id };
    });
  },
  findTabById: (id: string) => {
    return get().tabs[id];
  },
}));

export default useEditorStore;
