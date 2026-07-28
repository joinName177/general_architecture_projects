import type {
  AuthGateway,
  AuthenticatedUser,
  LoginCommand,
  RegisterCommand,
} from "~/modules/auth/application/auth-gateway";
import { AuthError } from "~/modules/auth/application/auth-gateway";
import type { AuthOperationOptions } from "~/modules/auth/application/auth-gateway";
import type { AuthSessionData } from "~/generated/dify-agent-api/types.gen";
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
      await this.httpClient.post("/auth/logout", zLogoutUserResponse, {
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
      const response = await this.httpClient.post(
        "/auth/refresh",
        zAuthResponse,
        {
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
      const request = {
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(requestSchema === undefined || command === undefined
          ? {}
          : { body: requestSchema.parse(command) }),
      };
      const response = await this.httpClient.post(path, zAuthResponse, request);
      this.httpClient.setAccessToken(response.accessToken);
      return mapAuthenticatedUser(response);
    } catch (error) {
      throw mapAuthError(error);
    }
  }
}

function mapAuthenticatedUser(response: AuthSessionData): AuthenticatedUser {
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
  if (!parsedError.success || parsedError.data.code !== error.status) {
    return new AuthError("UNAVAILABLE");
  }
  return new AuthError(mapAuthErrorCode(parsedError.data.errorCode));
}

function mapAuthErrorCode(code: string | undefined): AuthError["code"] {
  switch (code) {
    case "EMAIL_ALREADY_REGISTERED":
    case "INVALID_CREDENTIALS":
    case "RATE_LIMITED":
    case "VALIDATION_ERROR":
      return code;
    case "UNAUTHENTICATED":
      return "INVALID_CREDENTIALS";
    default:
      return "UNAVAILABLE";
  }
}
