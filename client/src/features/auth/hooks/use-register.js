import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerUser } from "@/api/auth.js";
import cacheSession from "@/features/auth/session-cache.js";

const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (session) => cacheSession(queryClient, session),
  });
};

export default useRegister;
