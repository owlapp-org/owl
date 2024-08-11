import { create } from "zustand";

import FileService from "@services/fileService";
import { IFile } from "@ts/interfaces/file_interface";

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
    const file = await FileService.upload(data);
    set((state) => ({ files: [...state.files, file] }));
  },
  removeFile: async (id: number) => {
    try {
      // await DatabaseService.del(id);
      // set((state) => ({
      //   databases: state.databases.filter((db) => db.id !== id),
      // }));
    } catch (error) {
      console.error("Failed to create database", error);
    }
  },
  renameFile: async (id: number, name: string) => {},
}));
