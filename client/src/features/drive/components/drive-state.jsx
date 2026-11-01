const DriveState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
    {icon ? (
      <span className="grid size-12 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">
        {icon}
      </span>
    ) : null}
    <div className="max-w-sm">
      <h3 className="text-base font-semibold text-on-surface">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);

export default DriveState;
