import type {
  AuthGateway,
  AuthenticatedUser,
  LoginCommand,
  RegisterCommand,
} from "~/modules/auth/application/auth-gateway";
import { AuthError } from "~/modules/auth/application/auth-gateway";
import type { AuthOperationOptions } from "~/modules/auth/application/auth-gateway";
import type { AuthResponse } from "~/generated/dify-agent-api/types.gen";
import {
  zAuthResponse,
  zErrorResponse,
  zLoginUserBody,
  zLogoutUserResponse,
  zRegisterUserBody,
} from "~/generated/dify-agent-api/zod.gen";
import { HttpResponseError } from "~/shared/http/http-client";
import type { HttpClient } from "~/shared/http/http-client";
import type { z } from "zod";

export class HttpAuthGateway implements AuthGateway {
  public constructor(private readonly httpClient: HttpClient) {}

  public async login(
    command: LoginCommand,
    options: AuthOperationOptions = {},
  ): Promise<AuthenticatedUser> {
    return this.authenticate("/auth/login", zLoginUserBody, command, options);
  }

  public async logout(options: AuthOperationOptions = {}): Promise<void> {
    try {
      await this.httpClient.request("/auth/logout", zLogoutUserResponse, {
        method: "POST",
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      });
    } catch (error) {
      throw mapAuthError(error);
    } finally {
      this.httpClient.clearAccessToken();
    }
  }

  public async register(
    command: RegisterCommand,
    options: AuthOperationOptions = {},
  ): Promise<AuthenticatedUser> {
    return this.authenticate(
      "/auth/register",
      zRegisterUserBody,
      command,
      options,
    );
  }

  public async restoreSession(
    options: AuthOperationOptions = {},
  ): Promise<AuthenticatedUser | null> {
    try {
      const response = await this.httpClient.request<AuthResponse>(
        "/auth/refresh",
        zAuthResponse,
        {
          method: "POST",
          ...(options.signal === undefined ? {} : { signal: options.signal }),
        },
      );
      this.httpClient.setAccessToken(response.accessToken);
      return mapAuthenticatedUser(response);
    } catch (error) {
      this.httpClient.clearAccessToken();
      if (error instanceof HttpResponseError && error.status === 401)
        return null;
      throw mapAuthError(error);
    }
  }

  private async authenticate(
    path: string,
    requestSchema:
      z.ZodType<LoginCommand> | z.ZodType<RegisterCommand> | undefined,
    command: LoginCommand | RegisterCommand | undefined,
    options: AuthOperationOptions,
  ): Promise<AuthenticatedUser> {
    try {
      const request: RequestInit = {
        method: "POST",
        ...(options.signal === undefined ? {} : { signal: options.signal }),
      };
      if (requestSchema !== undefined && command !== undefined) {
        request.body = JSON.stringify(requestSchema.parse(command));
      }
      const response = await this.httpClient.request<AuthResponse>(
        path,
        zAuthResponse,
        request,
      );
      this.httpClient.setAccessToken(response.accessToken);
      return mapAuthenticatedUser(response);
    } catch (error) {
      throw mapAuthError(error);
    }
  }
}

function mapAuthenticatedUser(response: AuthResponse): AuthenticatedUser {
  return {
    createdAt: response.user.createdAt,
    displayName: response.user.displayName,
    email: response.user.email,
    id: response.user.id,
    role: response.user.role,
  };
}

function mapAuthError(error: unknown): Error {
  if (error instanceof AuthError || error instanceof DOMException) return error;
  if (!(error instanceof HttpResponseError)) {
    return new AuthError("UNAVAILABLE");
  }

  const parsedError = zErrorResponse.safeParse(error.body);
  const code = parsedError.success ? parsedError.data.code : undefined;
  return new AuthError(isKnownAuthErrorCode(code) ? code : "UNAVAILABLE");
}

function isKnownAuthErrorCode(
  code: string | undefined,
): code is
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR" {
  return (
    code === "EMAIL_ALREADY_REGISTERED" ||
    code === "INVALID_CREDENTIALS" ||
    code === "RATE_LIMITED" ||
    code === "VALIDATION_ERROR"
  );
}
