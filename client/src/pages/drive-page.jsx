import { motion } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";
import ActivityList from "@/features/drive/components/activity-list.jsx";
import CategoryGrid from "@/features/drive/components/category-grid.jsx";
import DriveHero from "@/features/drive/components/drive-hero.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import useDriveOverview from "@/features/drive/hooks/use-drive-overview.js";

const OverviewLoading = () => (
  <div role="status" aria-live="polite" className="grid gap-5">
    <span className="sr-only">Loading your drive overview</span>
    <div className="h-72 animate-pulse rounded-2xl bg-surface-container" />
    <div className="h-40 animate-pulse rounded-xl bg-surface-container" />
    <div className="h-64 animate-pulse rounded-xl bg-surface-container" />
  </div>
);

const OverviewError = ({ query }) => (
  <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-error/20 bg-error-container px-5 py-4 text-on-error-container">
    <div className="flex items-start gap-3">
      <FiAlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <h2 className="text-base font-semibold">Could not load your drive.</h2>
        <p className="mt-0.5 text-sm leading-6">
          Check your connection, then try again.
        </p>
      </div>
    </div>
    <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
      Try again
    </Button>
  </div>
);

const DrivePage = () => {
  const session = useSession();
  const overview = useDriveOverview();
  const email = session.data?.user?.email ?? "";
  const name = email.split("@")[0] || "there";
  const summary = overview.data?.summary;
  const categories = overview.data?.categories ?? [];

  return (
    <motion.div
      className="mx-auto grid w-full max-w-6xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          My drive
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
          Your files and folders, all in one place.
        </p>
      </header>

      {overview.isPending ? <OverviewLoading /> : null}
      {overview.isError ? <OverviewError query={overview} /> : null}

      {summary ? (
        <>
          <DriveHero
            fileCount={summary.fileCount}
            folderCount={summary.folderCount}
            categoryCount={categories.length}
          />
          <CategoryGrid categories={categories} />
          <DrivePanel
            kicker="Activity"
            title="Recent activity"
            description="Uploads and folder creations, newest first."
          >
            <ActivityList activity={overview.data.activity} />
          </DrivePanel>
        </>
      ) : null}
    </motion.div>
  );
};

export default DrivePage;
