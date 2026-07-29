import { Alert } from "@heroui/react/alert";
import { Card } from "@heroui/react/card";
import { FieldError } from "@heroui/react/field-error";
import { Form } from "@heroui/react/form";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { Spinner } from "@heroui/react/spinner";
import { TextField } from "@heroui/react/textfield";
import { buttonVariants } from "@heroui/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "react-aria-components/Button";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthError } from "~/modules/auth/application/auth-gateway";
import type {
  AuthGateway,
  RegisterCommand,
} from "~/modules/auth/application/auth-gateway";
import {
  loginCommandSchema,
  registerCommandSchema,
} from "~/modules/auth/application/auth-validation";
import { useAuthGateway } from "~/modules/auth/presentation/auth-gateway-context";
import { LanguageSelector } from "~/shared/i18n/language-selector";
import { useLifecycleScope } from "~/shared/lifecycle/use-lifecycle-scope";

import { AuthenticatedHome } from "./authenticated-home";
import * as styles from "./auth-route.module.css";

type AuthFormValues = RegisterCommand;
const primaryButtonClassName = `${buttonVariants({
  fullWidth: true,
  variant: "primary",
})} ${styles.primaryAction}`;
const modeSwitchButtonClassName = `${buttonVariants({ variant: "tertiary" })} ${styles.modeSwitch}`;

export function AuthRoute() {
  return <AuthScreen gateway={useAuthGateway()} />;
}

export function AuthScreen({ gateway }: { readonly gateway: AuthGateway }) {
  const queryClient = useQueryClient();
  const lifecycleScope = useLifecycleScope();
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const session = useQuery({
    queryFn: ({ signal }) => gateway.restoreSession({ signal }),
    queryKey: ["auth", "session"],
    staleTime: Number.POSITIVE_INFINITY,
  });
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
  const lifecycleScope = useLifecycleScope();
  const { register, handleSubmit, setError, formState } =
    useForm<AuthFormValues>({ shouldUnregister: true });
  const mutation = useMutation({
    mutationFn: (values: AuthFormValues) =>
      lifecycleScope.run((signal) =>
        mode === "login"
          ? gateway.login(values, { signal })
          : gateway.register(values, { signal }),
      ),
    onSuccess: onAuthenticated,
  });

  const submit = handleSubmit((values) => {
    const result = (
      mode === "login" ? loginCommandSchema : registerCommandSchema
    ).safeParse(values);
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
    mutation.mutate(values);
  });

  return (
    <main className={styles.shell}>
      <LiquidBackdrop />
      <header className={styles.topbar}>
        <Brand />
        <LanguageSelector placement="inline" />
      </header>
      <section className={styles.intro} aria-labelledby="auth-heading">
        <p className={styles.kicker}>{t("auth.brandTagline")}</p>
        <h1 className={styles.heading} id="auth-heading">
          {t("auth.heroTitle")}
        </h1>
        <p className={styles.description}>{t("auth.heroDescription")}</p>
        <ul className={styles.highlights}>
          {(["private", "focused", "ready"] as const).map((highlight) => (
            <li key={highlight}>
              <span aria-hidden="true" className={styles.highlightMark} />
              {t(`auth.highlights.${highlight}`)}
            </li>
          ))}
        </ul>
      </section>
      <div className={styles.formRegion}>
        <CredentialsCard
          error={mutation.isError ? mutation.error : undefined}
          errors={formState.errors}
          mode={mode}
          onModeChange={onModeChange}
          onSubmit={(event) => void submit(event)}
          pending={mutation.isPending}
          register={register}
        />
        <p className={styles.privacyNote}>{t("auth.privacyNote")}</p>
      </div>
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
    <Card className={styles.card}>
      <div aria-hidden="true" className={styles.cardSheen} />
      <Card.Header className={styles.cardHeader}>
        <p className={styles.cardEyebrow}>{t("auth.accessLabel")}</p>
        <h2>{t(`auth.${props.mode}.title`)}</h2>
        <p>{t(`auth.${props.mode}.description`)}</p>
      </Card.Header>
      <Card.Content className={styles.cardContent}>
        <CredentialsForm
          error={props.error}
          errors={props.errors}
          mode={props.mode}
          onSubmit={props.onSubmit}
          pending={props.pending}
          register={props.register}
        />
      </Card.Content>
      <Card.Footer className={styles.cardFooter}>
        <Button
          className={modeSwitchButtonClassName}
          onClick={() =>
            props.onModeChange(props.mode === "login" ? "register" : "login")
          }
          type="button"
        >
          {t(`auth.${props.mode}.switch`)}
        </Button>
      </Card.Footer>
    </Card>
  );
}

