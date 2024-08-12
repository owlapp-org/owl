import { create } from "zustand";

import FileService from "@services/fileService";
import { IFile } from "@ts/interfaces/file_interface";
import { notifications } from "@mantine/notifications";

interface FileState {
  files: IFile[];
  fetchFiles: () => void;
  upload: (data: FormData) => void;
  removeFile: (id: number) => void;
  renameFile: (id: number, name: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  fetchFiles: async () => {
    try {
      const files = await FileService.list();
      set({ files: files });
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
  },
  upload: async (data: FormData) => {
    try {
      const file = await FileService.upload(data);
      set((state) => ({ files: [...state.files, file] }));
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
  removeFile: async (id: number) => {
    try {
      await FileService.del(id);
      set((state) => ({
        files: state.files.filter((f) => f.id !== id),
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
  renameFile: async (id: number, name: string) => {
    try {
      const file = await FileService.rename(id, name);
      set((state) => ({
        files: state.files.map((f) => (f.id === id ? file : f)),
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
}));
