import { create, StoreApi, UseBoundStore } from "zustand";

import { notifications } from "@mantine/notifications";
import {
  ApiService,
  databaseService,
  dataFileService,
  FileService,
  macroFileService,
  scriptService,
} from "@services/services";
import { FileType } from "@ts/enums/filetype_enum";
import {
  IDashboardFile,
  IFileModel,
  IMacroFile,
} from "@ts/interfaces/interfaces";
import { IScript } from "@ts/interfaces/interfaces";
import { notify } from "@lib/notify";

type SetStateFunction<T> = (
  partial:
    | IState<T>
    | Partial<IState<T>>
    | ((state: IState<T>) => IState<T> | Partial<IState<T>>),
  replace?: boolean
) => void;

export interface IState<T> {
  items: T[];
  create: (payload: Record<string, any>) => Promise<T>;
  update: (id: number, payload: Record<string, any>) => Promise<T>;
  fetchAll: () => void;
  findById: (id: number) => T;
  remove: (id: number) => void;
}

export interface IFileState<T extends IFileModel> extends IState<T> {
  fetchContent: (id: number) => Promise<string>;
  upload: (data: FormData) => void;
  rename: (id: number, name: string) => Promise<T>;
}

const baseActions = <T>(
  service: ApiService<T>,
  set: SetStateFunction<T>,
  get: () => IState<T>
) => ({
  items: [],
  create: async (payload: Record<string, any>) => {
    try {
      const item = await service.create(payload);
      set((state) => ({ items: [...state.items, item] }));
      notifications.show({
        title: "Success",
        message: `Item created successfully`,
      });
      return item;
    } catch (error) {
      console.error("Failed to create item", error);
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to create item ${error}`,
      });
      throw error;
    }
  },
  update: async (id: number, payload: Record<string, any>) => {
    try {
      const item = await service.update(id, payload);
      set((state) => ({ items: [...state.items, item] }));
      notify.info("Item created successfully");
      return item;
    } catch (error) {
      notify.error(`Failed to create item ${error}`);
      throw error;
    }
  },
  rename: async (id: number, name: string) => {
    const { update } = get();
    return update(id, { name });
  },
  fetchAll: async () => {
    try {
      const items = await service.fetchAll();
      set({ items });
    } catch (error) {
      console.error("Failed to fetch items", error);
      throw error;
    }
  },
  remove: async (id: number) => {
    try {
      await service.remove(id);
      set((state) => ({
        items: state.items.filter((item: any) => item.id !== id),
      }));
      notifications.show({
        title: "Success",
        message: `Item deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to delete item", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to delete item: ${error}`,
      });
      throw error;
    }
  },
  findById: (id: number) => {
    const items: any = get().items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return items[i];
      }
    }
  },
});

export const createBaseStore = <T>(
  service: ApiService<T>
): UseBoundStore<StoreApi<IState<T>>> =>
  create<IState<T>>((set, get) => baseActions(service, set, get));

export const createFileStore = <T extends IFileModel>(
  service: FileService<T>
): UseBoundStore<StoreApi<IFileState<T>>> =>
  create<IFileState<T>>((set, get) => ({
    ...baseActions(service, set, get),
    fetchContent: async (id: number) => {
      try {
        const content = await service.fetchContent(id);
        return content;
      } catch (e) {
        notifications.show({
          title: "Error",
          color: "red",
          message: "Failed to get file content",
        });
        throw e;
      }
    },
    updateContent: async (id: number, content: string) => {
      return service.updateContent(id, content);
    },
    upload: async (data: FormData) => {
      try {
        const item = await service.upload(data);
        set((state) => ({ items: [...state.items, item] }));
        notifications.show({
          title: "Success",
          message: `File uploaded successfully`,
        });
      } catch (error) {
        console.error("Failed to upload file", error);
        notifications.show({
          title: "Error",
          color: "red",
          message: `Failed to upload file ${error}`,
        });
      }
    },
    rename: async (id: number, name: string) => {
      try {
        const file = await service.update(id, { name });
        set((state) => ({
          items: state.items.map((item: any) => (item.id === id ? file : item)),
        }));
        notify.error(`File renamed successfully`);
        return file;
      } catch (err) {
        notify.error(`Failed to rename file: ${err}`);
        throw err;
      }
    },
  }));

export const useScriptStore = createFileStore(scriptService);
export const useMacroFileStore = createFileStore(macroFileService);
export const useDataFileStore = createFileStore(dataFileService);
export const useDatabaseStore = createBaseStore(databaseService);

export const getStoreWithFileType = <T extends IFileModel>(
  fileType: FileType
): UseBoundStore<StoreApi<IFileState<T>>> => {
  switch (fileType) {
    case FileType.ScriptFile:
      return useScriptStore as UseBoundStore<StoreApi<IFileState<T>>>;
    case FileType.MacroFile:
      return useMacroFileStore as UseBoundStore<StoreApi<IFileState<T>>>;
  }
  const message = `FileType not supported: ${fileType}`;
  notify.error(message);
  throw new Error(message);
};
