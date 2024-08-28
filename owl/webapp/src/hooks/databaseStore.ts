import { create } from "zustand";
import {
  IDatabase,
  IDatabaseCreateOptions,
  IDatabaseUpdateOptions,
} from "@ts/interfaces/database_interface";
import DatabaseService from "@services/databaseService";
import { notifications } from "@mantine/notifications";

interface IDatabaseState {
  databases: IDatabase[];
  fetched: boolean;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
  fetchAll: (force?: boolean) => void;
  create: (database: IDatabaseCreateOptions) => void;
  remove: (id: number) => void;
  update: (id: number, database: IDatabaseUpdateOptions) => void;
}

const useDatabaseStore = create<IDatabaseState>((set, get) => ({
  databases: [],
  fetched: false,
  isCreateModalOpen: false,
  setIsCreateModalOpen: (isCreateModalOpen: boolean) =>
    set({ isCreateModalOpen }),
  fetchAll: async (force = false) => {
    if (force || !get().fetched) {
      try {
        const databases = await DatabaseService.fetchAll();
        set({ databases, fetched: true });
      } catch (error) {
        console.error("Failed to fetch databases", error);
      }
    }
  },
  create: async (database: IDatabaseCreateOptions) => {
    try {
      const { name, pool_size, description } = database;
      const result = await DatabaseService.create({
        name,
        pool_size,
        description,
      });
      notifications.show({
        title: "Success",
        message: `Database created successfully`,
      });
      set((state) => ({ databases: [...state.databases, result] }));
    } catch (error: any) {
      console.error("Error creating database", error);
      notifications.show({
        title: "Error",
        color: "red",
        message: `Failed to create database. ${error?.response?.data}`,
      });
    }
  },
  remove: async (id: number) => {
    try {
      await DatabaseService.remove(id);
      set((state) => ({
        databases: state.databases.filter((db) => db.id !== id),
      }));
    } catch (error) {
      console.error("Failed to create database", error);
    }
  },
  update: async (id: number, database: IDatabaseUpdateOptions) => {
    try {
      const updatedDatabase = await DatabaseService.update(id, database);
      set((state) => ({
        databases: state.databases.map((db) =>
          db.id === id ? updatedDatabase : db
        ),
      }));
      notifications.show({
        title: "Success",
        message: `Database updated successfully`,
      });
    } catch (err) {
      console.error("Failed to update database.", err);
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to update database: ${err}`,
      });
    }
  },
}));

export default useDatabaseStore;
