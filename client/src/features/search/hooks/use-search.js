import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchDrive } from "@/api/search.js";
import { queryKeys } from "@/lib/query-keys.js";

const useSearch = ({ query, page = 1 }) =>
  useQuery({
    queryKey: queryKeys.search(query, page),
    queryFn: () => searchDrive({ query, page }),
    enabled: Boolean(query),
    placeholderData: query ? keepPreviousData : undefined,
  });

export default useSearch;
