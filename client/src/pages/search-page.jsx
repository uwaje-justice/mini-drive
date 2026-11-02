import { motion } from "motion/react";
import { FiAlertTriangle, FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import { formatCount } from "@/features/drive/format.js";
import { readPageParam } from "@/features/drive/params.js";
import SearchForm from "@/features/search/components/search-form.jsx";
import SearchResultList from "@/features/search/components/search-result-list.jsx";
import useSearch from "@/features/search/hooks/use-search.js";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const page = readPageParam(searchParams.get("page"));
  const results = useSearch({ query, page });
  const total = results.data?.pagination.total;

  const search = (value) => {
    const next = new URLSearchParams();

    if (value) next.set("q", value);
    setSearchParams(next);
  };

  const changePage = (nextPage) => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        next.set("page", String(nextPage));
        return next;
      },
      { replace: true },
    );
  };

  return (
    <motion.div
      className="mx-auto grid w-full max-w-5xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <header className="grid gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Search
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
            Find anything in your drive
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
            Search file and folder names across every folder.
          </p>
        </div>
        <SearchForm
          initialValue={query}
          onSearch={search}
          autoFocus={!query}
        />
      </header>

      <DrivePanel
        kicker="Search"
        title={
          query && total !== undefined
            ? formatCount(total, "result")
            : "Results"
        }
        description={
          query ? `Matches for "${query}".` : "Enter a name to begin."
        }
        isFetching={results.isFetching}
      >
        {!query ? (
          <DriveState
            icon={<FiSearch className="size-5" />}
            title="Search your drive."
            description="Files and folders from every folder will appear here."
          />
        ) : null}

        {query && results.isPending ? <DriveLoading /> : null}

        {query && results.isError ? (
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not search your drive."
            description="Check your connection, then try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => results.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : null}

        {query && results.data?.results.length === 0 ? (
          <DriveState
            icon={<FiSearch className="size-5" />}
            title={`No matches for "${query}".`}
            description="Try a shorter name or check the spelling."
          />
        ) : null}

        {results.data?.results.length > 0 ? (
          <>
            <SearchResultList results={results.data.results} />
            <PaginationControls
              pagination={results.data.pagination}
              label="Search result pages"
              onChange={changePage}
            />
          </>
        ) : null}
      </DrivePanel>
    </motion.div>
  );
};

export default SearchPage;
