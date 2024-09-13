import { create } from "zustand";

import { notifications } from "@mantine/notifications";
import { IScript } from "@ts/interfaces/script_interface";
import MacroFileService from "@services/macrofileService";
import useEditorStore from "./editorStore";
import { IMacroFile } from "@ts/interfaces/macrofile_interface";

interface IMacroFileState {
  macrofiles: IMacroFile[];
  create: (name: string, content?: string) => Promise<IScript>;
  updateContent: (id: number, content: string) => void;
  fetchContent: (id: number) => Promise<string>;
  fetchAll: () => void;
  upload: (data: FormData) => void;
  remove: (id: number) => void;
  rename: (id: number, name: string) => void;
  findById: (id: number) => IScript | undefined;
}

const useMacroFileStore = create<IMacroFileState>((set, get) => ({
  macrofiles: [],
  updateContent: async (id: number, content: string) => {
    return MacroFileService.updateContent(id, content);
  },
  fetchContent: async (id: number) => {
    try {
      const content = await MacroFileService.fetchContent(id);
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
      const files = await MacroFileService.fetchAll();
      set({ macrofiles: files });
    } catch (error) {
      console.error("Failed to fetch script files", error);
      throw error;
    }
  },
  create: async (name: string, content?: string) => {
    try {
      const script = await MacroFileService.create(name, content);
      set((state) => ({ macrofiles: [...state.macrofiles, script] }));
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
      const file = await MacroFileService.upload(data);
      set((state) => ({ macrofiles: [...state.macrofiles, file] }));
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
      await MacroFileService.remove(id);
      set((state) => ({
        macrofiles: state.macrofiles.filter((mf) => mf.id !== id),
      }));
      // if the macro file is open, close it
      const editorTab = Object.entries(useEditorStore.getState().tabs).find(
        ([_, tab]) => tab.getState().file.id === id
      );
      if (editorTab) {
        const [tabId, _] = editorTab;
        useEditorStore.getState().closeTab(tabId);
      }
      notifications.show({
        title: "Success",
        message: `Macro file deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to delete macro", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to delete macro file: ${error}`,
      });
    }
  },
  rename: async (id: number, name: string) => {
    try {
      const file = await MacroFileService.update(id, name);
      set((state) => ({
        macrofiles: state.macrofiles.map((mf) => (mf.id === id ? file : mf)),
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
    const macrofiles = get().macrofiles;
    for (let i = 0; i < macrofiles.length; i++) {
      if (macrofiles[i].id === id) {
        return macrofiles[i];
      }
    }
  },
}));

export default useMacroFileStore;
