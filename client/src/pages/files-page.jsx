import { motion } from "motion/react";
import { useState } from "react";
import { FiAlertTriangle, FiFile, FiUploadCloud } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import FileList from "@/features/drive/components/file-list.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import UploadDialog from "@/features/drive/components/upload-dialog.jsx";
import { formatCount } from "@/features/drive/format.js";
import useDriveRoot from "@/features/drive/hooks/use-drive-root.js";
import { readPageParam } from "@/features/drive/params.js";

const FilesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get("page"));
  const root = useDriveRoot({ page });
  const [isUploading, setIsUploading] = useState(false);
  const total = root.data?.filePagination.total;

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
            Files
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            These are the files at the top level. Open a folder to see what is
            inside.
          </p>
        </div>
        <Button onClick={() => setIsUploading(true)}>
          <FiUploadCloud className="size-4" aria-hidden="true" />
          Upload
        </Button>
      </header>

      <DrivePanel
        kicker="Top-level files"
        title={total === undefined ? "Files" : formatCount(total, "file")}
        description="Files that are not inside a folder."
        isFetching={root.isFetching}
      >
        {root.isPending ? <DriveLoading /> : null}
        {root.isError ? (
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not load your files."
            description="Check your connection, then try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => root.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : null}
        {root.data?.files.length === 0 ? (
          <DriveState
            icon={<FiFile className="size-5" />}
            title="No files at the top level."
            description="Files inside folders appear in their folder, smart categories, and recent activity."
          />
        ) : null}
        {root.data?.files.length > 0 ? (
          <>
            <FileList files={root.data.files} />
            <PaginationControls
              pagination={root.data.filePagination}
              label="File pages"
              onChange={changePage}
            />
          </>
        ) : null}
      </DrivePanel>

      <UploadDialog
        open={isUploading}
        onClose={() => setIsUploading(false)}
      />
    </motion.div>
  );
};

export default FilesPage;
