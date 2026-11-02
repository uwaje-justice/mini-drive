import { Link } from "react-router-dom";

import BrandLink from "@/components/layout/brand-link.jsx";
import Container from "@/components/layout/container.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const footerLinkClass =
  "text-sm text-on-surface-variant no-underline transition hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const LandingFooter = () => {
  const session = useSession();
  const user = session.data?.user;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-outline-variant bg-surface-container-low py-8">
      <Container className="flex flex-wrap items-center justify-between gap-5 max-sm:flex-col max-sm:items-start">
        <div>
          <BrandLink />
          <p className="mt-2 text-xs text-on-surface-variant">
            A personal drive for folders, files, and expiring links.
          </p>
        </div>
        <nav className="flex flex-wrap gap-5" aria-label="Footer">
          <Link to="/#features" className={footerLinkClass}>
            Features
          </Link>
          <Link to="/#how-it-works" className={footerLinkClass}>
            How it works
          </Link>
          <Link to="/#privacy" className={footerLinkClass}>
            Privacy
          </Link>
          <Link to="/about" className={footerLinkClass}>
            About
          </Link>
          <a
            aria-label="View the project source on GitHub (opens in a new tab)"
            className={footerLinkClass}
            href="https://github.com/uwaje-justice/mini-drive"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          {user ? (
            <Link to="/drive" className={footerLinkClass}>
              My drive
            </Link>
          ) : (
            <>
              <Link to="/login" className={footerLinkClass}>
                Sign in
              </Link>
              <Link to="/register" className={footerLinkClass}>
                Create account
              </Link>
            </>
          )}
        </nav>
        <p className="text-xs text-on-surface-variant">© {year} Mini Drive</p>
      </Container>
    </footer>
  );
};

export default LandingFooter;
