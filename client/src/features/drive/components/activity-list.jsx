import {
  FiChevronRight,
  FiClock,
  FiFile,
  FiFolder,
  FiLink,
  FiLock,
  FiMail,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import Spinner from "@/components/ui/spinner.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import { formatDate } from "@/features/drive/format.js";

const locationLabel = (name) => name ?? "My drive";

const describeActivity = (item) => {
  switch (item.action) {
    case "uploaded":
      return `Uploaded to ${locationLabel(item.locationName)}`;
    case "created":
      return `Created in ${locationLabel(item.locationName)}`;
    case "renamed":
      return `Renamed from ${item.previousName ?? "an earlier name"}`;
    case "moved":
      return `Moved from ${locationLabel(item.fromLocationName)} to ${locationLabel(item.toLocationName)}`;
    case "deleted":
      return `Deleted from ${locationLabel(item.locationName)}`;
    case "shared":
      return "Share link created";
    case "unshared":
      return "Share link revoked";
    case "email_changed":
      return `Email changed from ${item.previousEmail ?? "an earlier address"} to ${item.nextEmail ?? "the current address"}`;
    case "password_changed":
      return "Password changed";
    default:
      return "Activity recorded";
  }
};

const iconFor = (item) => {
  if (item.action === "deleted") return FiTrash2;
  if (item.action === "shared" || item.action === "unshared") return FiLink;
  if (item.action === "email_changed") return FiMail;
  if (item.action === "password_changed") return FiLock;

  return item.targetType === "folder" ? FiFolder : FiFile;
};

const toneFor = (item) => {
  if (item.action === "deleted") {
    return "bg-error-container text-on-error-container";
  }
  if (item.action === "shared" || item.action === "unshared") {
    return "bg-success-container text-on-success-container";
  }
  if (item.targetType === "account") {
    return "bg-secondary-container text-on-secondary-container";
  }
  if (item.targetType === "folder") {
    return "bg-warning-container text-on-warning-container";
  }

  return "bg-primary-container text-primary";
};

const targetPath = (item) => {
  if (!item.available || !item.targetId) return null;
  if (item.targetType === "file") return `/drive/files/${item.targetId}`;
  if (item.targetType === "folder") return `/drive/folders/${item.targetId}`;

  return null;
};

const rowClass = "group flex items-center gap-3 px-4 py-3.5 sm:px-5";

const clearButtonClass =
  "m-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

const ActivityList = ({
  activity,
  onClear,
  clearingId = null,
  emptyTitle = "No activity yet.",
  emptyDescription = "Uploads, folders, shares, and account changes will show up here.",
}) => {
  if (activity.length === 0) {
    return (
      <DriveState
        icon={<FiClock className="size-5" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="divide-y divide-outline-variant">
      {activity.map((item) => {
        const Icon = iconFor(item);
        const path = targetPath(item);
        const content = (
          <>
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-control ${toneFor(item)}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="grid min-w-0 flex-1 gap-0.5">
              <strong className="truncate text-sm font-semibold text-on-surface">
                {item.targetName}
              </strong>
              <span className="truncate text-xs text-on-surface-variant">
                {describeActivity(item)} · {formatDate(item.createdAt)}
              </span>
            </span>
            {path ? (
              <FiChevronRight
                className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            ) : null}
          </>
        );

        return (
          <li key={item.id} className="flex min-w-0 items-center">
            {path ? (
              <Link
                to={path}
                className={`${rowClass} min-w-0 flex-1 transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15`}
              >
                {content}
              </Link>
            ) : (
              <div className={`${rowClass} min-w-0 flex-1`}>{content}</div>
            )}

            {onClear ? (
              <button
                type="button"
                className={clearButtonClass}
                onClick={() => onClear(item.id)}
                disabled={clearingId !== null}
                aria-label={`Clear activity for ${item.targetName}`}
                title="Clear activity"
              >
                {clearingId === item.id ? (
                  <Spinner className="size-4" />
                ) : (
                  <FiX className="size-4" aria-hidden="true" />
                )}
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

export default ActivityList;
