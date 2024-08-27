import { IUser } from "@ts/interfaces/user_interface";
import request from "src/lib/request";

namespace UserService {
  export const updatePassword = async (password: string): Promise<IUser> => {
    return request
      .put("users/password", {
        password: password,
      })
      .then((response) => response.data);
  };
}

export default UserService;
