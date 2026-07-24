import type {
  AuthGateway,
  LoginCommand,
  RegisterCommand,
} from "@/modules/auth/application/auth-gateway";
import type {
  AuthResponse,
  UserResponse,
} from "@/generated/dify-agent-api/types.gen";
import {
  zAuthResponse,
  zLogoutUserResponse,
} from "@/generated/dify-agent-api/zod.gen";
import { ApiError } from "@/shared/http/http-client";
import type { HttpClient } from "@/shared/http/http-client";

export class HttpAuthGateway implements AuthGateway {
  public constructor(private readonly httpClient: HttpClient) {}

  public async login(command: LoginCommand): Promise<UserResponse> {
    return this.authenticate("/auth/login", command);
  }

  public async logout(): Promise<void> {
    try {
      await this.httpClient.request("/auth/logout", zLogoutUserResponse, {
        method: "POST",
      });
    } finally {
      this.httpClient.clearAccessToken();
    }
  }

  public async register(command: RegisterCommand): Promise<UserResponse> {
    return this.authenticate("/auth/register", command);
  }

  public async restoreSession(): Promise<UserResponse | null> {
    try {
      return await this.authenticate("/auth/refresh");
    } catch (error) {
      this.httpClient.clearAccessToken();
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  }

  private async authenticate(
    path: string,
    command?: LoginCommand | RegisterCommand,
  ): Promise<UserResponse> {
    const request: RequestInit = { method: "POST" };
    if (command !== undefined) request.body = JSON.stringify(command);
    const response = await this.httpClient.request<AuthResponse>(
      path,
      zAuthResponse,
      request,
    );
    this.httpClient.setAccessToken(response.accessToken);
    return response.user;
  }
}
