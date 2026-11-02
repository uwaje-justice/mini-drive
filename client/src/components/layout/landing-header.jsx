import { Link, NavLink } from "react-router-dom";

import BrandLink from "@/components/layout/brand-link.jsx";
import Container from "@/components/layout/container.jsx";
import LinkButton from "@/components/ui/link-button.jsx";
import LogoutButton from "@/features/auth/components/logout-button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const navLinkBase =
  "rounded-full px-3 py-[0.55rem] text-sm font-medium no-underline transition hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";
const navLinkClass = `${navLinkBase} text-on-surface-variant`;
const navLinkActiveClass = `${navLinkBase} text-primary`;
const textLinkClass =
  "rounded-full px-3 py-[0.55rem] text-sm font-medium text-on-surface-variant no-underline transition hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const LandingHeader = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant/80 bg-surface/90 backdrop-blur-[18px]">
      <Container className="flex min-h-18 items-center gap-6 max-[820px]:flex-wrap max-[820px]:gap-3 max-[820px]:py-3">
        <BrandLink />

        <nav
          className="mr-auto flex flex-wrap items-center gap-1 max-[820px]:hidden"
          aria-label="Landing page"
        >
          <Link to="/#features" className={navLinkClass}>
            Features
          </Link>
          <Link to="/#how-it-works" className={navLinkClass}>
            How it works
          </Link>
          <Link to="/#privacy" className={navLinkClass}>
            Privacy
          </Link>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? navLinkActiveClass : navLinkClass
            }
          >
            About
          </NavLink>
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <LinkButton to="/drive" size="sm">
                Open my drive
              </LinkButton>
              <div className="flex items-center gap-1">
                <span className="hidden max-w-48 truncate text-sm text-on-surface-variant sm:inline">
                  {user.email}
                </span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={textLinkClass}>
                Sign in
              </Link>
              <LinkButton to="/register" size="sm">
                Create account
              </LinkButton>
            </>
          )}
        </div>
      </Container>
    </header>
  );
};

export default LandingHeader;
