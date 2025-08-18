import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../hook/useAuthContext";

const PrivateRoutes = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    // Pode exibir um spinner ou null enquanto carrega
    return null;
  }

  if (!user) {
    return <Navigate to="/account/?mode=login" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
