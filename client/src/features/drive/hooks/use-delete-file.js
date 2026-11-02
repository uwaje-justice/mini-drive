import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFile } from "@/api/files.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";
import { queryKeys } from "@/lib/query-keys.js";

const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: (_, fileId) => {
      queryClient.removeQueries({ queryKey: queryKeys.file(fileId) });
      return invalidateDriveQueries(queryClient);
    },
  });
};

export default useDeleteFile;
