import type {
  ChatGateway,
  ChatStreamOptions,
  StreamEvent,
} from "../application/chat-gateway";
import type { ChatMessage } from "../application/chat-gateway";
import type { ChatRequest } from "~/generated/dify-agent-api/types.gen";
import { zChatRequest } from "~/generated/dify-agent-api/zod.gen";
import type { HttpClient } from "~/shared/http/http-client";

export class HttpChatGateway implements ChatGateway {
  public constructor(private readonly httpClient: HttpClient) {}

  public async *chatStream(
    messages: readonly ChatMessage[],
    signal: AbortSignal,
    options: ChatStreamOptions = {},
  ): AsyncIterable<StreamEvent> {
    const parsed = zChatRequest.parse({
      ...(options.model === undefined ? {} : { model: options.model }),
      messages: [...messages].map(({ role, content }) => ({ role, content })),
      ...(options.webSearch === undefined
        ? {}
        : { web_search: options.webSearch }),
    } satisfies ChatRequest);

    if (this.httpClient.getAccessToken() === undefined) {
      yield { type: "error", content: "Not authenticated." };
      return;
    }

    const response = await this.httpClient.stream(
      "/api/v1/agent/chat",
      "POST",
      { body: parsed, signal },
    );

    if (!response.ok) {
      yield {
        type: "error",
        content: `Request failed with status ${response.status}.`,
      };
      return;
    }

    yield* this.readStream(response);
  }

  private async *readStream(response: Response): AsyncIterable<StreamEvent> {
    const reader = response.body?.getReader();
    if (reader === undefined) return;

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunk = HttpChatGateway.drainChunk(buffer);
        buffer = chunk.remaining;
        for (const event of chunk.events) {
          yield event;
        }
      }
      // Flush the decoder's internal state and process any remaining buffered data.
      buffer += decoder.decode();
      for (const event of HttpChatGateway.drainFinal(buffer)) {
        yield event;
      }
    } finally {
      reader.releaseLock();
    }
  }

  private static drainChunk(buffer: string): {
    events: StreamEvent[];
    remaining: string;
  } {
    const lines = buffer.split("\n");
    const remaining = lines.pop() ?? "";
    const events: StreamEvent[] = [];
    for (const line of lines) {
      const event = parseLine(line);
      if (event !== undefined) events.push(event);
    }
    return { events, remaining };
  }

  private static drainFinal(buffer: string): StreamEvent[] {
    if (buffer.trim() === "") return [];
    const events: StreamEvent[] = [];
    for (const line of buffer.split("\n")) {
      const event = parseLine(line);
      if (event !== undefined) events.push(event);
    }
    return events;
  }
}

function parseLine(line: string): StreamEvent | undefined {
  const trimmed = line.trim();
  if (trimmed === "" || !trimmed.startsWith("data:")) return undefined;
  const payload = trimmed.slice(5).trim();
  if (payload === "[DONE]") return undefined;
  try {
    const event = JSON.parse(payload) as StreamEvent;
    if (
      event.type === "text_delta" ||
      event.type === "done" ||
      event.type === "error"
    ) {
      return event;
    }
  } catch {
    // Skip unparseable chunks
  }
  return undefined;
}
