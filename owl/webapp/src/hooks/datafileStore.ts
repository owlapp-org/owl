import { create } from "zustand";

import DataFileService from "@services/datafileService";
import { IDataFile } from "@ts/interfaces/datafile_interface";
import { notifications } from "@mantine/notifications";

interface IDataFileState {
  datafiles: IDataFile[];
  fetchAll: () => void;
  upload: (data: FormData) => void;
  remove: (id: number) => void;
  rename: (id: number, name: string) => void;
  findById: (id: number) => IDataFile | undefined;
}

const useDataFileStore = create<IDataFileState>((set, get) => ({
  datafiles: [],
  fetchAll: async () => {
    try {
      const datafiles = await DataFileService.fetchAll();
      set({ datafiles });
    } catch (error) {
      console.error("Failed to fetch files", error);
      throw error;
    }
  },
  upload: async (data: FormData) => {
    try {
      const datafile = await DataFileService.upload(data);
      set((state) => ({ datafiles: [...state.datafiles, datafile] }));
      notifications.show({
        title: "Success",
        message: `File uploaded successfully`,
      });
    } catch (error) {
      console.error("Failed to upload file", error);
      notifications.show({
        title: "Error",
        color: "red",
        message: `File upload file ${error}`,
      });
    }
  },
  remove: async (id: number) => {
    try {
      await DataFileService.remove(id);
      set((state) => ({
        datafiles: state.datafiles.filter((f) => f.id !== id),
      }));
      notifications.show({
        title: "Success",
        message: `File deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to create database", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to delete file ${error}`,
      });
    }
  },
  rename: async (id: number, name: string) => {
    try {
      const file = await DataFileService.update(id, name);
      set((state) => ({
        datafiles: state.datafiles.map((f) => (f.id === id ? file : f)),
      }));
      notifications.show({
        title: "Success",
        message: `File renamed successfully`,
      });
    } catch (err) {
      console.error("Failed to rename file.", err);
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to rename file: ${err}`,
      });
    }
  },
  findById: (id: number) => {
    const datafiles = get().datafiles;
    for (let i = 0; i < datafiles.length; i++) {
      if (datafiles[i].id === id) {
        return datafiles[i];
      }
    }
  },
}));

export default useDataFileStore;
