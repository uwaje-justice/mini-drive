import { FiChevronRight, FiFolder } from "react-icons/fi";
import { Link } from "react-router-dom";

import { formatDate } from "@/features/drive/format.js";

const FolderList = ({ folders }) => (
  <ul className="divide-y divide-outline-variant">
    {folders.map((folder) => (
      <li key={folder.id}>
        <Link
          to={`/drive/folders/${folder.id}`}
          className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 sm:px-5"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-control bg-warning-container text-on-warning-container">
            <FiFolder className="size-5" aria-hidden="true" />
          </span>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <strong className="truncate text-sm font-semibold text-on-surface">
              {folder.name}
            </strong>
            <span className="text-xs text-on-surface-variant">
              Folder · Created {formatDate(folder.createdAt)}
            </span>
          </span>
          <FiChevronRight
            className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </Link>
      </li>
    ))}
  </ul>
);

export default FolderList;
