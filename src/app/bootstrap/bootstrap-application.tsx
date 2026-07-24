import { ApplicationProviders } from "@/app/providers/application-providers";
import { AppRouter } from "@/app/router/app-router";
import type { RuntimeConfig } from "@/app/bootstrap/runtime-config";

interface BootstrapApplicationProps {
  readonly runtimeConfig: RuntimeConfig;
}

export function BootstrapApplication({
  runtimeConfig,
}: BootstrapApplicationProps) {
  return (
    <ApplicationProviders runtimeConfig={runtimeConfig}>
      <AppRouter />
    </ApplicationProviders>
  );
}
