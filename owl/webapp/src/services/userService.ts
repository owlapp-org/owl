import request from "src/lib/request";

namespace UserService {
  export const updatePassword = async (password: string) => {
    return request
      .put("users/password", {
        password: password,
      })
      .then((response) => response.data);
  };
}

export default UserService;
