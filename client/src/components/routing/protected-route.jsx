import { Navigate, Outlet, useLocation } from "react-router-dom";

import SessionFallback from "@/components/routing/session-fallback.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const ProtectedRoute = () => {
  const session = useSession();
  const location = useLocation();

  if (session.isPending || session.isError) {
    return <SessionFallback session={session} />;
  }

  if (!session.data?.user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
