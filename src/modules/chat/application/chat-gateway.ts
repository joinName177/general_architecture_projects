export interface ChatMessage {
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
}

export interface StreamEvent {
  readonly type: "text_delta" | "done" | "error";
  readonly content?: string;
  readonly usage?: {
    readonly prompt_tokens: number;
    readonly completion_tokens: number;
  };
}

export interface ChatGateway {
  chatStream(
    messages: readonly ChatMessage[],
    signal: AbortSignal,
  ): AsyncIterable<StreamEvent>;
}
