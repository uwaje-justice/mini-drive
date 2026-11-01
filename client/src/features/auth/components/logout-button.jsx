import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import useLogout from "@/features/auth/hooks/use-logout.js";

const LogoutButton = ({ showLabel = true }) => {
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate("/login", { replace: true });
    } catch {
      return;
    }
  };

  return (
    <div className="grid gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="justify-start"
        onClick={handleLogout}
        isLoading={logout.isPending}
        aria-label={showLabel ? undefined : "Sign out"}
      >
        {!logout.isPending ? (
          <FiLogOut className="size-4" aria-hidden="true" />
        ) : null}
        {showLabel ? "Sign out" : null}
      </Button>
      {logout.isError ? (
        <p role="alert" className="px-3 text-xs text-error">
          {logout.error.message}
        </p>
      ) : null}
    </div>
  );
};

export default LogoutButton;
