import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

import type { AuthGateway } from "~/modules/auth/application/auth-gateway";

const AuthGatewayContext = createContext<AuthGateway | undefined>(undefined);

interface AuthGatewayProviderProps extends PropsWithChildren {
  readonly gateway: AuthGateway;
}

export function AuthGatewayProvider({
  children,
  gateway,
}: AuthGatewayProviderProps) {
  return <AuthGatewayContext value={gateway}>{children}</AuthGatewayContext>;
}

export function useAuthGateway(): AuthGateway {
  const authGateway = useContext(AuthGatewayContext);

  if (authGateway === undefined) {
    throw new Error("Auth gateway is unavailable.");
  }

  return authGateway;
}
