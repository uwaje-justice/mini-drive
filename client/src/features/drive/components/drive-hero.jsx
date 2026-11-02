import { FiFolder } from "react-icons/fi";

import { formatCount } from "@/features/drive/format.js";

const DriveHero = ({ fileCount, folderCount, categoryCount }) => {
  const isEmpty = fileCount === 0;

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(145deg,var(--color-primary)_0%,#0d47b5_62%,#0a3b96_100%)] p-6 text-on-primary shadow-2 sm:p-8 lg:p-10">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-24 -z-10 size-72 rounded-full border border-white/15 bg-white/5"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 right-16 -z-10 size-64 rounded-full border border-white/10"
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          My drive
        </p>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
          <FiFolder className="size-3.5" aria-hidden="true" />
          {formatCount(categoryCount, "file type")}
        </span>
      </div>

      <div className="mt-10 sm:mt-14">
        <p className="text-sm font-medium text-white/70">Total files</p>
        <p className="mt-1 text-[clamp(3.8rem,9vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
          {fileCount}
        </p>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
          {isEmpty
            ? "Your drive is ready for its first file."
            : `Across ${formatCount(folderCount, "folder")}, including folders inside them.`}
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
        <p className="text-xs uppercase tracking-[0.12em] text-white/60">
          Stored in one place
        </p>
      </div>
    </section>
  );
};

export default DriveHero;
