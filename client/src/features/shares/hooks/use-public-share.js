import { useQuery } from "@tanstack/react-query";

import { getPublicShare } from "@/api/shares.js";
import { queryKeys } from "@/lib/query-keys.js";

const usePublicShare = ({ token, folderId = null, page = 1, folderPage = 1 }) =>
  useQuery({
    queryKey: queryKeys.publicShare(token, folderId, page, folderPage),
    queryFn: () => getPublicShare(token, { folderId, page, folderPage }),
    enabled: Boolean(token),
  });

export default usePublicShare;
