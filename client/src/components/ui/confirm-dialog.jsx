import { useEffect, useId, useState } from "react";

import Button from "@/components/ui/button.jsx";
import Field from "@/components/ui/field.jsx";
import Modal from "@/components/ui/modal.jsx";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  onConfirm,
  onClose,
  requireText,
  acknowledgement,
  children,
}) => {
  const acknowledgementId = useId();
  const [confirmationText, setConfirmationText] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    setConfirmationText("");
    setAcknowledged(false);
  }, [open, requireText, acknowledgement]);

  const isTextConfirmed =
    !requireText || confirmationText.trim() === requireText.trim();
  const isConfirmed =
    isTextConfirmed && (!acknowledgement || acknowledged);

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="grid gap-5">
        {requireText ? (
          <Field
            label={`Type "${requireText}" to confirm`}
            hint="The name must match exactly."
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={isPending}
          />
        ) : null}
        {acknowledgement ? (
          <label
            htmlFor={acknowledgementId}
            className="flex cursor-pointer items-start gap-3 rounded-control border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface"
          >
            <input
              id={acknowledgementId}
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
              disabled={isPending}
              className="mt-0.5 size-4 shrink-0 accent-error focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            />
            <span>{acknowledgement}</span>
          </label>
        ) : null}
        {children}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isPending}
            disabled={!isConfirmed}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
