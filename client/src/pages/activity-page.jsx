import { motion } from "motion/react";
import { useState } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import ConfirmDialog from "@/components/ui/confirm-dialog.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import ActivityFilters from "@/features/drive/components/activity-filters.jsx";
import ActivityList from "@/features/drive/components/activity-list.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import useClearActivity from "@/features/drive/hooks/use-clear-activity.js";
import useClearActivityItem from "@/features/drive/hooks/use-clear-activity-item.js";
import useDriveActivity from "@/features/drive/hooks/use-drive-activity.js";
import { readPageParam } from "@/features/drive/params.js";

const backLinkClass =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface";

const ActivityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get("page"));
  const query = (searchParams.get("q") ?? "").trim();
  const action = searchParams.get("action") ?? "";
  const targetType = searchParams.get("targetType") ?? "";
  const hasFilters = Boolean(query || action || targetType);
  const activity = useDriveActivity({ page, query, action, targetType });
  const clearItem = useClearActivityItem();
  const clearAllActivity = useClearActivity();
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearTarget, setClearTarget] = useState(null);
  const [clearAllError, setClearAllError] = useState("");
  const [clearItemError, setClearItemError] = useState("");
  const total = activity.data?.pagination.total ?? 0;

  const changePage = (nextPage) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set("page", String(nextPage));
        return next;
      },
      { replace: true },
    );
  };

  const applyFilters = ({
    query: nextQuery,
    action: nextAction,
    targetType: nextTarget,
  }) => {
    const next = new URLSearchParams();

    if (nextQuery) next.set("q", nextQuery);
    if (nextAction) next.set("action", nextAction);
    if (nextTarget) next.set("targetType", nextTarget);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const requestClearItem = (item) => {
    clearItem.reset();
    setClearItemError("");
    setClearTarget(item);
  };

  const confirmClearItem = async () => {
    setClearItemError("");

    try {
      await clearItem.mutateAsync(clearTarget.id);
      setClearTarget(null);
    } catch (error) {
      setClearItemError(error.message);
    }
  };

  const confirmClear = async () => {
    setClearAllError("");

    try {
      await clearAllActivity.mutateAsync();
      setConfirmClearAll(false);
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          next.delete("page");
          return next;
        },
        { replace: true },
      );
    } catch (error) {
      setClearAllError(error.message);
    }
  };

  return (
    <motion.div
      className="mx-auto grid w-full max-w-5xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="grid gap-4">
        <Link to="/drive" className={backLinkClass}>
          <FiArrowLeft className="size-4" aria-hidden="true" />
          My drive
        </Link>

        <header>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Activity
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
            Everything that changed
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            Uploads, folder changes, share links, and account updates, newest
            first.
          </p>
        </header>
      </div>

      <DrivePanel
        kicker="History"
        title="Activity history"
        description="History stays visible after a file or folder is deleted."
        action={
          total > 0 ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setClearAllError("");
                setConfirmClearAll(true);
              }}
            >
              <FiTrash2 className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          ) : null
        }
        isFetching={activity.isFetching}
      >
        <ActivityFilters
          initialQuery={query}
          action={action}
          targetType={targetType}
          onApply={applyFilters}
          onClear={clearFilters}
        />

        {activity.isPending ? <DriveLoading /> : null}

        {activity.isError ? (
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not load activity."
            description="Check your connection, then try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => activity.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : null}

        {activity.data ? (
          <>
            <ActivityList
              activity={activity.data.activity}
              onClear={requestClearItem}
              clearingId={clearItem.isPending ? clearItem.variables : null}
              emptyTitle={
                hasFilters ? "No matching activity." : "No activity yet."
              }
              emptyDescription={
                hasFilters
                  ? "Try a different search or filter."
                  : "Uploads, folders, shares, and account changes will show up here."
              }
            />
            <PaginationControls
              pagination={activity.data.pagination}
              label="Activity pages"
              onChange={changePage}
            />
          </>
        ) : null}
      </DrivePanel>

      <ConfirmDialog
        open={Boolean(clearTarget)}
        title="Clear this activity?"
        description={
          clearTarget
            ? `This removes the "${clearTarget.targetName}" history entry. Files and folders are not deleted.`
            : "This removes only this history entry. Files and folders are not deleted."
        }
        confirmLabel="Clear activity"
        isPending={clearItem.isPending}
        onConfirm={confirmClearItem}
        onClose={() => {
          if (clearItem.isPending) return;
          setClearTarget(null);
          setClearItemError("");
        }}
      >
        {clearItemError ? <FormAlert>{clearItemError}</FormAlert> : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmClearAll}
        title="Clear all activity?"
        description="This removes all activity history for your account. Files and folders are not deleted."
        confirmLabel="Clear all activity"
        acknowledgement="I understand this removes all activity history."
        isPending={clearAllActivity.isPending}
        onConfirm={confirmClear}
        onClose={() => {
          if (clearAllActivity.isPending) return;
          setConfirmClearAll(false);
          setClearAllError("");
        }}
      >
        {clearAllError ? <FormAlert>{clearAllError}</FormAlert> : null}
      </ConfirmDialog>
    </motion.div>
  );
};

export default ActivityPage;
