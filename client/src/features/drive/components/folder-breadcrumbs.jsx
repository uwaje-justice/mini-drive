import { FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const FolderBreadcrumbs = ({ breadcrumbs, basePath = "/drive" }) => (
  <nav aria-label="Breadcrumb" className="overflow-x-auto">
    <ol className="flex items-center gap-1 whitespace-nowrap text-xs text-on-surface-variant">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const path = crumb.id ? `${basePath}/folders/${crumb.id}` : basePath;

        return (
          <li key={`${crumb.id ?? "root"}-${index}`} className="flex items-center gap-1">
            {index > 0 ? (
              <FiChevronRight className="size-3" aria-hidden="true" />
            ) : null}
            {isLast ? (
              <span
                aria-current="page"
                className="font-medium text-on-surface"
              >
                {crumb.name}
              </span>
            ) : (
              <Link
                to={path}
                className="rounded px-1 py-0.5 text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default FolderBreadcrumbs;
