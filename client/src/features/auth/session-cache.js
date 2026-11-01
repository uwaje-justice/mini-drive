import { setCsrfToken } from "@/api/api-client.js";
import { queryKeys } from "@/lib/query-keys.js";

const cacheSession = (queryClient, session) => {
  queryClient.removeQueries();
  setCsrfToken(session.csrfToken);
  queryClient.setQueryData(queryKeys.session, session);
};

export default cacheSession;
