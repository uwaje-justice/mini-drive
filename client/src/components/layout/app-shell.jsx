import { FiFolder } from "react-icons/fi";
import { Link, NavLink, Outlet } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import LogoutButton from "@/features/auth/components/logout-button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const navItems = [{ to: "/drive", label: "My drive", icon: FiFolder }];

const AppShell = () => {
  const session = useSession();
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

        <nav className="grid gap-1" aria-label="Drive">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
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
          <LogoutButton showLabel={false} />
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
