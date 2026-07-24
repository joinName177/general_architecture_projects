import { RouterProvider, createBrowserRouter } from "react-router";

import { ArchitectureStartPage } from "@/app/router/architecture-start-page";

const router = createBrowserRouter([
  {
    path: "/",
    Component: ArchitectureStartPage,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
