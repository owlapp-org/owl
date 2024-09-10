import { API_URL } from "@lib/constants";
import { IUser } from "@ts/interfaces/user_interface";
import axios from "axios";
import request from "src/lib/request";

namespace UserService {
  export const findMe = async (access_token: string | undefined) => {
    if (access_token) {
      return await axios
        .create({ baseURL: API_URL })
        .get<IUser>("users/me", {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        })
        .then((response) => response.data);
    } else {
      return request.get<IUser>("users/me").then((response) => response.data);
    }
  };
  export const updatePassword = async (password: string): Promise<IUser> => {
    return request
      .put("users/password", {
        password: password,
      })
      .then((response) => response.data);
  };
  export const updateUser = async (
    name?: string,
    password?: string
  ): Promise<IUser> => {
    let payload = {};
    name && (payload = { ...payload, name });
    password && (payload = { ...payload, password });

    return request
      .put("users/password", payload)
      .then((response) => response.data);
  };
}

export default UserService;
