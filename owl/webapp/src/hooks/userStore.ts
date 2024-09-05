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
  loadFromLocalStorage: () => Promise<boolean>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  saveStateToLocalStorage: () => void;
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
    set({ name, email, access_token, isRememberMe });
    if (isRememberMe) {
      localStorage.setItem("access_token", access_token);
    }
    return true;
  },
  checkAuthentication: async () => {
    const { isAuthenticated, loadFromLocalStorage } = get();
    if (isAuthenticated) {
      return Promise.resolve(true);
    } else {
      return loadFromLocalStorage();
    }
  },
  loadFromLocalStorage: async () => {
    let access_token = localStorage.getItem("access_token");
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
      remember && get().saveStateToLocalStorage();
    } catch (err) {
      notifications.show({
        color: "red",
        title: "Error",
        message: `Failed to login ${err}`,
      });
      throw err;
    }
  },
  saveStateToLocalStorage: () => {
    const { access_token, name, email } = get();
    sessionStorage.setItem(
      "user",
      JSON.stringify({
        name,
        email,
        access_token,
      })
    );
  },
}));

export default useUserStore;
