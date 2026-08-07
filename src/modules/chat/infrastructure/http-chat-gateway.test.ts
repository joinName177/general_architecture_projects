import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  ChatMessage,
  StreamEvent,
} from "~/modules/chat/application/chat-gateway";
import { HttpChatGateway } from "~/modules/chat/infrastructure/http-chat-gateway";
import { HttpClient } from "~/shared/http/http-client";

afterEach(() => vi.unstubAllGlobals());

const defaultMessages: readonly ChatMessage[] = [
  { id: "message-1", role: "user", content: "Hi" },
];

async function collectEvents(
  httpClient: HttpClient,
  messages: readonly ChatMessage[] = defaultMessages,
): Promise<StreamEvent[]> {
  const gateway = new HttpChatGateway(httpClient);
  const events: StreamEvent[] = [];
  for await (const event of gateway.chatStream(
    [...messages],
    new AbortController().signal,
  )) {
    events.push(event);
  }
  return events;
}

function createSSEResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    pull(controller) {
      if (closed) return;
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
      closed = true;
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("HttpChatGateway SSE parsing", () => {
  it("parses SSE text_delta events from a stream", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          createSSEResponse([
            'data: {"type":"text_delta","content":"Hello"}\n\n',
            'data: {"type":"text_delta","content":" World"}\n\n',
            'data: {"type":"done","usage":{"prompt_tokens":10,"completion_tokens":5}}\n\n',
          ]),
        ),
    );

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "text_delta", content: "Hello" });
    expect(events[1]).toEqual({ type: "text_delta", content: " World" });
    expect(events[2]).toMatchObject({ type: "done" });
  });
});

describe("HttpChatGateway error responses", () => {
  it("yields an error event when the server returns a non-ok status", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 500 })),
    );

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "error",
      content: "Request failed with status 500.",
    });
  });

  it("yields an error event when not authenticated", async () => {
    const httpClient = new HttpClient("https://api.example.test");

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: "error",
      content: "Not authenticated.",
    });
  });
});

describe("HttpChatGateway SSE edge cases", () => {
  it("skips unparseable SSE lines without failing", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          createSSEResponse([
            "data: garbage\n\n",
            'data: {"type":"text_delta","content":"OK"}\n\n',
            "data: [DONE]\n\n",
            'data: {"type":"done"}\n\n',
          ]),
        ),
    );

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: "text_delta", content: "OK" });
    expect(events[1]).toEqual({ type: "done" });
  });
});

describe("HttpChatGateway SSE chunk boundaries", () => {
  it("handles SSE chunks split across read boundaries", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      pull(controller) {
        if (closed) return;
        // Split a complete SSE frame across two chunks
        controller.enqueue(
          encoder.encode('data: {"type":"text_delta","content":"Split"}\n'),
        );
        controller.enqueue(encoder.encode("\n"));
        controller.close();
        closed = true;
      },
    });
    const response = new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "text_delta", content: "Split" });
  });

  it("flushes the final buffer when the stream ends without a trailing newline", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    const encoder = new TextEncoder();
    let closed = false;
    const stream = new ReadableStream({
      pull(controller) {
        if (closed) return;
        // SSE event without a trailing \n — the final drain must still parse it.
        controller.enqueue(
          encoder.encode('data: {"type":"text_delta","content":"LastWord"}'),
        );
        controller.close();
        closed = true;
      },
    });
    const response = new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });

    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(response));

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "text_delta", content: "LastWord" });
  });
});

describe("HttpChatGateway SSE ignorable lines", () => {
  it("ignores empty lines and non-data lines", async () => {
    const httpClient = new HttpClient("https://api.example.test");
    httpClient.setAccessToken("test-token");

    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          createSSEResponse([
            "\n",
            ": comment line\n\n",
            'data: {"type":"text_delta","content":"Real"}\n\n',
          ]),
        ),
    );

    const events = await collectEvents(httpClient);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "text_delta", content: "Real" });
  });
});
