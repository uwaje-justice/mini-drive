import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadFiles } from "@/api/files.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useUploadFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFiles,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useUploadFiles;
