import {
  FiClock,
  FiFile,
  FiFolder,
  FiHome,
  FiSearch,
  FiSettings,
} from "react-icons/fi";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import LogoutButton from "@/features/auth/components/logout-button.jsx";
import ProfileMenu from "@/features/auth/components/profile-menu.jsx";
import useSession from "@/features/auth/hooks/use-session.js";
import SearchForm from "@/features/search/components/search-form.jsx";

const navItems = [
  { to: "/drive", label: "My drive", icon: FiHome, end: true },
  { to: "/drive/activity", label: "Activity", icon: FiClock },
  { to: "/drive/files", label: "Files", icon: FiFile },
  { to: "/drive/folders", label: "Folders", icon: FiFolder },
  { to: "/drive/settings", label: "Settings", icon: FiSettings },
];

const AppShell = () => {
  const session = useSession();
  const navigate = useNavigate();
  const email = session.data?.user?.email ?? "";
  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-dvh bg-surface-container-low lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-5 border-r border-outline-variant bg-surface px-4 py-5 lg:flex">
        <Link
          to="/drive"
          className="inline-flex items-center gap-2.5 px-2 text-base font-semibold tracking-tight text-on-surface"
        >
          <BrandMark className="size-9" />
          Mini Drive
        </Link>

        <div className="px-1">
          <SearchForm
            compact
            onSearch={(value) =>
              navigate(
                value
                  ? `/drive/search?q=${encodeURIComponent(value)}`
                  : "/drive/search",
              )
            }
          />
        </div>

        <nav className="grid gap-1" aria-label="Drive">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-container text-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-outline-variant bg-surface-container-low p-2">
          <div className="flex items-center gap-2.5 p-1.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary),#3d78f4)] text-sm font-semibold text-on-primary shadow-sm">
              {initial}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="text-[0.68rem] leading-3 text-on-surface-variant">
                Signed in as
              </span>
              <span className="truncate text-xs font-medium text-on-surface">
                {email}
              </span>
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between border-b border-outline-variant bg-surface px-5 py-3 lg:hidden">
          <Link
            to="/drive"
            className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-on-surface"
          >
            <BrandMark className="size-8" />
            Mini Drive
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/drive/search"
              className="grid size-9 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Search your drive"
            >
              <FiSearch className="size-5" aria-hidden="true" />
            </Link>
            <ProfileMenu email={email} />
          </div>
        </header>

        <main className="flex-1 px-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>

        <nav
          aria-label="Drive"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant bg-surface px-2 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <ul className="grid grid-cols-5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-[0.68rem] font-medium transition ${
                        isActive
                          ? "text-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`grid size-7 place-items-center rounded-full transition ${
                            isActive ? "bg-primary-container" : ""
                          }`}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AppShell;
