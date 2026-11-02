import { useMutation, useQueryClient } from "@tanstack/react-query";

import { clearDriveActivity } from "@/api/drive.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useClearActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearDriveActivity,
    onSuccess: () => invalidateDriveQueries(queryClient),
  });
};

export default useClearActivity;
