import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { FiAlertTriangle, FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Button from "@/components/ui/button.jsx";
import Spinner from "@/components/ui/spinner.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";

const PdfPreview = ({ file, previewUrl }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;

    const load = async () => {
      setStatus("loading");
      setPdfDocument(null);
      setPageNumber(1);
      setTotalPages(0);

      try {
        const pdfjs = await import("pdfjs-dist/build/pdf.mjs");

        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        loadingTask = pdfjs.getDocument({ url: previewUrl });
        const document = await loadingTask.promise;

        if (cancelled) {
          await document.destroy();
          return;
        }

        setPdfDocument(document);
        setTotalPages(document.numPages);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [previewUrl]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return undefined;

    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [status]);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || width <= 0) return undefined;

    let cancelled = false;
    let renderTask = null;

    const render = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);

        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = width / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform:
            pixelRatio === 1
              ? undefined
              : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        });

        await renderTask.promise;

        if (!cancelled) page.cleanup();
      } catch (error) {
        if (!cancelled && error.name !== "RenderingCancelledException") {
          setStatus("error");
        }
      }
    };

    render();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdfDocument, pageNumber, width]);

  if (status === "loading") {
    return (
      <DriveState
        icon={<Spinner className="size-5" />}
        title="Loading PDF."
        description="Loading the first page."
      />
    );
  }

  if (status === "error" || !pdfDocument) {
    return (
      <DriveState
        icon={<FiAlertTriangle className="size-5 text-error" />}
        title="Could not show this PDF."
        description="Use the download button to open it in a PDF app."
      />
    );
  }

  return (
    <div className="grid gap-3 bg-surface-container-low p-3">
      <div
        ref={containerRef}
        className="mx-auto max-h-[min(70vh,40rem)] w-full overflow-auto"
      >
        <canvas
          ref={canvasRef}
          className="mx-auto block max-w-full shadow-sm"
          role="img"
          aria-label={`Page ${pageNumber} of ${totalPages} of ${file.name}`}
        />
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="PDF pages"
          className="flex items-center justify-between gap-3 rounded-control border border-outline-variant bg-surface px-3 py-2"
        >
          <p className="text-xs text-on-surface-variant" aria-live="polite">
            Page {pageNumber} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((current) => current - 1)}
            >
              <FiChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pageNumber >= totalPages}
              onClick={() => setPageNumber((current) => current + 1)}
            >
              Next
              <FiChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
};

export default PdfPreview;
