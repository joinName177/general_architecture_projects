import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import type { PropsWithChildren } from "react";

import "~/app/i18n/i18n";
import type { RuntimeConfig } from "~/app/bootstrap/runtime-config";
import { createAuthGateway } from "~/modules/auth/composition";
import { AuthGatewayProvider } from "~/modules/auth/presentation/auth-gateway-context";
import { ApplicationI18nProvider } from "~/shared/i18n/application-i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

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
        <AuthGatewayProvider gateway={authGateway}>
          {children}
        </AuthGatewayProvider>
      </QueryClientProvider>
    </ApplicationI18nProvider>
  );
}
