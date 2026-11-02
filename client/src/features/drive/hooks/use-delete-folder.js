import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteFolder } from "@/api/folders.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: (_, folderId) => {
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === "drive" &&
          query.queryKey[1] === "folder" &&
          query.queryKey[2] === folderId,
      });
      return invalidateDriveQueries(queryClient);
    },
  });
};

export default useDeleteFolder;
