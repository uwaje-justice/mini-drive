import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCode,
  FiGithub,
  FiHardDrive,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import LandingFooter from "@/components/layout/landing-footer.jsx";
import LandingHeader from "@/components/layout/landing-header.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const secondaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-outline-variant bg-surface px-5 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const projectFacts = [
  {
    icon: FiBookOpen,
    label: "Brief",
    value: "The Odin Project",
  },
  {
    icon: FiCode,
    label: "Stack",
    value: "Express, Prisma, React",
  },
  {
    icon: FiHardDrive,
    label: "Limits",
    value: "10 files per upload. 5 MB each. Links last 1 to 365 days.",
  },
];

const AboutPage = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <>
      <LandingHeader />

      <main className="landing-page">
        <section
          aria-labelledby="about-title"
          className="container grid gap-10 py-10 lg:min-h-[calc(100dvh-12rem)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center lg:gap-16 lg:py-14"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              About Mini Drive
            </p>
            <h1
              className="mt-3 text-2xl font-semibold leading-[1.05] tracking-[-0.05em] text-on-surface sm:text-3xl"
              id="about-title"
            >
              I built Mini Drive around a brief from The Odin Project.
            </h1>
            <div className="mt-5 max-w-xl space-y-4 text-sm leading-7 text-on-surface-variant sm:text-base">
              <p>
                The assignment was a file uploader with accounts, folders,
                uploads, file details, downloads, and expiring share links. I
                used that as the starting point and built a small personal
                drive around it.
              </p>
              <p>
                The project stays deliberately small: up to 10 files per
                upload, 5 MB per file, and share links from 1 to 365 days. The
                API uses Express and Prisma. The client uses React.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {user ? (
                <Link className={primaryLinkClass} to="/drive">
                  Open my drive
                </Link>
              ) : (
                <Link className={primaryLinkClass} to="/register">
                  Create my drive
                </Link>
              )}
              <Link className={secondaryLinkClass} to="/">
                <FiArrowLeft className="size-4" aria-hidden="true" />
                Back to home
              </Link>
            </div>
          </div>

          <aside
            aria-labelledby="project-card-title"
            className="w-full rounded-2xl border border-outline-variant bg-surface p-5 shadow-2 lg:max-w-none"
          >
            <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-primary-container">
                <BrandMark className="size-7" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                  Project card
                </p>
                <h2
                  className="text-lg font-semibold tracking-tight text-on-surface"
                  id="project-card-title"
                >
                  Mini Drive
                </h2>
              </div>
            </div>

            <dl className="divide-y divide-outline-variant">
              {projectFacts.map((fact) => {
                const Icon = fact.icon;

                return (
                  <div className="flex gap-3 py-4" key={fact.label}>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-surface-container-low text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-sm leading-6 font-medium text-on-surface">
                        {fact.value}
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>

            <a
              aria-label="View my GitHub profile (opens in a new tab)"
              className="mt-1 flex items-center justify-between gap-3 rounded-control border border-outline-variant bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface transition hover:border-primary/30 hover:bg-primary-container/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              href="https://github.com/odinpikin"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="inline-flex items-center gap-2">
                <FiGithub className="size-4 text-primary" aria-hidden="true" />
                View my GitHub
              </span>
              <FiArrowUpRight
                className="size-4 text-on-surface-variant"
                aria-hidden="true"
              />
            </a>
          </aside>
        </section>
      </main>

      <LandingFooter />
    </>
  );
};

export default AboutPage;
