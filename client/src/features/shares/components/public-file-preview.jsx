import { FiDownload } from "react-icons/fi";

import {
  publicFileDownloadUrl,
  publicFilePreviewUrl,
} from "@/api/shares.js";
import Button from "@/components/ui/button.jsx";
import Modal from "@/components/ui/modal.jsx";
import FilePreview from "@/features/drive/components/file-preview.jsx";
import { formatFileSize } from "@/features/drive/format.js";

const PublicFilePreview = ({ token, file, onClose }) => {
  const downloadUrl = file ? publicFileDownloadUrl(token, file.id) : "";

  return (
    <Modal
      open={Boolean(file)}
      onClose={onClose}
      title={file?.name ?? "File preview"}
      description={file ? formatFileSize(file.size) : undefined}
      size="xl"
    >
      {file ? (
        <div className="grid min-w-0 gap-4">
          <FilePreview
            file={file}
            previewUrl={publicFilePreviewUrl(token, file.id)}
            downloadUrl={downloadUrl}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <a
              href={downloadUrl}
              download
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-transparent bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            >
              <FiDownload className="size-4" aria-hidden="true" />
              Download
            </a>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default PublicFilePreview;
