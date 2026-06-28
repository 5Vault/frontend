import axios from "axios";
import { useMemo } from "react";
import useAuthContext from "../hook/useAuthContext";
import { sessionStore } from "./sessionStore";

const useAxios = () => {
  const { refreshAccessToken } = useAuthContext();

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:3000/api",
    });

    instance.interceptors.request.use(
      async (config) => {
        const token = sessionStore.getUserToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const token = await refreshAccessToken();
          if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            return instance(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [refreshAccessToken]);

  return axiosInstance;
};

export default useAxios;
