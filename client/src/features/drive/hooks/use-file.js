import { useQuery } from "@tanstack/react-query";

import { getFile } from "@/api/files.js";
import { queryKeys } from "@/lib/query-keys.js";

const useFile = (fileId) =>
  useQuery({
    queryKey: queryKeys.file(fileId),
    queryFn: () => getFile(fileId),
    enabled: Boolean(fileId),
  });

export default useFile;
