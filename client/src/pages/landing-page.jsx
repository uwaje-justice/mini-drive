import {
  FiCheck,
  FiDownload,
  FiEye,
  FiFile,
  FiFileText,
  FiFolder,
  FiImage,
  FiLink,
  FiSearch,
  FiShield,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

import Container from "@/components/layout/container.jsx";
import LandingFooter from "@/components/layout/landing-footer.jsx";
import LandingHeader from "@/components/layout/landing-header.jsx";
import LinkButton from "@/components/ui/link-button.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const assurances = [
  { icon: FiUploadCloud, label: "Up to 10 files per upload" },
  { icon: FiFile, label: "5 MB per file" },
  { icon: FiLink, label: "Links last 1 to 365 days" },
];

const driveItems = [
  { name: "Projects", meta: "4 items", tone: "yellow", icon: FiFolder },
  { name: "Receipts", meta: "12 items", tone: "blue", icon: FiFolder },
  { name: "Notes.txt", meta: "2.4 KB", tone: "red", icon: FiFileText },
  { name: "Team photo.jpg", meta: "1.8 MB", tone: "green", icon: FiImage },
];

const benefits = [
  {
    icon: FiUploadCloud,
    tone: "blue",
    title: "Batch uploads",
    text: "Upload up to 10 files at once. Skipped files get a clear message.",
  },
  {
    icon: FiEye,
    tone: "green",
    title: "Preview first",
    text: "Open images, PDFs, and text before downloading.",
  },
  {
    icon: FiLink,
    tone: "yellow",
    title: "Expiring links",
    text: "Share a folder for 1 to 365 days, then revoke the link.",
  },
];

const features = [
  {
    icon: FiFolder,
    tone: "blue",
    title: "Nested folders",
    text: "Create folders inside folders, so a project can keep its own files together.",
  },
  {
    icon: FiUploadCloud,
    tone: "yellow",
    title: "Batch uploads",
    text: "Select up to 10 files at once. Skipped files get a clear message.",
  },
  {
    icon: FiSearch,
    tone: "green",
    title: "Search by name",
    text: "Search folders and files across your drive. Results only include your files.",
  },
  {
    icon: FiEye,
    tone: "blue",
    title: "Inline previews",
    text: "Open images, PDFs, and plain text without downloading them.",
  },
  {
    icon: FiX,
    tone: "red",
    title: "Read-only links",
    text: "Share a folder for 1 to 365 days. The link can be revoked.",
  },
  {
    icon: FiDownload,
    tone: "green",
    title: "Original downloads",
    text: "Download the original file whenever you need it.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an account",
    text: "Sign up with an email and password. Your drive starts empty.",
  },
  {
    number: "02",
    title: "Add folders and files",
    text: "Create a folder, then upload up to 10 files at a time.",
  },
  {
    number: "03",
    title: "Find or share",
    text: "Search by name, preview a file, or create a folder link that expires.",
  },
];

const privacyPoints = [
  "Only you can open your drive.",
  "A link opens only the folder you choose.",
  "Expired and revoked links stop working.",
];

const toneClasses = {
  blue: "bg-primary-container text-primary",
  green: "bg-success-container text-on-success-container",
  red: "bg-error-container text-on-error-container",
  yellow: "bg-warning-container text-on-warning-container",
};

const eyebrowClass =
  "mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase leading-[1.4] tracking-[0.09em] text-secondary";
const sectionClass = "py-[clamp(4rem,7vw,6.5rem)]";
const sectionHeadingClass = "mb-[clamp(2rem,4vw,3.5rem)] max-w-[46rem]";
const sectionTitleClass =
  "mb-4 text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-balance";
const sectionTextClass =
  "mb-0 max-w-[60ch] text-[1.05rem] leading-[1.7] text-on-surface-variant text-pretty";
const heroButtonClass = "px-[1.65rem] max-sm:flex-1 max-sm:basis-[11rem]";

const DriveItem = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="flex min-h-[6.4rem] flex-col justify-between gap-[0.8rem] rounded-lg border border-transparent bg-surface-container-low p-[0.85rem] max-sm:min-h-[5.4rem] max-sm:p-[0.65rem]">
      <span
        className={`grid size-[2.15rem] place-items-center rounded-[0.65rem] ${toneClasses[item.tone]}`}
      >
        <Icon className="size-[1.2rem]" aria-hidden="true" />
      </span>
      <span>
        <span className="block truncate text-[0.73rem] font-medium text-on-surface">
          {item.name}
        </span>
        <span className="mt-[0.08rem] block truncate text-[0.62rem] text-on-surface-variant">
          {item.meta}
        </span>
      </span>
    </div>
  );
};

