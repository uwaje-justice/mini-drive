import { useMutation, useQueryClient } from "@tanstack/react-query";

import { getSession } from "@/api/api-client.js";
import { logoutUser } from "@/api/auth.js";
import { queryKeys } from "@/lib/query-keys.js";

const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      queryClient.removeQueries();
      const session = await getSession();
      queryClient.setQueryData(queryKeys.session, session);
    },
  });
};

export default useLogout;
