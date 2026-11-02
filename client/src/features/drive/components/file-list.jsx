import { FiChevronRight, FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";

import getFileMeta from "@/features/drive/file-meta.js";
import { formatDate, formatFileSize } from "@/features/drive/format.js";

const rowClass =
  "group flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 sm:px-5";

const FileList = ({
  files,
  onFileSelect = null,
  hrefForFile = (fileId) => `/drive/files/${fileId}`,
}) => (
  <ul className="divide-y divide-outline-variant">
    {files.map((file) => {
      const meta = getFileMeta(file.previewKind);
      const Icon = meta.icon;
      const location = file.folder ? `in ${file.folder.name}` : "My drive";
      const content = (
        <>
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-control ${meta.tone}`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <strong className="truncate text-sm font-semibold text-on-surface">
              {file.name}
            </strong>
            <span className="truncate text-xs text-on-surface-variant">
              {formatFileSize(file.size)} · {formatDate(file.createdAt)} ·{" "}
              {location}
            </span>
          </span>
          {onFileSelect ? (
            <FiEye
              className="size-4 shrink-0 text-on-surface-variant transition group-hover:text-primary"
              aria-hidden="true"
            />
          ) : (
            <FiChevronRight
              className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          )}
        </>
      );

      return (
        <li key={file.id}>
          {onFileSelect ? (
            <button
              type="button"
              onClick={() => onFileSelect(file)}
              className={rowClass}
            >
              {content}
            </button>
          ) : (
            <Link to={hrefForFile(file.id)} className={rowClass}>
              {content}
            </Link>
          )}
        </li>
      );
    })}
  </ul>
);

export default FileList;
