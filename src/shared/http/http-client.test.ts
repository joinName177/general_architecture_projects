import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { HttpClient, HttpResponseError } from "~/shared/http/http-client";

const successResponseSchema = z.object({
  code: z.literal(200),
  data: z.object({ id: z.string() }),
  message: z.string(),
  requestId: z.string(),
});

afterEach(() => vi.unstubAllGlobals());

describe("HttpClient", () => {
  it("unwraps standard success responses for all supported HTTP methods", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        Response.json({
          code: 200,
          data: { id: "resource-1" },
          message: "Resource retrieved.",
          requestId: "request-1",
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new HttpClient("https://api.example.test/api/v1");

    await client.get("/resources/1", successResponseSchema);
    await client.post("/resources", successResponseSchema, {
      body: { name: "Created" },
    });
    await client.put("/resources/1", successResponseSchema, {
      body: { name: "Replaced" },
    });
    await client.patch("/resources/1", successResponseSchema, {
      body: { name: "Updated" },
    });
    await client.delete("/resources/1", successResponseSchema);

    expect(fetchMock.mock.calls.map((call) => call[1]?.method)).toEqual([
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ]);
    expect(await client.get("/resources/1", successResponseSchema)).toEqual({
      id: "resource-1",
    });
  });

  it("sends JSON, cookies and the in-memory bearer token", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        code: 200,
        data: { id: "resource-1" },
        message: "Resource retrieved.",
        requestId: "request-1",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = new HttpClient("https://api.example.test/api/v1");
    client.setAccessToken("access-token");

    await client.post("/resources", successResponseSchema, {
      body: { name: "Created" },
    });

    const request = fetchMock.mock.calls[0]?.[1];
    const headers = new Headers(request?.headers);
    expect(request?.body).toBe(JSON.stringify({ name: "Created" }));
    expect(request?.credentials).toBe("include");
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("preserves the HTTP status and standard error response", async () => {
    const errorResponse = {
      code: 404,
      errorCode: "RESOURCE_NOT_FOUND",
      message: "Resource was not found.",
      requestId: "request-2",
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(errorResponse, { status: 404 })),
    );
    const client = new HttpClient("https://api.example.test/api/v1");

    await expect(
      client.get("/resources/missing", successResponseSchema),
    ).rejects.toEqual(new HttpResponseError(404, errorResponse));
  });
});
