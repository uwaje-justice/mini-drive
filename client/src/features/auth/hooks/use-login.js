import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loginUser } from "@/api/auth.js";
import cacheSession from "@/features/auth/session-cache.js";

const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (session) => cacheSession(queryClient, session),
  });
};

export default useLogin;
