import LinkButton from "@/components/ui/link-button.jsx";

const NotFoundPage = () => (
  <main className="grid min-h-[60dvh] place-items-center px-4 py-8">
    <section className="relative w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant/90 bg-surface p-[clamp(1.5rem,4vw,2.5rem)] text-center shadow-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(21,88,214,0.1),transparent_16rem)]"
      />
      <div className="relative">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          404
        </p>
        <h1 className="mb-4 mt-2 text-[clamp(3rem,10vw,5rem)] font-semibold leading-[1.12] tracking-[-0.06em] text-primary text-balance">
          Page not found
        </h1>
        <p className="mb-6 text-on-surface-variant text-pretty">
          That page does not exist. Check the URL and try again.
        </p>
        <LinkButton to="/">Back to home</LinkButton>
      </div>
    </section>
  </main>
);

export default NotFoundPage;
