import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEmail } from "@/api/auth.js";
import { storeSession } from "@/features/auth/session-cache.js";

const useUpdateEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmail,
    onSuccess: (session) => storeSession(queryClient, session),
  });
};

export default useUpdateEmail;
