import Button from "@/components/ui/button.jsx";
import Modal from "@/components/ui/modal.jsx";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  onConfirm,
  onClose,
  children,
}) => (
  <Modal open={open} onClose={onClose} title={title} description={description}>
    <div className="grid gap-5">
      {children}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isPending}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
