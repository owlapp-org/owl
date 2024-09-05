export enum StorageType {
  Session,
  Local,
}

export interface User {
  access_token: string;
  email: string;
  name: string;
}

export class UserStorage {
  static readonly STORAGE_KEY = "user";

  static get(): User | null {
    let data = localStorage.getItem(UserStorage.STORAGE_KEY);
    if (!data) {
      data = sessionStorage.getItem(UserStorage.STORAGE_KEY);
    }

    if (data) {
      try {
        return JSON.parse(data) as User;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  }

  static set(user: User, storageType: StorageType = StorageType.Session) {
    // todo fix this
    try {
      if (
        storageType == StorageType.Session ||
        localStorage.getItem(UserStorage.STORAGE_KEY)
      ) {
        sessionStorage.setItem(UserStorage.STORAGE_KEY, JSON.stringify(user));
      }
      if (
        storageType == StorageType.Local ||
        sessionStorage.getItem(UserStorage.STORAGE_KEY)
      ) {
        localStorage.setItem(UserStorage.STORAGE_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  }

  static clear() {
    localStorage.removeItem(UserStorage.STORAGE_KEY);
    sessionStorage.removeItem(UserStorage.STORAGE_KEY);
  }
}
