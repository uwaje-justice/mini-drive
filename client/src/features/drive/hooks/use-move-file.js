import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moveFile } from "@/api/files.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useMoveFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveFile,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useMoveFile;
