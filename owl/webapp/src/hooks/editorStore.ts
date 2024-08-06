import DatabaseService from "@services/databaseService";
import { QueryResult } from "@ts/interfaces/database_interface";
import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import { v4 as uuidv4 } from "uuid";

interface EditorStore {
  code: string;
  selectedDatabase: string | null;
  queryResult?: QueryResult;
  data?: Record<string, any>[];
  setData: (newData?: Record<string, any>[]) => void;
  setCode: (code: string) => void;
  setDatabase: (database: string | null) => void;
  run: (
    databaseId: number,
    query: string,
    start_row?: number,
    end_row?: number
  ) => void;
}

const useEditorStore = create<EditorStore>((set, get) => ({
  code: "",
  selectedDatabase: null,
  data: [],
  queryResult: undefined,
  setData: (newData?: Record<string, any>[]) => {
    set((state) => ({
      data: [...(state.data || []), ...(newData || [])],
    }));
  },
  setCode: (code) => set({ code }),
  setDatabase: (database) => set({ selectedDatabase: database }),
  run: async (
    databaseId: number,
    query: string,
    start_row?: number,
    end_row?: number
  ) => {
    try {
      const result = await DatabaseService.run(
        databaseId,
        query,
        start_row,
        end_row
      );
      set((state) => ({
        queryResult: result,
        data: [...(state.data || []), ...(result.data || [])],
      }));
      if (result.affected_rows != null) {
        notifications.show({
          title: "Success",
          message: `Affected rows ${result.affected_rows}`,
        });
      } else {
        notifications.show({
          title: "Success",
          message: `Statement executed`,
        });
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error?.response?.data as string,
        color: "red",
      });
      throw error;
    }
  },
}));

export default useEditorStore;
