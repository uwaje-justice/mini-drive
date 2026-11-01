import { motion } from "motion/react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiDownload,
  FiEyeOff,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";

import { fileDownloadUrl, filePreviewUrl } from "@/api/files.js";
import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import getFileMeta from "@/features/drive/file-meta.js";
import { formatDate, formatFileSize } from "@/features/drive/format.js";
import useFile from "@/features/drive/hooks/use-file.js";

const backLinkClass =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface";

const downloadLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-transparent bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const metadataClass = "grid gap-1 border-t border-outline-variant py-3";
const labelClass = "text-xs font-medium text-on-surface-variant";
const valueClass = "text-sm font-medium text-on-surface";

const FilePreview = ({ file }) => {
  if (file.previewKind === "image") {
    return (
      <div className="grid place-items-center bg-surface-container-low p-4">
        <img
          src={filePreviewUrl(file.id)}
          alt={file.name}
          className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
        />
      </div>
    );
  }

  if (file.previewKind === "pdf" || file.previewKind === "text") {
    return (
      <iframe
        src={filePreviewUrl(file.id)}
        title={`Preview of ${file.name}`}
        className="h-[32rem] w-full bg-surface-container-low"
      />
    );
  }

  return (
    <DriveState
      icon={<FiEyeOff className="size-5" />}
      title="No preview for this file."
      description="Download the file to open it."
      action={
        <a href={fileDownloadUrl(file.id)} className={downloadLinkClass} download>
          <FiDownload className="size-4" aria-hidden="true" />
          Download file
        </a>
      }
    />
  );
};

const FilePage = () => {
  const { fileId } = useParams();
  const fileQuery = useFile(fileId);
  const file = fileQuery.isError ? undefined : fileQuery.data?.file;
  const meta = getFileMeta(file?.previewKind);
  const Icon = meta.icon;
  const backTo = file?.folder
    ? `/drive/folders/${file.folder.id}`
    : "/drive/files";
  const backLabel = file?.folder ? file.folder.name : "Files";

  return (
    <motion.div
      className="mx-auto grid w-full max-w-6xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="grid gap-4">
        <Link to={backTo} className={backLinkClass}>
          <FiArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </Link>

        {file ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-xl ${meta.tone} shadow-sm`}
              >
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  File details
                </p>
                <h1 className="truncate text-2xl font-semibold tracking-[-0.04em] text-on-surface sm:text-3xl">
                  {file.name}
                </h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {formatFileSize(file.size)} · Uploaded{" "}
                  {formatDate(file.createdAt)}
                </p>
              </div>
            </div>
            <a
              href={fileDownloadUrl(file.id)}
              className={downloadLinkClass}
              download
            >
              <FiDownload className="size-4" aria-hidden="true" />
              Download
            </a>
          </div>
        ) : null}
      </div>

      {fileQuery.isPending ? (
        <DrivePanel kicker="File details" title="Loading file">
          <DriveLoading rows={2} />
        </DrivePanel>
      ) : null}

      {fileQuery.isError && fileQuery.error?.status === 404 ? (
        <DrivePanel kicker="File details" title="File not found">
          <DriveState
            icon={<Icon className="size-5" />}
            title="This file is not here."
            description="It may have been moved or deleted."
            action={
              <Link
                to="/drive/files"
                className="inline-flex min-h-9 items-center justify-center rounded-control border border-outline-variant bg-surface px-3 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low"
              >
                Back to files
              </Link>
            }
          />
        </DrivePanel>
      ) : null}

      {fileQuery.isError && fileQuery.error?.status !== 404 ? (
        <DrivePanel kicker="File details" title="Could not load file">
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not load this file."
            description="Check your connection, then try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        </DrivePanel>
      ) : null}

      {file ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <DrivePanel kicker="Preview" title={file.name}>
            <FilePreview file={file} />
          </DrivePanel>

          <DrivePanel
            kicker="Details"
            title="File information"
            description="Where this file lives and when it arrived."
          >
            <dl className="grid gap-0 px-4 pb-2 sm:px-5">
              <div className={metadataClass}>
                <dt className={labelClass}>File type</dt>
                <dd className={`${valueClass} break-all`}>{file.mimeType}</dd>
              </div>
              <div className={metadataClass}>
                <dt className={labelClass}>Size</dt>
                <dd className={valueClass}>{formatFileSize(file.size)}</dd>
              </div>
              <div className={metadataClass}>
                <dt className={labelClass}>Uploaded</dt>
                <dd className={valueClass}>{formatDate(file.createdAt)}</dd>
              </div>
              <div className={metadataClass}>
                <dt className={labelClass}>Folder</dt>
                <dd className={valueClass}>
                  {file.folder ? (
                    <Link
                      to={`/drive/folders/${file.folder.id}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {file.folder.name}
                    </Link>
                  ) : (
                    "My drive"
                  )}
                </dd>
              </div>
            </dl>
          </DrivePanel>
        </div>
      ) : null}
    </motion.div>
  );
};

export default FilePage;
