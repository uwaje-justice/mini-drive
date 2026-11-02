import { useEffect, useId, useRef } from "react";
import { FiX } from "react-icons/fi";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-5xl",
};

const Modal = ({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return undefined;

    const handleCancel = (event) => {
      event.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);

    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={`m-auto w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-outline-variant bg-surface p-0 text-on-surface shadow-2 outline-none [&::backdrop]:bg-scrim ${sizes[size]}`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4">
        <div className="min-w-0 flex-1">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-on-surface [overflow-wrap:anywhere]"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm leading-6 text-on-surface-variant [overflow-wrap:anywhere]"
            >
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Close dialog"
        >
          <FiX className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
};

export default Modal;
