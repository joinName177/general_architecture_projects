import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { AuthGateway } from "~/modules/auth/application/auth-gateway";
import { useAuthGateway } from "~/modules/auth/presentation/auth-gateway-context";
import { useAuthSession } from "~/modules/auth/presentation/use-auth-session";
import { useLifecycleScope } from "~/shared/lifecycle/use-lifecycle-scope";

import { AuthForm } from "./auth-form";
import { StatusCard } from "./auth-shell";
import { AuthenticatedHome } from "./authenticated-home";

export function AuthRoute() {
  return <AuthScreen gateway={useAuthGateway()} />;
}

export function AuthScreen({ gateway }: { readonly gateway: AuthGateway }) {
  const queryClient = useQueryClient();
  const lifecycleScope = useLifecycleScope();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const session = useAuthSession(gateway);
  const logout = useMutation({
    mutationFn: () =>
      lifecycleScope.run((signal) => gateway.logout({ signal })),
    onSettled: () => queryClient.setQueryData(["auth", "session"], null),
  });

  if (session.isPending) {
    return <StatusCard status="loading" text={t("auth.restoring")} />;
  }
  if (session.isError) {
    return <StatusCard status="error" text={t("auth.unavailable")} />;
  }
  if (session.data !== null) {
    return (
      <AuthenticatedHome
        displayName={session.data.displayName}
        isLoggingOut={logout.isPending}
        onLogout={() => logout.mutate()}
      />
    );
  }

  return (
    <AuthForm
      gateway={gateway}
      mode={mode}
      onAuthenticated={(user) =>
        queryClient.setQueryData(["auth", "session"], user)
      }
      onModeChange={setMode}
    />
  );
}
