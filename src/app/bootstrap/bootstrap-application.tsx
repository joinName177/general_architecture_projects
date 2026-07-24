import { ApplicationProviders } from "@/app/providers/application-providers";
import { AppRouter } from "@/app/router/app-router";

export function BootstrapApplication() {
  return (
    <ApplicationProviders>
      <AppRouter />
    </ApplicationProviders>
  );
}
