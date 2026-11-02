import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearDriveActivityItem } from "@/api/drive.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useClearActivityItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearDriveActivityItem,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useClearActivityItem;
