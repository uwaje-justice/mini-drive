import { motion } from "motion/react";
import { useState } from "react";
import { FiAlertTriangle, FiFolder, FiFolderPlus } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import FolderList from "@/features/drive/components/folder-list.jsx";
import NewFolderDialog from "@/features/drive/components/new-folder-dialog.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import { formatCount } from "@/features/drive/format.js";
import useDriveRoot from "@/features/drive/hooks/use-drive-root.js";
import { readPageParam } from "@/features/drive/params.js";

const FoldersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const folderPage = readPageParam(searchParams.get("folderPage"));
  const root = useDriveRoot({ folderPage });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const total = root.data?.folderPagination.total;

  const changePage = (nextPage) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set("folderPage", String(nextPage));
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
            Folders
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            These are the folders at the top level. Open one to see its files and
            folders.
          </p>
        </div>
        <Button onClick={() => setIsCreatingFolder(true)}>
          <FiFolderPlus className="size-4" aria-hidden="true" />
          New folder
        </Button>
      </header>

      <DrivePanel
        kicker="Top-level folders"
        title={
          total === undefined ? "Folders" : formatCount(total, "folder")
        }
        description="Folders that are not inside another folder."
        isFetching={root.isFetching}
      >
        {root.isPending ? <DriveLoading /> : null}
        {root.isError ? (
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not load your folders."
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
        {root.data?.folders.length === 0 ? (
          <DriveState
            icon={<FiFolder className="size-5" />}
            title="No folders at the top level."
            description="Folders you add here will appear in this list."
          />
        ) : null}
        {root.data?.folders.length > 0 ? (
          <>
            <FolderList folders={root.data.folders} />
            <PaginationControls
              pagination={root.data.folderPagination}
              label="Folder pages"
              onChange={changePage}
            />
          </>
        ) : null}
      </DrivePanel>

      <NewFolderDialog
        open={isCreatingFolder}
        onClose={() => setIsCreatingFolder(false)}
      />
    </motion.div>
  );
};

export default FoldersPage;
