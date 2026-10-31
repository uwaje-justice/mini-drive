const assurances = ["Private by default", "Up to 10 files at once", "5 MB per file"];

const files = [
  { name: "Projects", meta: "4 items", tone: "yellow" },
  { name: "Receipts", meta: "12 items", tone: "blue" },
  { name: "Notes.txt", meta: "2.4 KB", tone: "red" },
  { name: "Team photo.jpg", meta: "1.8 MB", tone: "green" },
];

const BrandMark = () => (
  <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true">
    <rect width="32" height="32" rx="9" fill="#1558d6" />
    <path
      d="M8 23V11.5L16 19l8-7.5V23"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="24.5" cy="7.5" r="2" fill="#fbbc04" />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.3 2.3 4.7-5" />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

const FileCard = ({ file }) => (
  <div className="drive-card">
    <span className={`drive-card__icon drive-card__icon--${file.tone}`}>
      <DocumentIcon />
    </span>
    <span>
      <span className="drive-card__name">{file.name}</span>
      <span className="drive-card__meta">{file.meta}</span>
    </span>
  </div>
);

const LandingPage = () => (
  <>
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="/">
          <BrandMark />
          File Uploader
        </a>
        <div className="site-actions">
          <a className="button button--secondary button--small" href="/api/health">
            API health
          </a>
        </div>
      </div>
    </header>

    <main className="landing-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              React client scaffold
            </p>
            <h1 id="hero-title">Your files, in one calm place.</h1>
            <p className="hero__lead">
              The REST API is ready. Sign-in, folders, uploads, previews, and
              share links will be built from this React workspace.
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="/api/health">
                Check API health
              </a>
              <a className="button button--secondary" href="/api/auth/session">
                Session status
              </a>
            </div>
            <ul className="hero__assurances" aria-label="Highlights">
              {assurances.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
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
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>
                <span>Search in drive</span>
                <span className="drive-window__shortcut">/</span>
              </div>

              <div className="drive-window__toolbar">
                <span className="drive-chip drive-chip--active">All files</span>
                <span className="drive-chip">Folders</span>
                <span className="drive-chip">Recent</span>
              </div>

              <div className="drive-window__grid">
                {files.map((file) => (
                  <FileCard key={file.name} file={file} />
                ))}
              </div>

              <div className="share-float">
                <span className="share-float__icon">
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7L11.5 6.3" />
                    <path d="M14 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.3-1.3" />
                  </svg>
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
    </main>

    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__note">File Uploader API and React client.</p>
        <nav className="site-footer__nav" aria-label="API status">
          <a href="/api/health">Health</a>
          <a href="/api/auth/session">Session</a>
        </nav>
      </div>
    </footer>
  </>
);

export default LandingPage;
