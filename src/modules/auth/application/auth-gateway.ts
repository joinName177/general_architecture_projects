import type { UserResponse } from "@/generated/dify-agent-api/types.gen";

export interface LoginCommand {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCommand extends LoginCommand {
  readonly displayName: string;
}

export interface AuthGateway {
  login(command: LoginCommand): Promise<UserResponse>;
  logout(): Promise<void>;
  register(command: RegisterCommand): Promise<UserResponse>;
  restoreSession(): Promise<UserResponse | null>;
}
