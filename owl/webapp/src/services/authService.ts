import { API_URL } from "src/lib/constants";
import request from "src/lib/request";

interface LoginResponse {
  name: string;
  email: string;
  access_token: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await request.post<LoginResponse>("auth/login", {
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
