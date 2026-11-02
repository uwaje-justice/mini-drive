import { FiGithub } from "react-icons/fi";
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
        <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start max-sm:gap-2">
          <a
            aria-label="View the project source on GitHub (opens in a new tab)"
            className={`inline-flex items-center gap-2 ${footerLinkClass}`}
            href="https://github.com/uwaje-justice/mini-drive"
            rel="noopener noreferrer"
            target="_blank"
          >
            <FiGithub className="size-4" aria-hidden="true" />
            GitHub
          </a>
          <span
            aria-hidden="true"
            className="h-4 w-px bg-outline-variant max-sm:hidden"
          />
          <p className="text-xs text-on-surface-variant">© {year} Mini Drive</p>
        </div>
      </Container>
    </footer>
  );
};

export default LandingFooter;
