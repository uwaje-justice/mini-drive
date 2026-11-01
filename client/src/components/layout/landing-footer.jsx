import { Link } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const LandingFooter = () => {
  const session = useSession();
  const user = session.data?.user;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <Link className="brand" to="/">
            <BrandMark className="brand__mark" />
            Mini Drive
          </Link>
          <p className="site-footer__note">
            A personal drive for folders, files, and expiring links.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <Link to="/#features">Features</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#privacy">Privacy</Link>
          <Link to="/about">About</Link>
          {user ? (
            <Link to="/drive">My drive</Link>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>
        <p className="site-footer__note">© {year} Mini Drive</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
