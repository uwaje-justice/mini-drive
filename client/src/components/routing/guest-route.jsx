import { Navigate, Outlet, useLocation } from "react-router-dom";

import SessionFallback from "@/components/routing/session-fallback.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const GuestRoute = () => {
  const session = useSession();
  const location = useLocation();

  if (session.isPending || session.isError) {
    return <SessionFallback session={session} />;
  }

  if (session.data?.user) {
    const from =
      typeof location.state?.from === "string" ? location.state.from : "/drive";

    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
