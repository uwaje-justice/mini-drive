import NameDialog from "@/components/ui/name-dialog.jsx";
import useRenameFile from "@/features/drive/hooks/use-rename-file.js";

const RenameFileDialog = ({ open, file, onClose }) => {
  const renameFile = useRenameFile();

  return (
    <NameDialog
      open={open}
      title="Rename file"
      description="The file stays in its current folder."
      label="File name"
      initialValue={file?.name ?? ""}
      submitLabel="Save name"
      hint="Up to 255 characters."
      maxLength={255}
      isPending={renameFile.isPending}
      onSubmit={(name) =>
        renameFile.mutateAsync({ fileId: file.id, name })
      }
      onClose={onClose}
    />
  );
};

export default RenameFileDialog;
