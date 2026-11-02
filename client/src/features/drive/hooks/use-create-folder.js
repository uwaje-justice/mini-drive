import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFolder } from "@/api/folders.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useCreateFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useCreateFolder;
