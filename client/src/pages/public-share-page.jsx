import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiFolder,
  FiLink,
} from "react-icons/fi";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import BrandMark from "@/components/brand-mark.jsx";
import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import FileList from "@/features/drive/components/file-list.jsx";
import FolderBreadcrumbs from "@/features/drive/components/folder-breadcrumbs.jsx";
import FolderList from "@/features/drive/components/folder-list.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import { formatCount, formatDate } from "@/features/drive/format.js";
import { readPageParam } from "@/features/drive/params.js";
import PublicFilePreview from "@/features/shares/components/public-file-preview.jsx";
import usePublicShare from "@/features/shares/hooks/use-public-share.js";

const PublicSharePage = () => {
  const { token, folderId = null } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get("page"));
  const folderPage = readPageParam(searchParams.get("folderPage"));
  const shareQuery = usePublicShare({ token, folderId, page, folderPage });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setSelectedFile(null);
  }, [token, folderId]);

  const data = shareQuery.isError ? undefined : shareQuery.data;
  const folder = data?.folder;
  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const breadcrumbs = data?.breadcrumbs ?? [];
  const shareBasePath = `/share/${encodeURIComponent(token)}`;
  const itemCount = data
    ? data.folderPagination.total + data.filePagination.total
    : undefined;

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
    <div className="min-h-dvh bg-surface-container-low">
      <title>
        {folder ? `${folder.name} · Mini Drive` : "Shared folder · Mini Drive"}
      </title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <header className="border-b border-outline-variant bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-base font-semibold tracking-tight text-on-surface"
          >
            <BrandMark className="size-9" />
            Mini Drive
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-primary">
            <FiLink className="size-3.5" aria-hidden="true" />
            Shared folder
          </span>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-5 py-8 sm:py-10">
        <motion.div
          className="grid min-w-0 grid-cols-1 gap-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {folder ? (
            <div className="grid min-w-0 grid-cols-1 gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-warning-container text-on-warning-container shadow-sm">
                  <FiFolder className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                    Shared folder
                  </p>
                  <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] text-on-surface sm:text-3xl">
                    {folder.name}
                  </h1>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    This link expires on {formatDate(data.share.expiresAt)}.
                    Anyone with the link can view, preview, and download these
                    files.
                  </p>
                </div>
              </div>
              <FolderBreadcrumbs
                breadcrumbs={breadcrumbs}
                basePath={shareBasePath}
              />
            </div>
          ) : null}

          <DrivePanel
            kicker="Contents"
            title={
              itemCount !== undefined
                ? formatCount(itemCount, "item")
                : "Shared folder"
            }
            description="Files and folders inside this shared link."
            isFetching={shareQuery.isFetching}
          >
            {shareQuery.isPending ? <DriveLoading rows={6} /> : null}

            {shareQuery.isError && shareQuery.error?.status === 404 ? (
              <DriveState
                icon={<FiAlertTriangle className="size-5 text-error" />}
                title="This link is not available."
                description="It may have expired or been revoked."
                action={
                  <Link
                    to="/"
                    className="inline-flex min-h-9 items-center justify-center rounded-control border border-outline-variant bg-surface px-3 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low"
                  >
                    Go to Mini Drive
                  </Link>
                }
              />
            ) : null}

            {shareQuery.isError && shareQuery.error?.status !== 404 ? (
              <DriveState
                icon={<FiAlertTriangle className="size-5 text-error" />}
                title="Could not load this shared folder."
                description="Check your connection, then try again."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => shareQuery.refetch()}
                  >
                    Try again
                  </Button>
                }
              />
            ) : null}

            {data && itemCount === 0 ? (
              <DriveState
                icon={<FiFolder className="size-5" />}
                title="This folder is empty."
                description="This shared folder has no files or folders."
              />
            ) : null}

            {folders.length > 0 ? (
              <section>
                <h2 className="border-b border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant sm:px-5">
                  Folders
                </h2>
                <FolderList
                  folders={folders}
                  hrefForFolder={(id) =>
                    `${shareBasePath}/folders/${encodeURIComponent(id)}`
                  }
                />
                <PaginationControls
                  pagination={data.folderPagination}
                  label="Shared folder pages"
                  onChange={(value) => changePage("folderPage", value)}
                />
              </section>
            ) : null}

            {files.length > 0 ? (
              <section>
                <h2 className="border-b border-outline-variant bg-surface-container-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant sm:px-5">
                  Files
                </h2>
                <FileList files={files} onFileSelect={setSelectedFile} />
                <PaginationControls
                  pagination={data.filePagination}
                  label="Shared file pages"
                  onChange={(value) => changePage("page", value)}
                />
              </section>
            ) : null}
          </DrivePanel>
        </motion.div>
      </main>

      <PublicFilePreview
        token={token}
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
      />
    </div>
  );
};

export default PublicSharePage;
