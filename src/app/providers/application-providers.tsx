import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";

import "@/app/i18n/i18n";
import type { RuntimeConfig } from "@/app/bootstrap/runtime-config";
import type { AuthGateway } from "@/modules/auth/application/auth-gateway";
import { createAuthGateway } from "@/modules/auth/composition";
import { ApplicationI18nProvider } from "@/shared/i18n/application-i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AuthGatewayContext = createContext<AuthGateway | undefined>(undefined);

interface ApplicationProvidersProps extends PropsWithChildren {
  readonly runtimeConfig: RuntimeConfig;
}

export function ApplicationProviders({
  children,
  runtimeConfig,
}: ApplicationProvidersProps) {
  const authGateway = useMemo(
    () => createAuthGateway(runtimeConfig.apiBaseUrl),
    [runtimeConfig.apiBaseUrl],
  );

  return (
    <ApplicationI18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGatewayContext value={authGateway}>{children}</AuthGatewayContext>
      </QueryClientProvider>
    </ApplicationI18nProvider>
  );
}

export function useAuthGateway(): AuthGateway {
  const authGateway = useContext(AuthGatewayContext);

  if (authGateway === undefined) {
    throw new Error("Auth gateway is unavailable.");
  }

  return authGateway;
}
