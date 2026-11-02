import { useMutation, useQueryClient } from "@tanstack/react-query";

import { revokeFolderShare } from "@/api/shares.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";
import { queryKeys } from "@/lib/query-keys.js";

const useRevokeShare = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeFolderShare,
    onSuccess: (_, { folderId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.folderShares(folderId),
        }),
        invalidateDriveQueries(queryClient),
      ]),
  });
};

export default useRevokeShare;
