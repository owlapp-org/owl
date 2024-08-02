import axios, { InternalAxiosRequestConfig } from "axios";
import { UserStorage } from "./storage";
import { API_URL } from "./constants";

const request = axios.create({
  baseURL: API_URL,
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = UserStorage.get()?.access_token;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default request;
