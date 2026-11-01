import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/api/api-client.js";
import { queryKeys } from "@/lib/query-keys.js";

const useSession = () =>
  useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    staleTime: 60_000,
  });

export default useSession;
