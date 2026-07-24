import { HttpAuthGateway } from "~/modules/auth/infrastructure/http-auth-gateway";
import type { AuthGateway } from "~/modules/auth/application/auth-gateway";
import { HttpClient } from "~/shared/http/http-client";

export function createAuthGateway(apiBaseUrl: string): AuthGateway {
  return new HttpAuthGateway(new HttpClient(apiBaseUrl));
}
