import { setCsrfToken } from "@/api/api-client.js";
import { queryKeys } from "@/lib/query-keys.js";

export const storeSession = (queryClient, session) => {
  setCsrfToken(session.csrfToken);
  queryClient.setQueryData(queryKeys.session, session);
};

const cacheSession = (queryClient, session) => {
  queryClient.removeQueries();
  storeSession(queryClient, session);
};

export default cacheSession;
