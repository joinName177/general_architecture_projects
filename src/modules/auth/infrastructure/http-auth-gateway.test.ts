import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpAuthGateway } from "@/modules/auth/infrastructure/http-auth-gateway";
import { ApiError, HttpClient } from "@/shared/http/http-client";

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

afterEach(() => vi.unstubAllGlobals());

describe("HttpAuthGateway", () => {
  it("logs in, keeps the access token in memory and sends cookies", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json(authResponse))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
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
            code: "INVALID_SESSION",
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

  it("preserves stable server error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          {
            code: "EMAIL_ALREADY_REGISTERED",
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
    ).rejects.toEqual(new ApiError("EMAIL_ALREADY_REGISTERED", 409));
  });
});
