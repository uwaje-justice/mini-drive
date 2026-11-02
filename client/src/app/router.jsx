import { createBrowserRouter } from "react-router-dom";

import AppShell from "@/components/layout/app-shell.jsx";
import RootLayout from "@/components/layout/root-layout.jsx";
import GuestRoute from "@/components/routing/guest-route.jsx";
import ProtectedRoute from "@/components/routing/protected-route.jsx";
import AboutPage from "@/pages/about-page.jsx";
import LandingPage from "@/pages/landing-page.jsx";
import NotFoundPage from "@/pages/not-found-page.jsx";
import RouteErrorPage from "@/pages/route-error-page.jsx";

const lazyPage = (loadPage) => async () => {
  const { default: Component } = await loadPage();

  return { Component };
};

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "about", element: <AboutPage /> },
      {
        path: "login",
        element: <GuestRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(() => import("@/pages/login-page.jsx")),
          },
        ],
      },
      {
        path: "register",
        element: <GuestRoute />,
        children: [
          {
            index: true,
            lazy: lazyPage(() => import("@/pages/register-page.jsx")),
          },
        ],
      },
      {
        path: "share/:token",
        lazy: lazyPage(() => import("@/pages/public-share-page.jsx")),
      },
      {
        path: "share/:token/folders/:folderId",
        lazy: lazyPage(() => import("@/pages/public-share-page.jsx")),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "drive",
            element: <AppShell />,
            children: [
              {
                index: true,
                lazy: lazyPage(() => import("@/pages/drive-page.jsx")),
              },
              {
                path: "activity",
                lazy: lazyPage(() => import("@/pages/activity-page.jsx")),
              },
              {
                path: "files",
                lazy: lazyPage(() => import("@/pages/files-page.jsx")),
              },
              {
                path: "files/:fileId",
                lazy: lazyPage(() => import("@/pages/file-page.jsx")),
              },
              {
                path: "folders",
                lazy: lazyPage(() => import("@/pages/folders-page.jsx")),
              },
              {
                path: "folders/:folderId",
                lazy: lazyPage(() => import("@/pages/folder-page.jsx")),
              },
              {
                path: "categories/:categoryId",
                lazy: lazyPage(() => import("@/pages/category-page.jsx")),
              },
              {
                path: "search",
                lazy: lazyPage(() => import("@/pages/search-page.jsx")),
              },
              {
                path: "settings",
                lazy: lazyPage(() => import("@/pages/settings-page.jsx")),
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
