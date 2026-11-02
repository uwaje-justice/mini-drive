import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getDriveActivity } from "@/api/drive.js";
import { queryKeys } from "@/lib/query-keys.js";

const useDriveActivity = ({
  page = 1,
  query = "",
  action = "",
  targetType = "",
  enabled = true,
} = {}) =>
  useQuery({
    queryKey: queryKeys.driveActivity({ page, query, action, targetType }),
    queryFn: () => getDriveActivity({ page, query, action, targetType }),
    enabled,
    placeholderData: keepPreviousData,
  });

export default useDriveActivity;
