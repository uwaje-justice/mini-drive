import { Link } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import LogoutButton from "@/features/auth/components/logout-button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const LandingHeader = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" to="/">
          <BrandMark className="brand__mark" />
          Mini Drive
        </Link>

        <nav className="site-nav site-nav--landing" aria-label="Landing page">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <div className="site-actions">
          {user ? (
            <>
              <Link className="button button--primary button--small" to="/drive">
                Open my drive
              </Link>
              <div className="site-user">
                <span className="site-user__email">{user.email}</span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link className="site-link" to="/login">
                Sign in
              </Link>
              <Link
                className="button button--primary button--small"
                to="/register"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
