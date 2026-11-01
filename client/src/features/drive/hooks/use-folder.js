import { useQuery } from "@tanstack/react-query";

import { getFolder } from "@/api/drive.js";
import { queryKeys } from "@/lib/query-keys.js";

const useFolder = ({ folderId, page = 1, folderPage = 1 } = {}) =>
  useQuery({
    queryKey: queryKeys.folder(folderId, page, folderPage),
    queryFn: () => getFolder(folderId, { page, folderPage }),
    enabled: Boolean(folderId),
  });

export default useFolder;