const LandingPage = () => {
  const session = useSession();
  const user = session.data?.user;

  return (
    <>
      <LandingHeader />

      <main className="overflow-x-clip">
        <section
          className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-surface-container-low)_0%,var(--color-surface)_100%)] pb-[clamp(4rem,7vw,6.5rem)] pt-[clamp(3.5rem,7vw,7rem)] max-sm:pt-12"
          aria-labelledby="hero-title"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-52 -top-76 size-[42rem] rounded-full bg-[radial-gradient(circle,rgba(211,227,253,0.8)_0%,rgba(211,227,253,0)_68%)]"
          />

          <Container className="relative grid items-center gap-[clamp(2.5rem,5vw,5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="relative z-[1] max-lg:max-w-[43rem]">
              <p className={eyebrowClass}>
                <span
                  className="size-[0.45rem] rounded-full bg-success shadow-[0_0_0_0.25rem_rgba(52,168,83,0.12)]"
                  aria-hidden="true"
                />
                A small drive for your files.
              </p>
              <h1
                id="hero-title"
                className="mb-5 max-w-[45rem] text-display font-semibold leading-[1.02] tracking-[-0.055em] text-on-surface text-balance"
              >
                Upload it once. Find it when you need it.
              </h1>
              <p className="mb-8 max-w-[34rem] text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.65] text-on-surface-variant text-pretty">
                Mini Drive keeps your folders, files, previews, and expiring
                links in one place. Upload up to 10 files at once, 5 MB each.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <LinkButton to="/drive" className={heroButtonClass}>
                    Open my drive
                  </LinkButton>
                ) : (
                  <>
                    <LinkButton to="/register" className={heroButtonClass}>
                      Create account
                    </LinkButton>
                    <LinkButton
                      to="/login"
                      variant="secondary"
                      className={heroButtonClass}
                    >
                      Sign in
                    </LinkButton>
                  </>
                )}
              </div>
              <ul
                className="mt-8 flex list-none flex-wrap gap-x-5 gap-y-3 p-0 text-sm text-on-surface-variant max-sm:gap-x-4"
                aria-label="Highlights"
              >
                {assurances.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li
                      key={item.label}
                      className="inline-flex items-center gap-[0.4rem]"
                    >
                      <Icon
                        className="size-[1.1rem] shrink-0 text-success"
                        aria-hidden="true"
                      />
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              className="relative ml-auto w-full max-w-[34rem] max-lg:mx-auto max-lg:max-w-[36rem]"
              aria-hidden="true"
            >
              <div className="relative rounded-2xl border border-outline-variant bg-surface/[0.96] p-[0.9rem] shadow-lift max-sm:rounded-[1.35rem] max-sm:p-[0.7rem]">
                <div className="flex items-center gap-3 px-[0.3rem] pb-[0.85rem] pt-[0.15rem]">
                  <span className="flex gap-[0.3rem]">
                    <span className="size-[0.45rem] rounded-full bg-error" />
                    <span className="size-[0.45rem] rounded-full bg-warning" />
                    <span className="size-[0.45rem] rounded-full bg-success" />
                  </span>
                  <span className="mx-auto text-xs font-medium text-on-surface-variant">
                    My drive
                  </span>
                  <span className="grid size-[1.65rem] place-items-center rounded-full bg-primary-container text-[0.66rem] font-semibold text-on-primary-container">
                    J
                  </span>
                </div>

                <div className="mb-[0.65rem] flex items-center gap-2 rounded-full bg-surface-container px-[0.85rem] py-[0.65rem] text-xs text-on-surface-variant">
                  <FiSearch className="size-4 shrink-0" />
                  <span>Search your drive</span>
                  <span className="ml-auto rounded-[0.3rem] border border-outline-variant px-[0.35rem] py-[0.08rem] text-[0.62rem]">
                    /
                  </span>
                </div>

                <div className="mb-[0.8rem] flex gap-[0.4rem] max-[420px]:gap-[0.3rem]">
                  <span className="rounded-full bg-primary-container px-[0.65rem] py-[0.32rem] text-[0.68rem] font-medium text-on-primary-container max-[420px]:px-[0.52rem] max-[420px]:py-[0.28rem]">
                    All files
                  </span>
                  <span className="rounded-full px-[0.65rem] py-[0.32rem] text-[0.68rem] font-medium text-on-surface-variant max-[420px]:px-[0.52rem] max-[420px]:py-[0.28rem]">
                    Folders
                  </span>
                  <span className="rounded-full px-[0.65rem] py-[0.32rem] text-[0.68rem] font-medium text-on-surface-variant max-[420px]:px-[0.52rem] max-[420px]:py-[0.28rem]">
                    Recent
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-[0.65rem] max-sm:gap-2">
                  {driveItems.map((item) => (
                    <DriveItem key={item.name} item={item} />
                  ))}
                </div>

                <div className="absolute bottom-[0.85rem] right-[0.85rem] flex items-center gap-[0.55rem] rounded-lg border border-outline-variant bg-surface px-[0.85rem] py-[0.65rem] shadow-2 max-sm:bottom-[0.6rem] max-sm:right-[0.6rem] max-sm:px-[0.6rem] max-sm:py-2 max-[420px]:px-[0.6rem] max-[420px]:py-2">
                  <span className="grid size-8 place-items-center rounded-full bg-secondary-container text-on-secondary-container">
                    <FiLink className="size-[0.95rem]" />
                  </span>
                  <span className="flex flex-col">
                    <strong className="text-[0.7rem] font-semibold text-on-surface max-[420px]:text-[0.66rem]">
                      Share link
                    </strong>
                    <span className="text-[0.62rem] text-on-surface-variant max-[420px]:text-[0.59rem]">
                      Expires in 7 days
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          className="border-b border-outline-variant bg-surface py-8"
          aria-labelledby="benefits-title"
        >
          <Container>
            <h2 id="benefits-title" className="sr-only">
              What Mini Drive includes
            </h2>
            <ul className="m-0 grid list-none grid-cols-3 p-0 max-[820px]:grid-cols-1">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <li
                    className="flex items-start gap-4 border-l border-outline-variant px-8 first:border-l-0 first:pl-0 last:pr-0 max-[820px]:border-l-0 max-[820px]:border-t max-[820px]:px-0 max-[820px]:py-5 max-[820px]:first:border-t-0 max-[820px]:first:pt-0 max-[820px]:last:pb-0"
                    key={benefit.title}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-md ${toneClasses[benefit.tone]}`}
                    >
                      <Icon className="size-[1.2rem]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="mb-1 text-[0.95rem] font-semibold">
                        {benefit.title}
                      </h3>
                      <p className="m-0 text-sm leading-[1.55] text-on-surface-variant">
                        {benefit.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Container>
        </section>

        <section
          className={`${sectionClass} scroll-mt-24 bg-surface-container-low max-[820px]:scroll-mt-[8.5rem]`}
          id="features"
          aria-labelledby="features-title"
        >
          <Container>
            <div className={sectionHeadingClass}>
              <p className={eyebrowClass}>Inside the drive</p>
              <h2 id="features-title" className={sectionTitleClass}>
                Folders, search, previews, and expiring links.
              </h2>
              <p className={sectionTextClass}>
                Mini Drive stores files, helps you find them, and lets you
                share a folder for a limited time.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-sm:grid-cols-1">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    className="rounded-[1.35rem] border border-outline-variant bg-surface p-6 transition hover:-translate-y-[3px] hover:border-surface-container-highest hover:shadow-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    key={feature.title}
                  >
                    <span
                      className={`mb-5 grid size-11 place-items-center rounded-[0.9rem] ${toneClasses[feature.tone]}`}
                    >
                      <Icon className="size-[1.35rem]" aria-hidden="true" />
                    </span>
                    <h3 className="mb-2 text-[1.05rem] font-semibold">
                      {feature.title}
                    </h3>
                    <p className="m-0 text-[0.93rem] leading-[1.65] text-on-surface-variant">
                      {feature.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>

        <section
          className={`${sectionClass} scroll-mt-24 max-[820px]:scroll-mt-[8.5rem]`}
          id="how-it-works"
          aria-labelledby="how-it-works-title"
        >
          <Container>
            <div className={sectionHeadingClass}>
              <p className={eyebrowClass}>How it works</p>
              <h2 id="how-it-works-title" className={sectionTitleClass}>
                From empty drive to first share link.
              </h2>
            </div>

            <ol className="m-0 grid list-none grid-cols-3 gap-[clamp(1.5rem,4vw,3rem)] p-0 max-[820px]:grid-cols-1 max-[820px]:gap-6">
              {steps.map((step) => (
                <li
                  className="border-t-2 border-primary-container pt-5 max-[820px]:pt-4"
                  key={step.number}
                >
                  <span className="mb-4 block text-xs font-semibold tracking-[0.12em] text-secondary">
                    {step.number}
                  </span>
                  <h3 className="mb-2 text-[1.1rem] font-semibold">
                    {step.title}
                  </h3>
                  <p className="m-0 text-[0.95rem] leading-[1.65] text-on-surface-variant">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section
          className={`${sectionClass} scroll-mt-24 bg-surface-container-low max-[820px]:scroll-mt-[8.5rem]`}
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <Container className="grid items-center gap-[clamp(2.5rem,7vw,6rem)] max-[900px]:grid-cols-1 min-[901px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div>
              <p className={eyebrowClass}>Privacy</p>
              <h2 id="privacy-title" className={sectionTitleClass}>
                Sharing is a choice you can undo.
              </h2>
              <p className={`${sectionTextClass} max-w-[38rem]`}>
                Your drive is tied to your account. Share links are read-only,
                expire on a date you choose, and can be revoked.
              </p>
              <ul className="m-0 mt-8 grid list-none gap-4 p-0">
                {privacyPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-[0.95rem] leading-[1.6] text-on-surface-variant"
                  >
                    <span className="mt-[0.08rem] grid size-[1.35rem] shrink-0 place-items-center rounded-full bg-success-container text-on-success-container">
                      <FiCheck className="size-[0.8rem]" aria-hidden="true" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="relative grid min-h-[22rem] w-full place-items-center overflow-hidden rounded-[2rem] border border-outline-variant bg-surface shadow-lift max-[900px]:mx-auto max-[900px]:max-w-[34rem] max-sm:min-h-[17rem]"
              aria-hidden="true"
            >
              <span className="absolute size-56 rounded-full border border-primary-container max-sm:size-44" />
              <span className="absolute size-[19rem] rounded-full border border-primary-container max-sm:size-[15rem]" />
              <span className="relative z-[1] grid size-32 place-items-center rounded-[2rem] bg-primary-container text-primary shadow-[inset_0_0_0_1px_rgba(11,87,208,0.08)] max-sm:size-[6.5rem] max-sm:rounded-[1.6rem]">
                <FiShield className="size-16 max-sm:size-[3.25rem]" />
              </span>
              <span className="absolute left-5 top-8 z-[2] rounded-full border border-outline-variant bg-surface px-[0.8rem] py-[0.55rem] text-[0.72rem] font-medium text-on-surface-variant shadow-1 max-sm:left-3 max-sm:top-4">
                Only you
              </span>
              <span className="absolute bottom-8 right-5 z-[2] rounded-full border border-outline-variant bg-surface px-[0.8rem] py-[0.55rem] text-[0.72rem] font-medium text-on-surface-variant shadow-1 max-sm:bottom-4 max-sm:right-3">
                Expires in 7 days
              </span>
            </div>
          </Container>
        </section>

        <section
          className="pb-[clamp(4rem,7vw,6.5rem)]"
          aria-labelledby="cta-title"
        >
          <Container className="relative flex items-center justify-between gap-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--color-primary-container)_0%,#eef4ff_62%,var(--color-surface)_100%)] p-[clamp(2rem,5vw,4rem)] max-[900px]:flex-col max-[900px]:items-start max-sm:rounded-[1.5rem]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-36 -right-20 size-[22rem] rounded-full border border-primary/10"
            />
            <div className="relative z-[1] max-w-[39rem]">
              <p className={eyebrowClass}>Start with an empty drive.</p>
              <h2
                id="cta-title"
                className={`${sectionTitleClass} max-w-[18ch]`}
              >
                Create an account and upload your first file.
              </h2>
              <p className={`${sectionTextClass} max-w-[38rem]`}>
                Create a folder, add files, and share a link when you need to.
              </p>
            </div>
            <div className="relative z-[1] flex shrink-0 flex-wrap gap-3">
              {user ? (
                <LinkButton to="/drive">Open my drive</LinkButton>
              ) : (
                <>
                  <LinkButton to="/register">Create account</LinkButton>
                  <LinkButton to="/login" variant="secondary">
                    Sign in
                  </LinkButton>
                </>
              )}
            </div>
          </Container>
        </section>
      </main>

      <LandingFooter />
    </>
  );
};

export default LandingPage;
