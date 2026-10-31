import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="error-page">
    <section className="error-panel">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="error-panel__message">
        The page you asked for does not exist.
      </p>
      <Link className="button button--primary" to="/">
        Back to home
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
