import { create } from "zustand";
import {
  Database,
  DatabaseCreateOptions,
  DatabaseUpdateOptions,
} from "@ts/interfaces/database_interface";
import DatabaseService from "@services/databaseService";
import { notifications } from "@mantine/notifications";

interface DatabaseState {
  databases: Database[];
  fetched: boolean;
  fetchDatabases: (force?: boolean) => void;
  createDatabase: (database: DatabaseCreateOptions) => void;
  removeDatabase: (id: number) => void;
  updateDatabase: (id: number, database: DatabaseUpdateOptions) => void;
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  databases: [],
  fetched: false,
  fetchDatabases: async (force = false) => {
    if (force || !get().fetched) {
      try {
        const data = await DatabaseService.list();
        set({ databases: data, fetched: true });
      } catch (error) {
        console.error("Failed to fetch databases", error);
      }
    }
  },
  createDatabase: async (database: DatabaseCreateOptions) => {
    try {
      const result = await DatabaseService.create({
        name: database.name,
        pool_size: database.pool_size,
        description: database.description,
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
  removeDatabase: async (id: number) => {
    try {
      await DatabaseService.del(id);
      set((state) => ({
        databases: state.databases.filter((db) => db.id !== id),
      }));
    } catch (error) {
      console.error("Failed to create database", error);
    }
  },
  updateDatabase: async (id: number, database: DatabaseUpdateOptions) => {
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
        title: "Error",
        color: "red",
        message: `Failed to update database: ${err}`,
      });
    }
  },
}));