type CredentialsFormProps = Omit<CredentialsCardProps, "onModeChange">;

function CredentialsForm(props: CredentialsFormProps) {
  const { t } = useTranslation();
  return (
    <Form className={styles.form} onSubmit={props.onSubmit}>
      {props.mode === "register" && (
        <FormField
          label={t("auth.displayName")}
          error={props.errors.displayName?.message}
        >
          <Input
            autoComplete="name"
            className={styles.input}
            fullWidth
            {...props.register("displayName")}
          />
        </FormField>
      )}
      <FormField label={t("auth.email")} error={props.errors.email?.message}>
        <Input
          autoComplete="email"
          className={styles.input}
          fullWidth
          inputMode="email"
          {...props.register("email")}
        />
      </FormField>
      <FormField
        label={t("auth.password")}
        error={props.errors.password?.message}
      >
        <Input
          autoComplete={
            props.mode === "login" ? "current-password" : "new-password"
          }
          fullWidth
          className={styles.input}
          type="password"
          {...props.register("password")}
        />
      </FormField>
      {props.error !== undefined && (
        <Alert className={styles.alert} status="danger" role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {errorMessage(props.error, t)}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button
        className={primaryButtonClassName}
        isDisabled={props.pending}
        type="submit"
      >
        <span>{t(`auth.${props.mode}.submit`)}</span>
        <span aria-hidden="true" className={styles.actionArrow}>
          →
        </span>
      </Button>
    </Form>
  );
}

interface FormFieldProps {
  readonly children: React.ReactNode;
  readonly error: string | undefined;
  readonly label: string;
}

function FormField({ children, error, label }: FormFieldProps) {
  return (
    <TextField
      className={styles.field}
      fullWidth
      isInvalid={error !== undefined}
    >
      <Label className={styles.fieldLabel}>{label}</Label>
      {children}
      {error !== undefined && <FieldError>{error}</FieldError>}
    </TextField>
  );
}

function StatusCard({
  status,
  text,
}: {
  readonly status: "error" | "loading";
  readonly text: string;
}) {
  return (
    <main className={`${styles.shell} ${styles.shellCentered}`}>
      <LiquidBackdrop />
      <header className={styles.topbar}>
        <Brand />
        <LanguageSelector placement="inline" />
      </header>
      <div className={styles.statusRegion}>
        <Card className={styles.card}>
          <Card.Content className={styles.cardContent}>
            {status === "loading" ? (
              <div className={styles.statusContent} role="status">
                <Spinner aria-hidden="true" size="sm" />
                <span>{text}</span>
              </div>
            ) : (
              <Alert className={styles.alert} status="danger" role="alert">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{text}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}

function Brand() {
  const { t } = useTranslation();
  return (
    <div className={styles.brand}>
      <span aria-hidden="true" className={styles.brandMark}>
        <span className={styles.brandCore} />
      </span>
      <span className={styles.brandCopy}>
        <strong>{t("auth.brand")}</strong>
        <small>{t("auth.brandTagline")}</small>
      </span>
    </div>
  );
}

function LiquidBackdrop() {
  return (
    <div aria-hidden="true" className={styles.liquidBackdrop}>
      <span className={styles.liquidOrbPrimary} />
      <span className={styles.liquidOrbSecondary} />
      <span className={styles.liquidLens} />
    </div>
  );
}

function errorMessage(error: unknown, t: (key: string) => string): string {
  if (!(error instanceof AuthError)) return t("auth.errors.unavailable");
  const messages: Readonly<Record<AuthError["code"], string>> = {
    EMAIL_ALREADY_REGISTERED: t("auth.errors.emailExists"),
    INVALID_CREDENTIALS: t("auth.errors.invalidCredentials"),
    RATE_LIMITED: t("auth.errors.rateLimited"),
    UNAVAILABLE: t("auth.errors.unavailable"),
    VALIDATION_ERROR: t("auth.errors.validation"),
  };
  return messages[error.code];
}
