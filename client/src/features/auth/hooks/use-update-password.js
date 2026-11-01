import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePassword } from "@/api/auth.js";
import { storeSession } from "@/features/auth/session-cache.js";

const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePassword,
    onSuccess: (session) => storeSession(queryClient, session),
  });
};

export default useUpdatePassword;
