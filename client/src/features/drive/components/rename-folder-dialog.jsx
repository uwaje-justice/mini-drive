import NameDialog from "@/components/ui/name-dialog.jsx";
import useRenameFolder from "@/features/drive/hooks/use-rename-folder.js";

const RenameFolderDialog = ({ open, folder, onClose }) => {
  const renameFolder = useRenameFolder();

  return (
    <NameDialog
      open={open}
      title="Rename folder"
      description="The folder keeps its contents and location."
      label="Folder name"
      initialValue={folder?.name ?? ""}
      submitLabel="Save name"
      hint="Up to 100 characters."
      maxLength={100}
      isPending={renameFolder.isPending}
      onSubmit={(name) =>
        renameFolder.mutateAsync({ folderId: folder.id, name })
      }
      onClose={onClose}
    />
  );
};

export default RenameFolderDialog;
