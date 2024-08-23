import { create } from "zustand";

import { notifications } from "@mantine/notifications";
import { IScript } from "@ts/interfaces/script_interface";
import ScriptService from "@services/scriptService";
import useEditorStore from "./editorStore";

interface IScriptState {
  scripts: IScript[];
  updateScriptContent: (id: number, content: string) => void;
  getScriptContent: (id: number) => Promise<string>;
  fetchScripts: () => void;
  upload: (data: FormData) => void;
  removeScript: (id: number) => void;
  renameScript: (id: number, name: string) => void;
}

export const useScriptStore = create<IScriptState>((set) => ({
  scripts: [],
  updateScriptContent: (id: number, content: string) => {},
  getScriptContent: async (id: number) => {
    try {
      const content = await ScriptService.getScriptContent(id);
      return content;
    } catch (e) {
      notifications.show({
        title: "Error",
        color: "red",
        message: "Failed to get script content",
      });
      throw e;
    }
  },
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

      // if the script is open, close it
      const editorTab = Object.entries(useEditorStore.getState().tabs).find(
        ([_, tab]) => tab.getState().scriptId == id
      );
      if (editorTab) {
        const [tabId, _] = editorTab;
        useEditorStore.getState().closeTab(tabId);
      }

      notifications.show({
        title: "Success",
        message: `Script file deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to delete script", error);
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
