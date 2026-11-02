import { FiChevronRight, FiFolder } from "react-icons/fi";
import { Link } from "react-router-dom";

import getFileMeta from "@/features/drive/file-meta.js";
import { formatDate, formatFileSize } from "@/features/drive/format.js";

const SearchResultList = ({ results }) => (
  <ul className="divide-y divide-outline-variant">
    {results.map((result) => {
      const isFolder = result.type === "folder";
      const meta = isFolder ? null : getFileMeta(result.previewKind);
      const Icon = isFolder ? FiFolder : meta.icon;
      const iconTone = isFolder
        ? "bg-warning-container text-on-warning-container"
        : meta.tone;
      const target = isFolder
        ? `/drive/folders/${result.id}`
        : `/drive/files/${result.id}`;

      return (
        <li key={`${result.type}-${result.id}`}>
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
                {result.name}
              </strong>
              <span className="truncate text-xs text-on-surface-variant">
                {isFolder
                  ? `Folder in ${result.path}`
                  : `${formatFileSize(result.size)} · ${result.path} · ${formatDate(result.createdAt)}`}
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

export default SearchResultList;
