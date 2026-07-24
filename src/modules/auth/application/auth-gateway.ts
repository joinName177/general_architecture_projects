export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCommand extends LoginCommand {
  readonly displayName: string;
}

export interface AuthenticatedUser {
  readonly createdAt: string;
  readonly displayName: string;
  readonly email: string;
  readonly id: string;
  readonly role: "super_admin" | "user";
}

export type AuthErrorCode =
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "UNAVAILABLE";

export class AuthError extends Error {
  public constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
  }
}

export interface AuthOperationOptions {
  readonly signal?: AbortSignal;
}

export interface AuthGateway {
  login(
    command: LoginCommand,
    options?: AuthOperationOptions,
  ): Promise<AuthenticatedUser>;
  logout(options?: AuthOperationOptions): Promise<void>;
  register(
    command: RegisterCommand,
    options?: AuthOperationOptions,
  ): Promise<AuthenticatedUser>;
  restoreSession(
    options?: AuthOperationOptions,
  ): Promise<AuthenticatedUser | null>;
}
