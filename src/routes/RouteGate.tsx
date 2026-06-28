import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserContext from "../hooks/useUserContext";

type RouteGateProps = {
  requireUser?: boolean;
  redirectAuthenticated?: boolean;
};

/**
 * Flexible route guard.
 *
 * - `requireUser`           — redirect to login if not authenticated
 * - `redirectAuthenticated` — redirect to /dashboard if already authenticated
 *                             (use on /account page so logged-in users skip login)
 */
const RouteGate = ({
  requireUser = false,
  redirectAuthenticated = false,
}: RouteGateProps) => {
  const location = useLocation();
  const { user, token, loading } = useUserContext();

  // Wait for the initial session hydration before making redirect decisions
  if (loading) return null;

  const isAuthenticated = Boolean(user || token);

  if (redirectAuthenticated && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireUser && !isAuthenticated) {
    return (
      <Navigate
        to="/account?mode=login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default RouteGate;
