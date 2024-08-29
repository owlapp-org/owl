import { create } from "zustand";

import { notifications } from "@mantine/notifications";
import { IScript } from "@ts/interfaces/script_interface";
import ScriptService from "@services/scriptService";
import useEditorStore from "./editorStore";

interface IScriptState {
  scripts: IScript[];
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
  create: (name: string, content?: string) => Promise<IScript>;
  updateContent: (id: number, content: string) => void;
  fetchContent: (id: number) => Promise<string>;
  fetchAll: () => void;
  upload: (data: FormData) => void;
  remove: (id: number) => void;
  rename: (id: number, name: string) => void;
  findById: (id: number) => IScript | undefined;
}

const useScriptStore = create<IScriptState>((set, get) => ({
  scripts: [],
  isCreateModalOpen: false,
  setIsCreateModalOpen: (isCreateModalOpen: boolean) =>
    set({ isCreateModalOpen }),
  updateContent: async (id: number, content: string) => {
    return ScriptService.updateContent(id, content);
  },
  fetchContent: async (id: number) => {
    try {
      const content = await ScriptService.fetchContent(id);
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
  fetchAll: async () => {
    try {
      const files = await ScriptService.fetchAll();
      set({ scripts: files });
    } catch (error) {
      console.error("Failed to fetch script files", error);
      throw error;
    }
  },
  create: async (name: string, content?: string) => {
    try {
      const script = await ScriptService.create(name, content);
      set((state) => ({ scripts: [...state.scripts, script] }));
      notifications.show({
        title: "Success",
        message: `Script file created successfully`,
      });
      return script;
    } catch (error) {
      console.error("Failed to create file", error);
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to create file ${error}`,
      });
      throw error;
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
        message: `Failed to upload script file ${error}`,
      });
    }
  },
  remove: async (id: number) => {
    try {
      await ScriptService.remove(id);
      set((state) => ({
        scripts: state.scripts.filter((s) => s.id !== id),
      }));
      // if the script is open, close it
      const editorTab = Object.entries(useEditorStore.getState().tabs).find(
        ([_, tab]) => tab.getState().file.id === id
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
  rename: async (id: number, name: string) => {
    try {
      const file = await ScriptService.rename(id, name);
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? file : s)),
      }));

      const editorTab = Object.entries(useEditorStore.getState().tabs).find(
        ([_, tab]) => tab.getState().file.id === id
      );
      if (editorTab) {
        const [_, tabStore] = editorTab;
        const tabFile = tabStore.getState().file;
        tabStore.setState({
          file: {
            ...tabFile,
            name: file.name,
          },
        });
      }

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
  findById: (id: number) => {
    const scripts = get().scripts;
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].id === id) {
        return scripts[i];
      }
    }
  },
}));

export default useScriptStore;
