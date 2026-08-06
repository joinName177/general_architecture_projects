import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import type { AuthGateway } from "~/modules/auth/application/auth-gateway";
import { AuthGatewayContext } from "~/modules/auth/presentation/auth-gateway-context";

/**
 * 共享的会话恢复查询：auth 与 chat 路由统一从这里读取当前会话，
 * 共享同一个 queryKey 以复用 react-query 缓存。
 *
 * 显式传入的 gateway 优先；未传入时退回 AuthGatewayProvider 提供的实例。
 */
export function useAuthSession(gateway?: AuthGateway) {
  const contextGateway = useContext(AuthGatewayContext);
  const authGateway = gateway ?? contextGateway;

  if (authGateway === undefined) {
    throw new Error("Auth gateway is unavailable.");
  }

  return useQuery({
    queryFn: ({ signal }) => authGateway.restoreSession({ signal }),
    queryKey: ["auth", "session"],
    staleTime: Number.POSITIVE_INFINITY,
  });
}
