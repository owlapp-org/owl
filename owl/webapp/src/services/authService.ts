import { API_URL } from "src/lib/constants";
import request from "src/lib/request";
import { ILoginResponse } from "@ts/interfaces/auth_interface";

export const login = async (
  email: string,
  password: string
): Promise<ILoginResponse> => {
  try {
    const response = await request.post("auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error("Login failed");
  }
};

export const googleLogin = () => {
  window.location.href = `${API_URL}/google/login`;
};
