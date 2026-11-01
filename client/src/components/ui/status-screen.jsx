const StatusScreen = ({ icon, title, description, action }) => (
  <main className="grid min-h-dvh place-items-center bg-surface-container-low px-6 py-12">
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface px-8 py-10 text-center shadow-2">
      {icon}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-on-surface">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {action}
    </section>
  </main>
);

export default StatusScreen;
