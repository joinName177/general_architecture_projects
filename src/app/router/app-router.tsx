import { RouterProvider, createBrowserRouter } from "react-router";
import { useTranslation } from "react-i18next";

import { moduleCatalog } from "@/app/module-catalog";

const router = createBrowserRouter(
  moduleCatalog.map(({ path, routeId, lazy }) => ({
    HydrateFallback: RouteLoading,
    id: routeId,
    lazy,
    path,
  })),
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

function RouteLoading() {
  const { t } = useTranslation();
  return (
    <main className="auth-shell auth-shell--center">
      <section className="auth-card">
        <div>
          <p role="status">{t("auth.loading")}</p>
        </div>
      </section>
    </main>
  );
}
