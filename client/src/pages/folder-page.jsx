import { motion } from "motion/react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiFolder,
} from "react-icons/fi";
import { Link, useParams, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import FileList from "@/features/drive/components/file-list.jsx";
import FolderBreadcrumbs from "@/features/drive/components/folder-breadcrumbs.jsx";
import FolderList from "@/features/drive/components/folder-list.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import { formatCount } from "@/features/drive/format.js";
import useFolder from "@/features/drive/hooks/use-folder.js";
import { readPageParam } from "@/features/drive/params.js";

const backLinkClass =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface";

const FolderPage = () => {
  const { folderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get("page"));
  const folderPage = readPageParam(searchParams.get("folderPage"));
  const folderQuery = useFolder({ folderId, page, folderPage });
  const folder = folderQuery.isError ? undefined : folderQuery.data?.folder;
  const breadcrumbs = folder ? folderQuery.data.breadcrumbs : [];

  const changePage = (key, value) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set(key, String(value));
        return next;
      },
      { replace: true },
    );
  };

  return (
    <motion.div
      className="mx-auto grid w-full max-w-6xl gap-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="grid gap-4">
        <Link to="/drive" className={backLinkClass}>
          <FiArrowLeft className="size-4" aria-hidden="true" />
          My drive
        </Link>

        {folder ? (
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-warning-container text-on-warning-container shadow-sm">
              <FiFolder className="size-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                Folder
              </p>
              <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] text-on-surface sm:text-3xl">
                {folder.name}
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {formatCount(folderQuery.data.filePagination.total, "file")} and{" "}
                {formatCount(
                  folderQuery.data.folderPagination.total,
                  "folder",
                )}{" "}
                in this folder.
              </p>
            </div>
          </div>
        ) : null}

        {folder ? <FolderBreadcrumbs breadcrumbs={breadcrumbs} /> : null}
      </div>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-1">
        <header className="border-b border-outline-variant px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            Contents
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
            {folder
              ? formatCount(
                  folderQuery.data.filePagination.total +
                    folderQuery.data.folderPagination.total,
                  "item",
                )
              : "Folder contents"}
          </h2>
        </header>

        <div
          className={`transition-opacity ${
            folderQuery.isFetching ? "opacity-60" : "opacity-100"
          }`}
        >
          {folderQuery.isPending ? <DriveLoading rows={6} /> : null}

          {folderQuery.isError && folderQuery.error?.status === 404 ? (
            <DriveState
              icon={<FiFolder className="size-5" />}
              title="Folder not found."
              description="It may have been moved or deleted."
              action={
                <Link
                  to="/drive"
                  className="inline-flex min-h-9 items-center justify-center rounded-control border border-outline-variant bg-surface px-3 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low"
                >
                  Back to my drive
                </Link>
              }
            />
          ) : null}

          {folderQuery.isError && folderQuery.error?.status !== 404 ? (
            <DriveState
              icon={<FiAlertTriangle className="size-5 text-error" />}
              title="Could not load this folder."
              description="Check your connection, then try again."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => folderQuery.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : null}

          {folder &&
          folderQuery.data.folders.length === 0 &&
          folderQuery.data.files.length === 0 ? (
            <DriveState
              icon={<FiFolder className="size-5" />}
              title="This folder is empty."
              description="Folders and files you add here will appear in this list."
            />
          ) : null}

          {folder &&
          (folderQuery.data.folders.length > 0 ||
            folderQuery.data.files.length > 0) ? (
            <div className="grid gap-6 p-4 sm:p-5">
              {folderQuery.data.folders.length > 0 ? (
                <section aria-labelledby="folder-list-title" className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      id="folder-list-title"
                      className="text-sm font-semibold text-on-surface"
                    >
                      Folders
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      {formatCount(
                        folderQuery.data.folderPagination.total,
                        "folder",
                      )}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-outline-variant">
                    <FolderList folders={folderQuery.data.folders} />
                    <PaginationControls
                      pagination={folderQuery.data.folderPagination}
                      label="Folder pages"
                      onChange={(nextPage) =>
                        changePage("folderPage", nextPage)
                      }
                    />
                  </div>
                </section>
              ) : null}

              {folderQuery.data.files.length > 0 ? (
                <section aria-labelledby="file-list-title" className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      id="file-list-title"
                      className="text-sm font-semibold text-on-surface"
                    >
                      Files
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      {formatCount(
                        folderQuery.data.filePagination.total,
                        "file",
                      )}
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-outline-variant">
                    <FileList files={folderQuery.data.files} />
                    <PaginationControls
                      pagination={folderQuery.data.filePagination}
                      label="File pages"
                      onChange={(nextPage) => changePage("page", nextPage)}
                    />
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

        </div>
      </section>
    </motion.div>
  );
};

export default FolderPage;
