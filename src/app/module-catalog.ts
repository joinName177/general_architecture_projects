import type { ComponentType } from "react";

export interface ModuleDefinition {
  readonly id: string;
  readonly routeId: string;
  readonly path: string;
  readonly lazy: () => Promise<{ Component: ComponentType }>;
}

export const moduleCatalog: readonly ModuleDefinition[] = [
  {
    id: "auth",
    routeId: "auth.root",
    path: "*",
    lazy: async () => {
      const { AuthRoute } =
        await import("~/modules/auth/presentation/auth-route");
      return { Component: AuthRoute };
    },
  },
];
