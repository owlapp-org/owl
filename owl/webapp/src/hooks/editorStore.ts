import DatabaseService from "@services/databaseService";
import { create, StoreApi, UseBoundStore } from "zustand";
import { notifications } from "@mantine/notifications";
import { v4 as uuidv4 } from "uuid";
import { IScript } from "@ts/interfaces/script_interface";

export interface IEditorTabStore {
  id: string;
  script?: IScript;
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

const createTabStore = () =>
  create<IEditorTabStore>((set, get) => ({
    id: uuidv4(),
    script: undefined,
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

export interface IEditorStore {
  activeTab: string | null;
  tabs: Record<string, UseBoundStore<StoreApi<IEditorTabStore>>>;
  setActiveTab(id: string | null): void;
  getTabCount(): number;
  addTab: (scrip?: IScript) => UseBoundStore<StoreApi<IEditorTabStore>>;
  closeTab: (id: string) => void;
}

const useEditorStore = create<IEditorStore>((set, get) => ({
  activeTab: null,
  tabs: {},
  setActiveTab: (id: string) => {
    set({
      activeTab: id,
    });
  },
  getTabCount: () => {
    return Object.keys(get().tabs).length;
  },
  addTab: (script?: IScript) => {
    const id = uuidv4();
    const store = createTabStore();
    store.setState({ script: script });
    set((state) => ({
      activeTab: id,
      tabs: {
        ...state.tabs,
        [id]: store,
      },
    }));
    return store;
  },
  closeTab: (id: string) => {
    set((state) => {
      const newTabs = { ...state.tabs };
      delete newTabs[id];
      // If the closed tab was the active tab, set a new active tab
      let newActiveTab = state.activeTab === id ? null : state.activeTab;

      // If there are still tabs left, set the first tab as the active tab
      if (newActiveTab === null && Object.keys(newTabs).length > 0) {
        newActiveTab = Object.keys(newTabs)[0];
      }

      return { tabs: newTabs, activeTab: newActiveTab };
    });
  },
}));

export default useEditorStore;

// export interface EditorStore {
//   id: string;
//   code: string;
//   selectedDatabase: string | null;
//   setCode: (code: string) => void;
//   setDatabase: (database: string | null) => void;
//   run: (
//     databaseId: number,
//     query: string,
//     start_row?: number,
//     end_row?: number,
//     with_total_count?: boolean
//   ) => any;
// }

// const useEditorStore = create<EditorStore>((set, get) => ({
//   id: uuidv4(),
//   code: "",
//   selectedDatabase: null,
//   data: [],
//   queryResult: undefined,
//   setCode: (code) => set({ code }),
//   setDatabase: (database) => set({ selectedDatabase: database }),
//   run: async (
//     databaseId: number,
//     query: string,
//     start_row?: number,
//     end_row?: number,
//     with_total_count: boolean = true
//   ) => {
//     try {
//       const result = await DatabaseService.run(
//         databaseId,
//         query,
//         start_row,
//         end_row,
//         with_total_count
//       );
//       if (result.affected_rows != null) {
//         notifications.show({
//           title: "Success",
//           message: `Affected rows ${result.affected_rows}`,
//         });
//       } else if (!start_row) {
//         // show only once not for all pagination requests
//         notifications.show({
//           title: "Success",
//           message: `Statement executed`,
//         });
//       }
//       return result;
//     } catch (error: any) {
//       notifications.show({
//         title: "Error",
//         message: error?.response?.data as string,
//         color: "red",
//       });
//       throw error;
//     }
//   },
// }));

// const createEditorStore = () => useEditorStore;

// export default useEditorStore;
// export { createEditorStore };
