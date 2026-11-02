import { motion } from "motion/react";
import { FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import { Link, useParams, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/button.jsx";
import getCategoryMeta from "@/features/drive/category-meta.js";
import DriveLoading from "@/features/drive/components/drive-loading.jsx";
import DrivePanel from "@/features/drive/components/drive-panel.jsx";
import DriveState from "@/features/drive/components/drive-state.jsx";
import FileList from "@/features/drive/components/file-list.jsx";
import PaginationControls from "@/features/drive/components/pagination-controls.jsx";
import { formatCount } from "@/features/drive/format.js";
import useDriveCategory from "@/features/drive/hooks/use-drive-category.js";
import { readPageParam } from "@/features/drive/params.js";

const backLinkClass =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPageParam(searchParams.get("page"));
  const categoryQuery = useDriveCategory({ categoryId, page });
  const category = categoryQuery.isError
    ? undefined
    : categoryQuery.data?.category;
  const meta = getCategoryMeta(categoryId);
  const Icon = meta.icon;

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
      className="mx-auto grid w-full max-w-6xl gap-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="grid gap-4">
        <Link to="/drive" className={backLinkClass}>
          <FiArrowLeft className="size-4" aria-hidden="true" />
          My drive
        </Link>

        <header className="flex items-start gap-4">
          <span
            className={`grid size-12 shrink-0 place-items-center rounded-xl ${meta.tone} shadow-sm`}
          >
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Smart category
            </p>
            <h1 className="truncate text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
              {category?.name ?? "Category"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
              {category
                ? `${formatCount(category.count, "file")} from every folder.`
                : "Files of this type from every folder."}
            </p>
          </div>
        </header>
      </div>

      <DrivePanel
        kicker="Category"
        title={
          category
            ? formatCount(category.count, "file")
            : "Category files"
        }
        description="This list includes files from every folder."
        isFetching={categoryQuery.isFetching}
      >
        {categoryQuery.isPending ? <DriveLoading /> : null}

        {categoryQuery.isError && categoryQuery.error?.status === 404 ? (
          <DriveState
            icon={<Icon className="size-5" />}
            title="Category not found."
            description="Choose a category on My drive."
            action={
              <Link
                to="/drive"
                className="inline-flex min-h-9 items-center justify-center rounded-control border border-outline-variant bg-surface px-3 text-xs font-semibold text-primary transition hover:border-primary/30 hover:bg-surface-container-low"
              >
                Back to my drive
              </Link>
            }
          />
        ) : null}

        {categoryQuery.isError && categoryQuery.error?.status !== 404 ? (
          <DriveState
            icon={<FiAlertTriangle className="size-5 text-error" />}
            title="Could not load this category."
            description="Check your connection, then try again."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => categoryQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : null}

        {category && categoryQuery.data.files.length === 0 ? (
          <DriveState
            icon={<Icon className="size-5" />}
            title={`No ${category.name.toLowerCase()} yet.`}
            description="Files that match this category will appear here."
          />
        ) : null}

        {category && categoryQuery.data.files.length > 0 ? (
          <>
            <FileList files={categoryQuery.data.files} />
            <PaginationControls
              pagination={categoryQuery.data.pagination}
              label={`${category.name} pages`}
              onChange={changePage}
            />
          </>
        ) : null}
      </DrivePanel>
    </motion.div>
  );
};

export default CategoryPage;
