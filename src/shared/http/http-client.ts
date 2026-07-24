import type { z } from "zod";

import { zErrorResponse } from "@/generated/dify-agent-api/zod.gen";

export class ApiError extends Error {
  public constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

export class HttpClient {
  private accessToken: string | undefined;

  public constructor(private readonly baseUrl: string) {}

  public clearAccessToken(): void {
    this.accessToken = undefined;
  }

  public setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  public async request<T>(
    path: string,
    schema: z.ZodType<T>,
    init: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body !== undefined)
      headers.set("Content-Type", "application/json");
    if (this.accessToken !== undefined) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers,
      signal: init.signal ?? AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const parsed = zErrorResponse.safeParse(await response.json());
      throw new ApiError(
        parsed.success ? parsed.data.code : "UNEXPECTED_RESPONSE",
        response.status,
      );
    }

    if (response.status === 204) return schema.parse(undefined);
    return schema.parse(await response.json());
  }
}
