import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <main className="error-page">
    <section className="error-panel">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="error-panel__message">
        That page does not exist. Check the URL and try again.
      </p>
      <Link className="button button--primary" to="/">
        Back to home
      </Link>
    </section>
  </main>
);

export default NotFoundPage;
