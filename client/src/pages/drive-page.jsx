import { motion } from "motion/react";
import { useState } from "react";
import { FiAlertTriangle, FiFolderPlus, FiUploadCloud } from "react-icons/fi";
import { Link } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";
import ActivityList from "@/features/drive/components/activity-list.jsx";
import CategoryGrid from "@/features/drive/components/category-grid.jsx";
import DriveHero from "@/features/drive/components/drive-hero.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import NewFolderDialog from "@/features/drive/components/new-folder-dialog.jsx";
import UploadDialog from "@/features/drive/components/upload-dialog.jsx";
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
  const [dialog, setDialog] = useState(null);
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
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            My drive
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
            Welcome back, {name}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            Your files and folders, all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setDialog("folder")}>
            <FiFolderPlus className="size-4" aria-hidden="true" />
            New folder
          </Button>
          <Button onClick={() => setDialog("upload")}>
            <FiUploadCloud className="size-4" aria-hidden="true" />
            Upload
          </Button>
        </div>
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
            description="The latest changes across your drive and account."
            action={
              <Link
                to="/drive/activity"
                className="inline-flex min-h-9 items-center rounded-control border border-outline-variant bg-surface px-3 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low"
              >
                View all activity
              </Link>
            }
          >
            <ActivityList activity={overview.data.activity} />
          </DrivePanel>
        </>
      ) : null}

      <NewFolderDialog
        open={dialog === "folder"}
        onClose={() => setDialog(null)}
      />
      <UploadDialog
        open={dialog === "upload"}
        onClose={() => setDialog(null)}
      />
    </motion.div>
  );
};

export default DrivePage;
