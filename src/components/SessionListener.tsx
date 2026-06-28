import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserContext from "../hooks/useUserContext";
import { sessionStore } from "../utils/sessionStore";

/**
 * Listens for the `api:unauthorized` custom event (fired by api/client.ts on
 * every 401 response) and clears the session + redirects to login.
 *
 * Must be rendered inside BrowserRouter and UserProvider.
 */
export default function SessionListener() {
  const navigate = useNavigate();
  const { setToken, setUser } = useUserContext();

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      sessionStore.clearAll();
      navigate("/account?mode=login", {
        replace: true,
        state: { reason: "session-expired" },
      });
    };

    window.addEventListener("api:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("api:unauthorized", handleUnauthorized);
  }, [navigate, setToken, setUser]);

  return null;
}
