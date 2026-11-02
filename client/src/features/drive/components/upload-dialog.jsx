import { useEffect, useId, useState } from "react";
import { FiFile, FiUploadCloud, FiX } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";
import FormAlert from "@/components/ui/form-alert.jsx";
import FormSuccess from "@/components/ui/form-success.jsx";
import Modal from "@/components/ui/modal.jsx";
import { formatCount, formatFileSize } from "@/features/drive/format.js";
import useUploadFiles from "@/features/drive/hooks/use-upload-files.js";

const maxFiles = 10;
const maxFileSize = 5 * 1024 * 1024;
const acceptedTypes =
  ".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain";

const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

const UploadDialog = ({ open, folderId = null, folderName, onClose }) => {
  const inputId = useId();
  const uploadFiles = useUploadFiles();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) return;

    setFiles([]);
    setIsDragging(false);
    setError("");
    setResult(null);
    setProgress(0);
  }, [open]);

  const addFiles = (incoming) => {
    const validFiles = incoming.filter(
      (file) => file.size > 0 && file.size <= maxFileSize,
    );
    const existing = new Set(files.map(fileKey));
    const added = validFiles.filter((file) => !existing.has(fileKey(file)));
    const nextFiles = [...files, ...added];
    const skippedForSize = incoming.length - validFiles.length;
    const duplicateCount = validFiles.length - added.length;

    setError("");
    setResult(null);

    if (skippedForSize > 0) {
      setError(
        `Skipped ${formatCount(skippedForSize, "file")}. Each file must be 5 MB or smaller and cannot be empty.`,
      );
    } else if (duplicateCount > 0) {
      setError("Those files are already selected.");
    }

    if (nextFiles.length > maxFiles) {
      setFiles(nextFiles.slice(0, maxFiles));
      setError("Choose up to 10 files.");
      return;
    }

    setFiles(nextFiles);
  };

  const handleInput = (event) => {
    addFiles([...event.target.files]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles([...event.dataTransfer.files]);
  };

  const handleUpload = async () => {
    setError("");
    setProgress(0);

    try {
      const nextResult = await uploadFiles.mutateAsync({
        files,
        folderId,
        onProgress: (value) => setProgress(Math.round(value * 100)),
      });

      setResult(nextResult);
      setFiles([]);
      setProgress(0);
    } catch (uploadError) {
      setError(uploadError.message);
      setProgress(0);
    }
  };

  const closeDialog = () => {
    if (!uploadFiles.isPending) onClose();
  };

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  const showResult = Boolean(result);
  const hasUploads = (result?.uploaded.length ?? 0) > 0;

  return (
    <Modal
      open={open}
      onClose={closeDialog}
      title="Upload files"
      description={`Files go to ${folderName ?? "My drive"}.`}
      size="lg"
    >
      <div className="grid gap-4">
        {error ? <FormAlert>{error}</FormAlert> : null}

        {showResult ? (
          <>
            {hasUploads ? (
              <FormSuccess>
                Uploaded {result.uploaded.length}{" "}
                {result.uploaded.length === 1 ? "file" : "files"}.
              </FormSuccess>
            ) : (
              <FormAlert>No files were uploaded.</FormAlert>
            )}

            {result.skipped.length > 0 ? (
              <div
                role="status"
                className="rounded-control border border-warning/30 bg-warning-container px-4 py-3 text-sm leading-6 text-on-warning-container"
              >
                <p className="font-semibold">Skipped files</p>
                <ul className="mt-2 list-disc pl-5">
                  {result.skipped.map((item, index) => (
                    <li key={`${item.message}-${index}`}>{item.message}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        ) : uploadFiles.isPending ? (
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Upload progress"
            className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-5 py-8 text-center"
          >
            <p className="text-sm font-semibold text-on-surface">
              {progress >= 100 ? "Saving files" : "Uploading files"}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              {progress >= 100 ? "Finishing up..." : `${progress}%`}
            </p>
          </div>
        ) : (
          <>
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsDragging(false);
                }
              }}
              onDrop={handleDrop}
              className={`grid place-items-center gap-3 rounded-xl border-2 border-dashed px-5 py-8 text-center transition ${
                isDragging
                  ? "border-primary bg-primary-container/50"
                  : "border-outline-variant bg-surface-container-low"
              }`}
            >
              <span className="grid size-12 place-items-center rounded-full bg-surface text-primary shadow-sm">
                <FiUploadCloud className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Drop files here
                </p>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  PNG, JPEG, WebP, GIF, PDF, or plain text. Up to 10 files,
                  5 MB each.
                </p>
              </div>
              <input
                id={inputId}
                type="file"
                multiple
                accept={acceptedTypes}
                onChange={handleInput}
                className="sr-only"
              />
              <label
                htmlFor={inputId}
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-control border border-outline-variant bg-surface px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low focus-within:ring-4 focus-within:ring-primary/15"
              >
                Choose files
              </label>
            </div>

            {files.length > 0 ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3 text-xs text-on-surface-variant">
                  <span>
                    {files.length} of {maxFiles} selected
                  </span>
                  <span>{formatFileSize(totalSize)}</span>
                </div>
                <ul className="grid max-h-56 gap-2 overflow-y-auto pr-1">
                  {files.map((file) => (
                    <li
                      key={fileKey(file)}
                      className="flex items-center gap-3 rounded-control border border-outline-variant bg-surface-container-low px-3 py-2"
                    >
                      <FiFile
                        className="size-4 shrink-0 text-on-surface-variant"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-on-surface">
                          {file.name}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          {formatFileSize(file.size)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter(
                              (item) => fileKey(item) !== fileKey(file),
                            ),
                          )
                        }
                        className="grid size-8 shrink-0 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        aria-label={`Remove ${file.name}`}
                      >
                        <FiX className="size-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                onClick={closeDialog}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                isLoading={uploadFiles.isPending}
                disabled={files.length === 0}
              >
                {files.length > 0
                  ? `Upload ${formatCount(files.length, "file")}`
                  : "Upload"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UploadDialog;
