import { useQuery } from "@tanstack/react-query";

import { getDriveOverview } from "@/api/drive.js";
import { queryKeys } from "@/lib/query-keys.js";

const useDriveOverview = () =>
  useQuery({
    queryKey: queryKeys.driveOverview,
    queryFn: getDriveOverview,
  });

export default useDriveOverview;
