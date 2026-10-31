import { Route, Routes } from "react-router-dom";

import LandingPage from "./pages/landing-page.jsx";
import NotFoundPage from "./pages/not-found-page.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
