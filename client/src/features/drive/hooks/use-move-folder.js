import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moveFolder } from "@/api/folders.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useMoveFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveFolder,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useMoveFolder;
