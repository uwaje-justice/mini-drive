import {
  FiChevronRight,
  FiClock,
  FiFile,
  FiFolder,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import DriveState from "@/features/drive/components/drive-state.jsx";
import { formatDate } from "@/features/drive/format.js";

const activityCopy = {
  file: "File uploaded",
  folder: "Folder created",
};

const ActivityList = ({ activity }) => {
  if (activity.length === 0) {
    return (
      <DriveState
        icon={<FiClock className="size-5" />}
        title="No activity yet."
        description="Files you upload and folders you create will show up here."
      />
    );
  }

  return (
    <ul className="divide-y divide-outline-variant">
      {activity.map((item) => {
        const isFolder = item.type === "folder";
        const Icon = isFolder ? FiFolder : FiFile;
        const iconTone = isFolder
          ? "bg-warning-container text-on-warning-container"
          : "bg-primary-container text-primary";
        const location = item.folder ?? item.parent;
        const target = isFolder
          ? `/drive/folders/${item.id}`
          : `/drive/files/${item.id}`;

        return (
          <li key={`${item.type}-${item.id}`}>
            <Link
              to={target}
              className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 sm:px-5"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-control ${iconTone}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                <strong className="truncate text-sm font-semibold text-on-surface">
                  {item.name}
                </strong>
                <span className="truncate text-xs text-on-surface-variant">
                  {activityCopy[item.type]} · {formatDate(item.createdAt)} ·{" "}
                  {location ? `in ${location.name}` : "in My drive"}
                </span>
              </span>
              <FiChevronRight
                className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ActivityList;
