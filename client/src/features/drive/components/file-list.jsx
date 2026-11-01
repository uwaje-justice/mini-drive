import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import getFileMeta from "@/features/drive/file-meta.js";
import { formatDate, formatFileSize } from "@/features/drive/format.js";

const FileList = ({ files }) => (
  <ul className="divide-y divide-outline-variant">
    {files.map((file) => {
      const meta = getFileMeta(file.previewKind);
      const Icon = meta.icon;
      const location = file.folder ? `in ${file.folder.name}` : "My drive";

      return (
        <li key={file.id}>
          <Link
            to={`/drive/files/${file.id}`}
            className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/15 sm:px-5"
          >
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

export default FileList;
