import DatabaseService from "@services/databaseService";
import { create } from "zustand";
import { notifications } from "@mantine/notifications";
import { v4 as uuidv4 } from "uuid";

export interface EditorStore {
  id: string;
  code: string;
  selectedDatabase: string | null;
  setCode: (code: string) => void;
  setDatabase: (database: string | null) => void;
  run: (
    databaseId: number,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count?: boolean
  ) => any;
}

const useEditorStore = create<EditorStore>((set, get) => ({
  id: uuidv4(),
  code: "",
  selectedDatabase: null,
  data: [],
  queryResult: undefined,
  setCode: (code) => set({ code }),
  setDatabase: (database) => set({ selectedDatabase: database }),
  run: async (
    databaseId: number,
    query: string,
    start_row?: number,
    end_row?: number,
    with_total_count: boolean = true
  ) => {
    try {
      const result = await DatabaseService.run(
        databaseId,
        query,
        start_row,
        end_row,
        with_total_count
      );
      if (result.affected_rows != null) {
        notifications.show({
          title: "Success",
          message: `Affected rows ${result.affected_rows}`,
        });
      } else if (!start_row) {
        // show only once not for all pagination requests
        notifications.show({
          title: "Success",
          message: `Statement executed`,
        });
      }
      return result;
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

const createEditorStore = () =>
  create<EditorStore>((set, get) => ({
    id: uuidv4(),
    code: "",
    selectedDatabase: null,
    data: [],
    queryResult: undefined,
    setCode: (code) => set({ code }),
    setDatabase: (database) => set({ selectedDatabase: database }),
    run: async (
      databaseId: number,
      query: string,
      start_row?: number,
      end_row?: number,
      with_total_count: boolean = true
    ) => {
      try {
        const result = await DatabaseService.run(
          databaseId,
          query,
          start_row,
          end_row,
          with_total_count
        );
        if (result.affected_rows != null) {
          notifications.show({
            title: "Success",
            message: `Affected rows ${result.affected_rows}`,
          });
        } else if (!start_row) {
          // show only once not for all pagination requests
          notifications.show({
            title: "Success",
            message: `Statement executed`,
          });
        }
        return result;
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
export { createEditorStore };
