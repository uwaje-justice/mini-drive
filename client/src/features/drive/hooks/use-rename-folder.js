import { useMutation, useQueryClient } from "@tanstack/react-query";

import { renameFolder } from "@/api/folders.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useRenameFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFolder,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useRenameFolder;
