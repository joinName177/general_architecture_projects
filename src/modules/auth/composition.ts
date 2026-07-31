import { HttpAuthGateway } from "~/modules/auth/infrastructure/http-auth-gateway";
import type { AuthGateway } from "~/modules/auth/application/auth-gateway";
import type { HttpClient } from "~/shared/http/http-client";

export function createAuthGateway(httpClient: HttpClient): AuthGateway {
  return new HttpAuthGateway(httpClient);
}
