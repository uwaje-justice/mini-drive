import { FiAlertTriangle } from "react-icons/fi";
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const errorMessage = (error) => {
  if (isRouteErrorResponse(error)) {
    return error.statusText || "The page could not be loaded.";
  }

  return "Something went wrong while loading this page. Try again in a moment.";
};

const RouteErrorPage = () => {
  const error = useRouteError();

  return (
    <main className="grid min-h-dvh place-items-center bg-surface-container-low px-6 py-12">
      <section className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface px-8 py-10 text-center shadow-2">
        <FiAlertTriangle className="mx-auto size-9 text-error" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-on-surface">
          This page could not load.
        </h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          {errorMessage(error)}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-control border border-transparent bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
};

export default RouteErrorPage;
