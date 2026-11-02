import { useMutation, useQueryClient } from "@tanstack/react-query";

import { renameFile } from "@/api/files.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useRenameFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFile,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useRenameFile;
