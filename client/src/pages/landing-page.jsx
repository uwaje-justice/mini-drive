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
import { Link } from "react-router-dom";

import LandingFooter from "@/components/layout/landing-footer.jsx";
import LandingHeader from "@/components/layout/landing-header.jsx";
import useSession from "@/features/auth/hooks/use-session.js";

const assurances = [
  { icon: FiUploadCloud, label: "10 files per upload" },
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
    text: "Send 10 files at once and get a clear message for each skipped file.",
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
    text: "Share a folder for 1 to 365 days, then close the link.",
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
    title: "Batch upload",
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
  "A link exposes only the folder you choose.",
  "Expired and revoked links stop working.",
];

const DriveItem = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="drive-card">
      <span className={`drive-card__icon drive-card__icon--${item.tone}`}>
        <Icon className="icon" aria-hidden="true" />
      </span>
      <span>
        <span className="drive-card__name">{item.name}</span>
        <span className="drive-card__meta">{item.meta}</span>
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

      <main className="landing-page">
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">
                <span className="eyebrow__dot" aria-hidden="true" />
                A small drive for your files.
              </p>
              <h1 id="hero-title">
                Upload it once. Find it when you need it.
              </h1>
              <p className="hero__lead">
                Mini Drive keeps folders, files, previews, and expiring links
                together. Ten files per upload, 5 MB each.
              </p>
              <div className="hero__actions">
                {user ? (
                  <Link className="button button--primary" to="/drive">
                    Open my drive
                  </Link>
                ) : (
                  <>
                    <Link className="button button--primary" to="/register">
                      Create my drive
                    </Link>
                    <Link className="button button--secondary" to="/login">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
              <ul className="hero__assurances" aria-label="Highlights">
                {assurances.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.label}>
                      <Icon className="icon" aria-hidden="true" />
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="hero__visual" aria-hidden="true">
              <div className="drive-window">
                <div className="drive-window__bar">
                  <span className="drive-window__dots">
                    <span />
                    <span />
                    <span />
                  </span>
                  <span className="drive-window__title">My drive</span>
                  <span className="drive-window__avatar">J</span>
                </div>

                <div className="drive-window__search">
                  <FiSearch className="icon" />
                  <span>Search in drive</span>
                  <span className="drive-window__shortcut">/</span>
                </div>

                <div className="drive-window__toolbar">
                  <span className="drive-chip drive-chip--active">
                    All files
                  </span>
                  <span className="drive-chip">Folders</span>
                  <span className="drive-chip">Recent</span>
                </div>

                <div className="drive-window__grid">
                  {driveItems.map((item) => (
                    <DriveItem key={item.name} item={item} />
                  ))}
                </div>

                <div className="share-float">
                  <span className="share-float__icon">
                    <FiLink className="icon" />
                  </span>
                  <span>
                    <strong>Share link</strong>
                    <span>Expires in 7 days</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="benefits" aria-labelledby="benefits-title">
          <div className="container">
            <h2 id="benefits-title" className="visually-hidden">
              What Mini Drive includes
            </h2>
            <ul className="benefit-list">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <li className="benefit" key={benefit.title}>
                    <span
                      className={`benefit__icon benefit__icon--${benefit.tone}`}
                    >
                      <Icon className="icon" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          className="section section--tint"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Inside the drive</p>
              <h2 id="features-title">
                Folders, search, previews, and expiring links.
              </h2>
              <p>
                Mini Drive stores files, helps you find them, and lets you
                share a folder for a limited time.
              </p>
            </div>

            <div className="feature-grid">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article className="feature-card" key={feature.title}>
                    <span
                      className={`feature-icon feature-icon--${feature.tone}`}
                    >
                      <Icon className="icon" aria-hidden="true" />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="section"
          id="how-it-works"
          aria-labelledby="how-it-works-title"
        >
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">How it works</p>
              <h2 id="how-it-works-title">
                From empty drive to first share link.
              </h2>
            </div>

            <ol className="steps">
              {steps.map((step) => (
                <li className="step" key={step.number}>
                  <span className="step__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="section section--tint"
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div className="container privacy">
            <div className="privacy__copy">
              <p className="eyebrow">Privacy</p>
              <h2 id="privacy-title">Sharing is a choice you can undo.</h2>
              <p className="privacy__lead">
                Your drive is tied to your account. Share links are read-only,
                expire on a date you choose, and can be revoked.
              </p>
              <ul className="privacy__list">
                {privacyPoints.map((point) => (
                  <li key={point}>
                    <span className="privacy__check">
                      <FiCheck className="icon" aria-hidden="true" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="privacy__visual" aria-hidden="true">
              <div className="privacy__shield">
                <FiShield className="icon" />
              </div>
              <span className="privacy__chip privacy__chip--top">
                Only you
              </span>
              <span className="privacy__chip privacy__chip--bottom">
                Expires in 7 days
              </span>
            </div>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-title">
          <div className="container cta-panel">
            <div className="cta-panel__copy">
              <p className="eyebrow">Start with an empty drive.</p>
              <h2 id="cta-title">
                Create an account and upload your first file.
              </h2>
              <p>
                Make a folder, add files, and share a link when you need to.
              </p>
            </div>
            <div className="cta-panel__actions">
              {user ? (
                <Link className="button button--primary" to="/drive">
                  Open my drive
                </Link>
              ) : (
                <>
                  <Link className="button button--primary" to="/register">
                    Create my drive
                  </Link>
                  <Link className="button button--secondary" to="/login">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </>
  );
};

export default LandingPage;
