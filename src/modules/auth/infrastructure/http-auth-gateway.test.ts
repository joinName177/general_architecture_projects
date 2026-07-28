import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthError } from "~/modules/auth/application/auth-gateway";
import { HttpAuthGateway } from "~/modules/auth/infrastructure/http-auth-gateway";
import { HttpClient } from "~/shared/http/http-client";

const authResponse = {
  accessToken: "a".repeat(40),
  expiresAt: "2026-07-24T12:00:00Z",
  user: {
    createdAt: "2026-07-24T11:00:00Z",
    displayName: "管理员",
    email: "admin@example.test",
    id: "d9428888-122b-11e1-b85c-61cd3cbb3210",
    role: "super_admin" as const,
  },
};
const authEnvelope = {
  code: 200,
  data: authResponse,
  message: "Authentication succeeded.",
  requestId: "request-1",
} as const;

afterEach(() => vi.unstubAllGlobals());

describe("HttpAuthGateway", () => {
  it("logs in, keeps the access token in memory and sends cookies", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(authEnvelope))
      .mockResolvedValueOnce(
        Response.json({
          code: 200,
          data: { revoked: true },
          message: "Session revoked.",
          requestId: "request-2",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(
      gateway.login({ email: "admin@example.test", password: "secret" }),
    ).resolves.toEqual(authResponse.user);
    await gateway.logout();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const logoutRequest = fetchMock.mock.calls[1];
    const logoutHeaders = new Headers(logoutRequest?.[1]?.headers);
    expect(logoutRequest?.[0]).toBe(
      "https://api.example.test/api/v1/auth/logout",
    );
    expect(logoutRequest?.[1]?.credentials).toBe("include");
    expect(logoutHeaders.get("Authorization")).toBe(
      `Bearer ${authResponse.accessToken}`,
    );
  });

  it("maps an expired refresh cookie to an anonymous session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            code: 401,
            errorCode: "INVALID_SESSION",
            message: "Authentication required.",
            requestId: "request-1",
          },
          { status: 401 },
        ),
      ),
    );
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(gateway.restoreSession()).resolves.toBeNull();
  });
});

describe("HttpAuthGateway error mapping", () => {
  it("preserves stable server error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            code: 409,
            errorCode: "EMAIL_ALREADY_REGISTERED",
            message: "Conflict.",
            requestId: "request-2",
          },
          { status: 409 },
        ),
      ),
    );
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(
      gateway.register({
        displayName: "New User",
        email: "new@example.test",
        password: "a-secure-password",
      }),
    ).rejects.toEqual(new AuthError("EMAIL_ALREADY_REGISTERED"));
  });

  it("maps malformed remote errors to a safe application error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response("<html>upstream failure</html>", { status: 502 }),
        ),
    );
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(
      gateway.login({
        email: "admin@example.test",
        password: "local-admin-password",
      }),
    ).rejects.toEqual(new AuthError("UNAVAILABLE"));
  });
});

describe("HttpAuthGateway error protocol", () => {
  it("maps unauthenticated codes to the safe credentials prompt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            code: 401,
            errorCode: "UNAUTHENTICATED",
            message: "Authentication failed.",
            requestId: "request-3",
          },
          { status: 401 },
        ),
      ),
    );
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(
      gateway.login({
        email: "admin@example.test",
        password: "local-admin-password",
      }),
    ).rejects.toEqual(new AuthError("INVALID_CREDENTIALS"));
  });

  it("rejects an error envelope whose code differs from the HTTP status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            code: 500,
            errorCode: "INVALID_CREDENTIALS",
            message: "Authentication failed.",
            requestId: "request-4",
          },
          { status: 401 },
        ),
      ),
    );
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await expect(
      gateway.login({
        email: "admin@example.test",
        password: "local-admin-password",
      }),
    ).rejects.toEqual(new AuthError("UNAVAILABLE"));
  });
});

describe("HttpAuthGateway lifecycle", () => {
  it("clears the access token even when remote logout fails", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(authEnvelope))
      .mockResolvedValueOnce(
        Response.json(
          {
            code: 503,
            errorCode: "UNAVAILABLE",
            message: "Unavailable.",
            requestId: "request-3",
          },
          { status: 503 },
        ),
      )
      .mockResolvedValueOnce(
        Response.json(
          {
            code: 401,
            errorCode: "INVALID_SESSION",
            message: "Authentication required.",
            requestId: "request-4",
          },
          { status: 401 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );

    await gateway.login({
      email: "admin@example.test",
      password: "local-admin-password",
    });
    await expect(gateway.logout()).rejects.toEqual(
      new AuthError("UNAVAILABLE"),
    );
    await gateway.restoreSession();

    const refreshHeaders = new Headers(fetchMock.mock.calls[2]?.[1]?.headers);
    expect(refreshHeaders.has("Authorization")).toBe(false);
  });

  it("passes cancellation through without replacing the abort reason", async () => {
    const abortError = new DOMException("Request aborted.", "AbortError");
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(abortError));
    const gateway = new HttpAuthGateway(
      new HttpClient("https://api.example.test/api/v1"),
    );
    const controller = new AbortController();

    await expect(
      gateway.restoreSession({ signal: controller.signal }),
    ).rejects.toBe(abortError);
  });
});
