/**
 * Compatibility shim — re-exports useUserContext with the shape that existing
 * components expect. New code should import useUserContext directly.
 */
import useUserContext from "../hooks/useUserContext";

const useAuthContext = () => {
  const { user, setUser, token, setToken, logout, loading } = useUserContext();

  return {
    user,
    setUser,
    token,
    setToken,
    logout,
    loading,
    // API key is returned by GET /user/ and stored in user.api_key
    key: user?.api_key ?? null,
    // Legacy stubs — no longer used internally
    fetchUserData: async (_token: string) => user,
    refreshAccessToken: async () => token,
  };
};

export default useAuthContext;
