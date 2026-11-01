import { motion } from "motion/react";
import { FiFile, FiFolder, FiLock, FiUploadCloud } from "react-icons/fi";

import useSession from "@/features/auth/hooks/use-session.js";

const highlights = [
  { icon: FiLock, label: "Only you" },
  { icon: FiUploadCloud, label: "10 files per upload" },
  { icon: FiFile, label: "5 MB per file" },
];

const DrivePage = () => {
  const session = useSession();
  const email = session.data?.user?.email ?? "";
  const name = email.split("@")[0] || "there";

  return (
    <motion.div
      className="mx-auto grid w-full max-w-5xl gap-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          My drive
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-on-surface sm:text-4xl">
          Welcome back, {name}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant">
          This is where your folders and files will live.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-1">
        <div className="grid gap-8 px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid size-16 place-items-center rounded-xl bg-primary-container text-primary">
            <FiFolder className="size-8" aria-hidden="true" />
          </div>

          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-on-surface">
              Your drive is empty
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Create a folder or upload a file to get started.
            </p>
          </div>

          <ul className="flex flex-wrap gap-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.label}
                  className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface-variant"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </motion.div>
  );
};

export default DrivePage;
