import { motion } from "motion/react";
import { FiArrowLeft, FiFileText, FiFolder, FiLink, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";

const visualCards = [
  {
    key: "folder",
    icon: FiFolder,
    name: "Projects",
    meta: "4 items",
    iconClassName: "bg-warning-container text-on-warning-container",
    position: "left-0 top-0 w-[calc(100%-1rem)] -rotate-2",
    delay: 0.1,
  },
  {
    key: "file",
    icon: FiFileText,
    name: "Team photo.jpg",
    meta: "1.8 MB",
    iconClassName: "bg-error-container text-on-error-container",
    position: "left-6 top-20 w-[calc(100%-1.5rem)] rotate-1",
    delay: 0.18,
  },
  {
    key: "share",
    icon: FiLink,
    name: "Share link",
    meta: "Expires in 7 days",
    iconClassName: "bg-primary-container text-primary",
    position: "left-1.5 top-40 w-[calc(100%-0.75rem)] -rotate-1",
    delay: 0.26,
  },
];

const AuthShell = ({ kicker, title, description, children, footer }) => (
  <main className="h-dvh overflow-hidden bg-surface-container-low lg:grid lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)]">
    <section className="relative hidden h-dvh min-h-0 overflow-hidden border-r border-primary/10 bg-[linear-gradient(155deg,var(--color-surface-container-low)_0%,var(--color-primary-container)_52%,var(--color-surface-container-high)_100%)] lg:flex">
      <div className="absolute -bottom-48 -right-40 size-[34rem] rounded-full border border-primary/10 bg-surface/20" />
      <div className="absolute -bottom-24 -right-16 size-80 rounded-full border border-primary/10 bg-surface/30" />

      <div className="relative z-10 flex h-full flex-1 flex-col p-8 xl:p-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-on-surface"
        >
          <BrandMark className="size-8" />
          Mini Drive
        </Link>

        <div className="my-auto max-w-xl py-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            A small personal drive
          </p>
          <h2 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-on-surface xl:text-5xl">
            Folders for your files. Links for the ones you share.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-on-surface-variant">
            Upload up to 10 files at once, preview the common ones, and share
            folder links that expire.
          </p>

          <div className="relative mt-10 h-60 max-w-md">
            {visualCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.key}
                  className={`absolute flex items-center gap-3 rounded-lg border border-primary/10 bg-surface/90 p-4 shadow-1 backdrop-blur ${card.position}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: card.delay,
                    ease: "easeOut",
                  }}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-control ${card.iconClassName}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <strong className="truncate text-sm font-medium text-on-surface">
                      {card.name}
                    </strong>
                    <span className="text-xs text-on-surface-variant">
                      {card.meta}
                    </span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <FiLock className="size-4" aria-hidden="true" />
          Only you can open your drive.
        </p>
      </div>
    </section>

    <section className="h-dvh min-h-0 overflow-y-auto overscroll-contain">
      <div className="flex min-h-full items-center justify-center px-6 py-8 lg:px-12">
        <div className="w-full max-w-[27rem]">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface lg:-ml-2"
          >
            <FiArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.09em] text-primary">
            {kicker}
          </p>
          <h1 className="text-[clamp(2rem,3.4vw,2.65rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-on-surface">
            {title}
          </h1>
          <p className="mb-8 mt-3 text-base leading-7 text-on-surface-variant">
            {description}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          >
            {children}
          </motion.div>

          {footer ? (
            <p className="mt-6 text-center text-sm text-on-surface-variant">
              {footer}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  </main>
);

export default AuthShell;
