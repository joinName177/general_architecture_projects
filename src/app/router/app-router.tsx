import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
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
      <Card className={styles.card}>
        <Card.Content className={styles.cardContent}>
          <div className={styles.statusContent} role="status">
            <Spinner aria-hidden="true" size="sm" />
            <span>{t("auth.loading")}</span>
          </div>
        </Card.Content>
      </Card>
    </main>
  );
}
