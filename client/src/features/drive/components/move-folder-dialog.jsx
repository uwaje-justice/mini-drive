import MoveDialog from "@/components/ui/move-dialog.jsx";
import useFolderMoveTargets from "@/features/drive/hooks/use-folder-move-targets.js";
import useMoveFolder from "@/features/drive/hooks/use-move-folder.js";

const MoveFolderDialog = ({ open, folder, onClose }) => {
  const moveFolder = useMoveFolder();
  const targetsQuery = useFolderMoveTargets({
    folderId: folder?.id,
    enabled: open,
  });

  return (
    <MoveDialog
      open={open}
      title="Move folder"
      description="Choose a new parent folder."
      currentValue={folder?.parentId ?? ""}
      targets={targetsQuery.data?.targets}
      targetsPending={targetsQuery.isPending}
      targetsError={targetsQuery.isError ? targetsQuery.error : null}
      fieldName="parentId"
      isPending={moveFolder.isPending}
      onSubmit={(parentId) =>
        moveFolder.mutateAsync({ folderId: folder.id, parentId })
      }
      onClose={onClose}
    />
  );
};

export default MoveFolderDialog;
