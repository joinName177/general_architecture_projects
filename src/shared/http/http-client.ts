import type { z } from "zod";

export class HttpResponseError extends Error {
  public constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`HTTP request failed with status ${status}.`);
    this.name = "HttpResponseError";
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
      throw new HttpResponseError(
        response.status,
        await readResponseBody(response),
      );
    }

    if (response.status === 204) return schema.parse(undefined);
    return schema.parse(await response.json());
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
