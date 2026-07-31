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
  {
    id: "chat",
    routeId: "chat",
    path: "/chat",
    lazy: async () => {
      const { ChatRoute } =
        await import("~/modules/chat/presentation/chat-route");
      return { Component: ChatRoute };
    },
  },
];
