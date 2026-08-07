import { Alert } from "@heroui/react/alert";
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { FieldError } from "@heroui/react/field-error";
import { Form } from "@heroui/react/form";
import { Input } from "@heroui/react/input";
import { Label } from "@heroui/react/label";
import { TextField } from "@heroui/react/textfield";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthError } from "~/modules/auth/application/auth-gateway";
import type {
  AuthGateway,
  AuthenticatedUser,
  RegisterCommand,
} from "~/modules/auth/application/auth-gateway";
import {
  loginCommandSchema,
  registerCommandSchema,
} from "~/modules/auth/application/auth-validation";
import { useLifecycleScope } from "~/shared/lifecycle/use-lifecycle-scope";

import { LiquidBackdrop, ShellHeader } from "./auth-shell";
import * as formStyles from "./auth-form.module.css";
import * as shellStyles from "./auth-shell.module.css";

type AuthFormValues = RegisterCommand;

interface AuthFormProps {
  readonly gateway: AuthGateway;
  readonly mode: "login" | "register";
  readonly onAuthenticated: (user: AuthenticatedUser) => void;
  readonly onModeChange: (mode: "login" | "register") => void;
}

export function AuthForm({
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
    <main className={shellStyles.shell}>
      <LiquidBackdrop />
      <ShellHeader />
      <div className={formStyles.formRegion}>
        <CredentialsCard
          error={mutation.isError ? mutation.error : undefined}
          errors={formState.errors}
          mode={mode}
          onModeChange={onModeChange}
          onSubmit={(event) => void submit(event)}
          pending={mutation.isPending}
          register={register}
        />
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
    <Card className={shellStyles.card}>
      <Card.Header className={formStyles.cardHeader}>
        <h1>{t(`auth.${props.mode}.title`)}</h1>
        <p>{t(`auth.${props.mode}.description`)}</p>
      </Card.Header>
      <Card.Content className={shellStyles.cardContent}>
        <CredentialsForm
          error={props.error}
          errors={props.errors}
          mode={props.mode}
          onSubmit={props.onSubmit}
          pending={props.pending}
          register={props.register}
        />
      </Card.Content>
      <Card.Footer className={formStyles.cardFooter}>
        <Button
          className={formStyles.modeSwitch}
          onPress={() =>
            props.onModeChange(props.mode === "login" ? "register" : "login")
          }
          type="button"
          variant="tertiary"
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
    <Form className={formStyles.form} onSubmit={props.onSubmit}>
      {props.mode === "register" && (
        <FormField
          label={t("auth.displayName")}
          error={props.errors.displayName?.message}
        >
          <Input
            autoComplete="name"
            className={formStyles.input}
            fullWidth
            {...props.register("displayName")}
          />
        </FormField>
      )}
      <FormField label={t("auth.email")} error={props.errors.email?.message}>
        <Input
          autoComplete="email"
          className={formStyles.input}
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
          className={formStyles.input}
          type="password"
          {...props.register("password")}
        />
      </FormField>
      {props.error !== undefined && (
        <Alert className={shellStyles.alert} status="danger" role="alert">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {errorMessage(props.error, t)}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <Button
        className={formStyles.primaryAction}
        fullWidth
        isDisabled={props.pending}
        type="submit"
        variant="primary"
      >
        <span>{t(`auth.${props.mode}.submit`)}</span>
        <span aria-hidden="true" className={formStyles.actionArrow}>
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
      className={formStyles.field}
      fullWidth
      isInvalid={error !== undefined}
    >
      <Label className={formStyles.fieldLabel}>{label}</Label>
      {children}
      {error !== undefined && <FieldError>{error}</FieldError>}
    </TextField>
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
