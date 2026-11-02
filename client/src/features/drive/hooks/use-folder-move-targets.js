import { useQuery } from "@tanstack/react-query";

import { getFolderMoveTargets } from "@/api/folders.js";
import { queryKeys } from "@/lib/query-keys.js";

const useFolderMoveTargets = ({ folderId, enabled = true }) =>
  useQuery({
    queryKey: queryKeys.folderMoveTargets(folderId),
    queryFn: () => getFolderMoveTargets(folderId),
    enabled: enabled && Boolean(folderId),
  });

export default useFolderMoveTargets;
