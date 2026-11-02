import { useQuery } from "@tanstack/react-query";

import { getFileMoveTargets } from "@/api/files.js";
import { queryKeys } from "@/lib/query-keys.js";

const useFileMoveTargets = ({ fileId, enabled = true }) =>
  useQuery({
    queryKey: queryKeys.fileMoveTargets(fileId),
    queryFn: () => getFileMoveTargets(fileId),
    enabled: enabled && Boolean(fileId),
  });

export default useFileMoveTargets;
