import NameDialog from "@/components/ui/name-dialog.jsx";
import useCreateFolder from "@/features/drive/hooks/use-create-folder.js";

const NewFolderDialog = ({ open, parentId = null, parentName, onClose }) => {
  const createFolder = useCreateFolder();

  return (
    <NameDialog
      open={open}
      title="New folder"
      description={`Create a folder in ${parentName ?? "My drive"}.`}
      label="Folder name"
      submitLabel="Create folder"
      hint="Up to 100 characters."
      maxLength={100}
      isPending={createFolder.isPending}
      onSubmit={(name) => createFolder.mutateAsync({ name, parentId })}
      onClose={onClose}
    />
  );
};

export default NewFolderDialog;
