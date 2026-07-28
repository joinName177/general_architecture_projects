import { RouterProvider, createBrowserRouter } from "react-router";
import { useTranslation } from "react-i18next";

import { moduleCatalog } from "~/app/module-catalog";

import * as styles from "./app-router.module.css";

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
    <main className={styles.shell}>
      <section className={`${styles.card} ${styles.cardContent}`}>
        <div className={styles.statusContent} role="status">
          <span>{t("auth.loading")}</span>
        </div>
      </section>
    </main>
  );
}
