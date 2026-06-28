import { type ReactNode, useState, useEffect, useCallback } from "react";
import { UserContext } from "../contexts/UserContext";
import type { UserType } from "../@types/UserTypes";
import { sessionStore } from "../utils/sessionStore";
import { logger } from "../utils/logger";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(() => sessionStore.getUser());
  const [token, setToken] = useState<string | null>(() => sessionStore.getUserToken());
  const [loading, setLoading] = useState(true);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    sessionStore.setUser(user);
  }, [user]);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    sessionStore.setUserToken(token);
  }, [token]);

  // On token change: fetch fresh user data from the server
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const syncUser = async () => {
      try {
        const { verifyCurrentUser } = await import("../services/AuthService");
        const freshUser = await verifyCurrentUser(token);
        setUser(freshUser);
      } catch (error) {
        logger.error("Erro ao sincronizar dados do usuário:", error);
        // On 401 the SessionListener handles logout; for other errors keep existing user
      } finally {
        setLoading(false);
      }
    };

    syncUser();
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    sessionStore.clearAll();
    window.location.href = "/";
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
