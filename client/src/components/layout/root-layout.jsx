import { Outlet, ScrollRestoration } from "react-router-dom";

import ScrollToHash from "@/components/routing/scroll-to-hash.jsx";

const RootLayout = () => (
  <>
    <ScrollRestoration />
    <ScrollToHash />
    <Outlet />
  </>
);

export default RootLayout;
