import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEmail } from "@/api/auth.js";
import { storeSession } from "@/features/auth/session-cache.js";
import { invalidateDriveQueries } from "@/features/drive/drive-cache.js";

const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmail,
    onSuccess: (session) => {
      storeSession(queryClient, session);
      return invalidateDriveQueries(queryClient);
    },
  });
};

export default useUpdateEmail;
