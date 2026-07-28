import type { z } from "zod";

interface ApiSuccessResponse<T> {
  readonly data: T;
}

interface HttpRequestOptions {
  readonly body?: unknown;
  readonly headers?: HeadersInit;
  readonly signal?: AbortSignal;
}

type HttpReadOptions = Omit<HttpRequestOptions, "body">;
type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

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

  public delete<T>(
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return this.request("DELETE", path, schema, options);
  }

  public get<T>(
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpReadOptions = {},
  ): Promise<T> {
    return this.request("GET", path, schema, options);
  }

  public patch<T>(
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return this.request("PATCH", path, schema, options);
  }

  public post<T>(
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return this.request("POST", path, schema, options);
  }

  public put<T>(
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    return this.request("PUT", path, schema, options);
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    schema: z.ZodType<ApiSuccessResponse<T>>,
    options: HttpRequestOptions,
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (options.body !== undefined)
      headers.set("Content-Type", "application/json");
    if (this.accessToken !== undefined) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
      credentials: "include",
      headers,
      method,
      signal: options.signal ?? AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new HttpResponseError(
        response.status,
        await readResponseBody(response),
      );
    }

    return schema.parse(await response.json()).data;
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}
