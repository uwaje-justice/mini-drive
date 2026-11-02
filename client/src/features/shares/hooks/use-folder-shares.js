import { useQuery } from "@tanstack/react-query";

import { listFolderShares } from "@/api/shares.js";
import { queryKeys } from "@/lib/query-keys.js";

const useFolderShares = ({ folderId, enabled = true }) =>
  useQuery({
    queryKey: queryKeys.folderShares(folderId),
    queryFn: () => listFolderShares(folderId),
    enabled: enabled && Boolean(folderId),
  });

export default useFolderShares;
