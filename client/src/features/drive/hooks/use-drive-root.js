import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getDriveRoot } from "@/api/drive.js";
import { queryKeys } from "@/lib/query-keys.js";

const useDriveRoot = ({ page = 1, folderPage = 1, enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.driveRoot(page, folderPage),
    queryFn: () => getDriveRoot({ page, folderPage }),
    enabled,
    placeholderData: keepPreviousData,
  });

export default useDriveRoot;
