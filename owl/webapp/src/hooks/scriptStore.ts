import { create } from "zustand";

import { notifications } from "@mantine/notifications";
import { IScript } from "@ts/interfaces/script_interface";
import ScriptService from "@services/scriptService";

interface IScriptState {
  scripts: IScript[];
  fetchScripts: () => void;
  upload: (data: FormData) => void;
  removeScript: (id: number) => void;
  renameScript: (id: number, name: string) => void;
}

export const useScriptStore = create<IScriptState>((set) => ({
  scripts: [],
  fetchScripts: async () => {
    try {
      const files = await ScriptService.list();
      set({ scripts: files });
    } catch (error) {
      console.error("Failed to fetch script files", error);
    }
  },
  upload: async (data: FormData) => {
    try {
      const file = await ScriptService.upload(data);
      set((state) => ({ scripts: [...state.scripts, file] }));
      notifications.show({
        title: "Success",
        message: `Script file uploaded successfully`,
      });
    } catch (error) {
      console.error("Failed to upload file", error);
      notifications.show({
        title: "Error",
        color: "red",
        message: `File upload script file ${error}`,
      });
    }
  },
  removeScript: async (id: number) => {
    try {
      await ScriptService.del(id);
      set((state) => ({
        scripts: state.scripts.filter((s) => s.id !== id),
      }));
      notifications.show({
        title: "Success",
        message: `Script file deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to create database", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to delete script file: ${error}`,
      });
    }
  },
  renameScript: async (id: number, name: string) => {
    try {
      const file = await ScriptService.rename(id, name);
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? file : s)),
      }));
      notifications.show({
        title: "Success",
        message: `Script file renamed successfully`,
      });
    } catch (err) {
      console.error("Failed to rename script.", err);
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to rename script file: ${err}`,
      });
    }
  },
}));
