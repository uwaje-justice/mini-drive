import MoveDialog from "@/components/ui/move-dialog.jsx";
import useFileMoveTargets from "@/features/drive/hooks/use-file-move-targets.js";
import useMoveFile from "@/features/drive/hooks/use-move-file.js";

const MoveFileDialog = ({ open, file, onClose }) => {
  const moveFile = useMoveFile();
  const targetsQuery = useFileMoveTargets({
    fileId: file?.id,
    enabled: open,
  });

  return (
    <MoveDialog
      open={open}
      title="Move file"
      description="Choose a folder for this file."
      currentValue={file?.folderId ?? ""}
      targets={targetsQuery.data?.targets}
      targetsPending={targetsQuery.isPending}
      targetsError={targetsQuery.isError ? targetsQuery.error : null}
      fieldName="folderId"
      isPending={moveFile.isPending}
      onSubmit={(folderId) =>
        moveFile.mutateAsync({ fileId: file.id, folderId })
      }
      onClose={onClose}
    />
  );
};

export default MoveFileDialog;
