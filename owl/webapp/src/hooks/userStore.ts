import { notifications } from "@mantine/notifications";
import { AuthService } from "@services/authService";
import UserService from "@services/userService";
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
  loadFromLocalStorage: () => Promise<boolean>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  saveStateToLocalStorage: () => void;
}

const useUserStore = create<IUserState>((set, get) => ({
  access_token: undefined,
  name: "",
  email: "",
  loadFromLocalStorage: async () => {
    let serializedUser = localStorage.getItem("user");
    if (!serializedUser) {
      return Promise.resolve(false);
    }
    const user = JSON.parse(serializedUser as string) as IUser;
    try {
      const me = await UserService.findMe(user.access_token);
      set({
        access_token: user.access_token,
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
