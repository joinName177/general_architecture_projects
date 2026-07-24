import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { useAuthGateway } from "@/app/providers/application-providers";
import type {
  AuthGateway,
  RegisterCommand,
} from "@/modules/auth/application/auth-gateway";
import { ApiError } from "@/shared/http/http-client";
import { LanguageSelector } from "@/shared/i18n/language-selector";

const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });
const registerSchema = loginSchema.extend({
  displayName: z.string().trim().min(1).max(80),
  password: z.string().min(12).max(128),
});
type AuthFormValues = RegisterCommand;

export function AuthRoute() {
  return <AuthScreen gateway={useAuthGateway()} />;
}

export function AuthScreen({ gateway }: { readonly gateway: AuthGateway }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const session = useQuery({
    queryFn: () => gateway.restoreSession(),
    queryKey: ["auth", "session"],
    staleTime: Number.POSITIVE_INFINITY,
  });
  const logout = useMutation({
    mutationFn: () => gateway.logout(),
    onSuccess: () => queryClient.setQueryData(["auth", "session"], null),
  });

  if (session.isPending) return <StatusCard text={t("auth.restoring")} />;
  if (session.isError) return <StatusCard text={t("auth.unavailable")} />;
  if (session.data !== null) {
    return (
      <AuthenticatedCard
        displayName={session.data.displayName}
        email={session.data.email}
        isAdmin={session.data.role === "super_admin"}
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

interface AuthFormProps {
  readonly gateway: AuthGateway;
  readonly mode: "login" | "register";
  readonly onAuthenticated: (
    user: Awaited<ReturnType<AuthGatewayMethod>>,
  ) => void;
  readonly onModeChange: (mode: "login" | "register") => void;
}
type AuthGatewayMethod = ReturnType<typeof useAuthGateway>["login"];

function AuthForm({
  gateway,
  mode,
  onAuthenticated,
  onModeChange,
}: AuthFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, setError, formState } =
    useForm<AuthFormValues>({ shouldUnregister: true });
  const mutation = useMutation({
    mutationFn: (values: AuthFormValues) =>
      mode === "login" ? gateway.login(values) : gateway.register(values),
    onSuccess: onAuthenticated,
  });

  const submit = handleSubmit(async (values) => {
    const result = (mode === "login" ? loginSchema : registerSchema).safeParse(
      values,
    );
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          field === "email" ||
          field === "password" ||
          field === "displayName"
        ) {
          setError(field, { message: t(`auth.validation.${field}`) });
        }
      }
      return;
    }
    await mutation.mutateAsync(values);
  });

  return (
    <main className="auth-shell">
      <LanguageSelector />
      <section className="auth-intro" aria-labelledby="auth-heading">
        <p className="auth-kicker">Dify Agent</p>
        <h1 id="auth-heading">{t("auth.heroTitle")}</h1>
        <p>{t("auth.heroDescription")}</p>
      </section>
      <CredentialsCard
        error={mutation.isError ? mutation.error : undefined}
        errors={formState.errors}
        mode={mode}
        onModeChange={onModeChange}
        onSubmit={(event) => void submit(event)}
        pending={mutation.isPending}
        register={register}
      />
    </main>
  );
}

interface CredentialsCardProps {
  readonly error: unknown;
  readonly errors: FieldErrors<AuthFormValues>;
  readonly mode: "login" | "register";
  readonly onModeChange: (mode: "login" | "register") => void;
  readonly onSubmit: React.FormEventHandler<HTMLFormElement>;
  readonly pending: boolean;
  readonly register: UseFormRegister<AuthFormValues>;
}

function CredentialsCard(props: CredentialsCardProps) {
  const { t } = useTranslation();
  return (
    <section className="auth-card">
      <header>
        <h2>{t(`auth.${props.mode}.title`)}</h2>
        <p>{t(`auth.${props.mode}.description`)}</p>
      </header>
      <div>
        <form className="auth-form" noValidate onSubmit={props.onSubmit}>
          {props.mode === "register" && (
            <FormField
              label={t("auth.displayName")}
              error={props.errors.displayName?.message}
            >
              <input autoComplete="name" {...props.register("displayName")} />
            </FormField>
          )}
          <FormField
            label={t("auth.email")}
            error={props.errors.email?.message}
          >
            <input
              autoComplete="email"
              inputMode="email"
              {...props.register("email")}
            />
          </FormField>
          <FormField
            label={t("auth.password")}
            error={props.errors.password?.message}
          >
            <input
              autoComplete={
                props.mode === "login" ? "current-password" : "new-password"
              }
              type="password"
              {...props.register("password")}
            />
          </FormField>
          {props.error !== undefined && (
            <p className="form-error" role="alert">
              {errorMessage(props.error, t)}
            </p>
          )}
          <button
            className="primary-button"
            disabled={props.pending}
            type="submit"
          >
            {t(`auth.${props.mode}.submit`)}
          </button>
        </form>
      </div>
      <footer>
        <button
          className="mode-switch"
          type="button"
          onClick={() =>
            props.onModeChange(props.mode === "login" ? "register" : "login")
          }
        >
          {t(`auth.${props.mode}.switch`)}
        </button>
      </footer>
    </section>
  );
}

interface FormFieldProps {
  readonly children: React.ReactNode;
  readonly error: string | undefined;
  readonly label: string;
}

function FormField({ children, error, label }: FormFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error !== undefined && <small>{error}</small>}
    </label>
  );
}

interface AuthenticatedCardProps {
  readonly displayName: string;
  readonly email: string;
  readonly isAdmin: boolean;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
}

function AuthenticatedCard(props: AuthenticatedCardProps) {
  const { t } = useTranslation();
  return (
    <main className="auth-shell auth-shell--center">
      <LanguageSelector />
      <section className="auth-card">
        <header>
          <p className="auth-kicker">
            {props.isAdmin ? t("auth.admin") : t("auth.member")}
          </p>
          <h2>{t("auth.welcome", { name: props.displayName })}</h2>
          <p>{props.email}</p>
        </header>
        <div>
          <p>
            {t(
              props.isAdmin
                ? "auth.adminDescription"
                : "auth.memberDescription",
            )}
          </p>
        </div>
        <footer>
          <button
            className="secondary-button"
            disabled={props.isLoggingOut}
            onClick={props.onLogout}
            type="button"
          >
            {t("auth.logout")}
          </button>
        </footer>
      </section>
    </main>
  );
}

function StatusCard({ text }: { readonly text: string }) {
  return (
    <main className="auth-shell auth-shell--center">
      <LanguageSelector />
      <section className="auth-card">
        <div>
          <p role="status">{text}</p>
        </div>
      </section>
    </main>
  );
}

function errorMessage(error: unknown, t: (key: string) => string): string {
  if (!(error instanceof ApiError)) return t("auth.errors.unavailable");
  const messages: Readonly<Record<string, string>> = {
    EMAIL_ALREADY_REGISTERED: t("auth.errors.emailExists"),
    INVALID_CREDENTIALS: t("auth.errors.invalidCredentials"),
    RATE_LIMITED: t("auth.errors.rateLimited"),
    VALIDATION_ERROR: t("auth.errors.validation"),
  };
  return messages[error.code] ?? t("auth.errors.unavailable");
}
