export interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant" | "system";
  readonly content: string;
}

export interface StreamEvent {
  readonly type: "text_delta" | "done" | "error";
  readonly content?: string;
}

export interface ChatStreamOptions {
  readonly model?: string | undefined;
  readonly webSearch?: boolean | undefined;
}

/** 用户可选的聊天模型枚举（UI 概念，独立于底层 API 模型名）。 */
export type ChatModel = "pro" | "flash";

/** 将 UI 模型枚举映射为底层 API 模型名，收敛在 application 层。 */
export function resolveChatModelName(model: ChatModel): string {
  return model === "pro" ? "deepseek-v4-pro" : "deepseek-v4-flash";
}

export interface ChatGateway {
  chatStream(
    messages: readonly ChatMessage[],
    signal: AbortSignal,
    options?: ChatStreamOptions,
  ): AsyncIterable<StreamEvent>;
}
