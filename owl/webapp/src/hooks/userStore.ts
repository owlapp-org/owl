import { AppStorage } from "@lib/storage";
import { notifications } from "@mantine/notifications";
import { AuthService } from "@services/authService";
import UserService from "@services/userService";
import Cookies from "js-cookie";
import { create } from "zustand";

export interface IUser {
  access_token: string;
  email: string;
  name: string;
}

interface IUserState {
  access_token: string | undefined;
  name: string;
  email: string;
  isAuthenticated: boolean | null;
  isRememberMe: boolean | null;
  googleAuth: () => boolean;
  checkAuthentication: () => Promise<boolean>;
  loadFromStorage: () => Promise<boolean>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  saveStateToLocalStorage: (remember: boolean) => void;
  update: (name: string | undefined, password: string | undefined) => void;
}

const useUserStore = create<IUserState>((set, get) => ({
  access_token: undefined,
  name: "",
  email: "",
  isAuthenticated: null,
  isRememberMe: false,
  googleAuth: () => {
    const { name, email, access_token, isRememberMe } = {
      name: Cookies.get("google-user-name") as string,
      email: Cookies.get("google-user-email") as string,
      access_token: Cookies.get("google-user-access_token") as string,
      isRememberMe: Cookies.get("login-remember-me") == "true",
    };
    if (!access_token) return false;
    const isAuthenticated = true;
    set({ name, email, access_token, isRememberMe, isAuthenticated });
    AppStorage.setAccessToken(access_token, isRememberMe);
    return true;
  },
  checkAuthentication: async () => {
    const { isAuthenticated, loadFromStorage } = get();
    if (isAuthenticated) {
      return Promise.resolve(true);
    } else {
      return loadFromStorage();
    }
  },
  loadFromStorage: async () => {
    let access_token = AppStorage.getAccessToken();
    if (!access_token) {
      return Promise.resolve(false);
    }
    try {
      const me = await UserService.findMe(access_token);
      set({
        isAuthenticated: true,
        access_token,
        name: me.name,
        email: me.email,
      });
      return Promise.resolve(true);
    } catch (err) {
      console.log("Access token is not valid");
    }

    return Promise.resolve(false);
  },
  login: async (email: string, password: string, remember: boolean = false) => {
    try {
      const user = await AuthService.login(email, password);
      set({
        access_token: user.access_token,
        name: user.name,
        email: user.email,
      });
      get().saveStateToLocalStorage(remember);
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to login ${err}`,
      });
      throw err;
    }
  },
  saveStateToLocalStorage: (remember: boolean) => {
    const { access_token } = get();
    access_token && AppStorage.setAccessToken(access_token, remember);
  },
  update: async (name: string | undefined, password: string | undefined) => {
    try {
      const user = await UserService.updateUser(name, password);
      name && set({ name: user.name });
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to update ${err}`,
      });
      throw err;
    }
  },
}));

export default useUserStore;
