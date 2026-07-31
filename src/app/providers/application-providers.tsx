import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import type { PropsWithChildren } from "react";

import "~/app/i18n/i18n";
import type { RuntimeConfig } from "~/app/bootstrap/runtime-config";
import { createAuthGateway } from "~/modules/auth/composition";
import { AuthGatewayProvider } from "~/modules/auth/presentation/auth-gateway-context";
import { createChatGateway } from "~/modules/chat/composition";
import { ChatGatewayContext } from "~/modules/chat/presentation/chat-gateway-context";
import { ApplicationI18nProvider } from "~/shared/i18n/application-i18n";
import { HttpClient } from "~/shared/http/http-client";

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
  const httpClient = useMemo(
    () => new HttpClient(runtimeConfig.apiBaseUrl),
    [runtimeConfig.apiBaseUrl],
  );
  const authGateway = useMemo(
    () => createAuthGateway(httpClient),
    [httpClient],
  );
  const chatGateway = useMemo(
    () => createChatGateway(httpClient),
    [httpClient],
  );

  return (
    <ApplicationI18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGatewayProvider gateway={authGateway}>
          <ChatGatewayContext.Provider value={chatGateway}>
            {children}
          </ChatGatewayContext.Provider>
        </AuthGatewayProvider>
      </QueryClientProvider>
    </ApplicationI18nProvider>
  );
}
