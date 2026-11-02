import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFolderShare } from "@/api/shares.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";
import { queryKeys } from "@/lib/query-keys.js";

const useCreateShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolderShare,
    onSuccess: (_, { folderId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folderShares(folderId),
        }),
        invalidateDriveQueries(queryClient),
      ]),
  });
};

export default useCreateShare;
