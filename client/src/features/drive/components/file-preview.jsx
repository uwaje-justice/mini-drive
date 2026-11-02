import { lazy, Suspense } from "react";
import { FiDownload, FiEyeOff } from "react-icons/fi";

import Spinner from "@/components/ui/spinner.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";

const PdfPreview = lazy(
  () => import("@/features/drive/components/pdf-preview.jsx"),
);

const downloadLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-transparent bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15";

const FilePreview = ({ file, previewUrl, downloadUrl }) => {
  if (file.previewKind === "image") {
    return (
      <div className="relative h-[min(70vh,40rem)] w-full max-w-full overflow-hidden bg-surface-container-low">
        <img
          src={previewUrl}
          alt={file.name}
          className="absolute inset-0 size-full object-scale-down"
        />
      </div>
    );
  }

  if (file.previewKind === "pdf") {
    return (
      <Suspense
        fallback={
          <DriveState
            icon={<Spinner className="size-5" />}
            title="Loading PDF."
            description="Preparing the in-app viewer."
          />
        }
      >
        <PdfPreview file={file} previewUrl={previewUrl} />
      </Suspense>
    );
  }

  if (file.previewKind === "text") {
    return (
      <iframe
        src={previewUrl}
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
        <a href={downloadUrl} className={downloadLinkClass} download>
          <FiDownload className="size-4" aria-hidden="true" />
          Download file
        </a>
      }
    />
  );
};

export default FilePreview;
