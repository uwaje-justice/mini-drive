import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import getCategoryMeta from "@/features/drive/category-meta.js";
import { formatCount } from "@/features/drive/format.js";

const CategoryGrid = ({ categories }) => (
  <section className="rounded-xl border border-outline-variant bg-surface p-4 shadow-1 sm:p-5">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-5 gap-y-1">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
          Smart categories
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
          Browse by type
        </h2>
      </div>
      <p className="hidden text-sm text-on-surface-variant sm:block">
        Every file, grouped by what it is.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
      {categories.map((category) => {
        const meta = getCategoryMeta(category.id);
        const Icon = meta.icon;

        return (
          <Link
            key={category.id}
            to={`/drive/categories/${category.id}`}
            className="group flex min-w-0 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3 transition hover:border-primary/30 hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-control ${meta.tone}`}
            >
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <span className="grid min-w-0 flex-1 gap-0.5">
              <strong className="truncate text-sm font-semibold text-on-surface">
                {category.name}
              </strong>
              <span className="text-xs text-on-surface-variant">
                {formatCount(category.count, "file")}
              </span>
            </span>
            <FiChevronRight
              className="size-4 shrink-0 text-on-surface-variant transition group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  </section>
);

export default CategoryGrid;
