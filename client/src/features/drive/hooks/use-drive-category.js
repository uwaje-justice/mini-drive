import { useQuery } from "@tanstack/react-query";

import { getDriveCategory } from "@/api/drive.js";
import { queryKeys } from "@/lib/query-keys.js";

const useDriveCategory = ({ categoryId, page = 1, enabled = true } = {}) =>
  useQuery({
    queryKey: queryKeys.driveCategory(categoryId, page),
    queryFn: () => getDriveCategory(categoryId, { page }),
    enabled: enabled && Boolean(categoryId),
  });

export default useDriveCategory;
