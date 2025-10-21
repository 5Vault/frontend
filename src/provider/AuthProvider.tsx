import { useEffect, useState, type ReactNode } from "react";
import type { User } from "../@types/Contexts";
import AuthContext from "../context/AuthContext";
import axios from "axios";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState<string | null>(null);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(import.meta.env.VITE_SERVER_URL +"/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      const userObj = {
        user_id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        username: response.data.username,
        phone: response.data.phone,
        tier: response.data.tier || null,
        tier_name: response.data.tier_name || null,
        tier_update_at: response.data.tier_update_at || null,
        created_at: response.data.created_at || null,
        updated_at: response.data.updated_at || null,
      };
      setUser(userObj);
      setKey(response.data.api_key || null);
      return userObj;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário", error);
      setUser(null);
      localStorage.removeItem("token");
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const refreshAccessToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.post(
          import.meta.env.VITE_SERVER_URL + "/refresh-token/",
          { token }
        );
        const newToken = response.data.token;
        localStorage.setItem("token", newToken);
        return newToken;
      } catch (error) {
        console.error("Erro ao atualizar token", error);
      }
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        refreshAccessToken,
        fetchUserData,
        loading,
        key,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
