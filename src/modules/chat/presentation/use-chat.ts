import { useCallback, useRef, useState } from "react";

import type {
  ChatMessage,
  ChatStreamOptions,
  StreamEvent,
} from "~/modules/chat/application/chat-gateway";
import { useChatGateway } from "~/modules/chat/presentation/chat-gateway-context";

export type ChatStatus = "error" | "idle" | "streaming";

export interface UseChatOptions {
  readonly onEvent?: (event: StreamEvent) => void;
  readonly streamOptions?: ChatStreamOptions;
}

export interface UseChatReturn {
  readonly messages: ChatMessage[];
  readonly status: ChatStatus;
  readonly send: (content: string) => void;
  readonly stop: () => void;
  readonly clear: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const gateway = useChatGateway();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const abortRef = useRef<AbortController | undefined>(undefined);

  const appendContent = useCallback((content: string) => {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === "assistant") {
        copy[copy.length - 1] = { ...last, content: last.content + content };
      }
      return copy;
    });
  }, []);

  const handleEvent = useCallback(
    (event: StreamEvent) => {
      options.onEvent?.(event);
      if (event.type === "text_delta") {
        appendContent(event.content ?? "");
      } else if (event.type === "done") {
        setStatus("idle");
      } else if (event.type === "error") {
        setStatus("error");
      }
    },
    [appendContent, options],
  );

  const send = useCallback(
    (content: string) => {
      abortRef.current?.abort();

      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setStatus("streaming");

      const controller = new AbortController();
      abortRef.current = controller;

      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      void (async () => {
        try {
          for await (const event of gateway.chatStream(
            updatedMessages,
            controller.signal,
            options.streamOptions,
          )) {
            handleEvent(event);
          }
          setStatus("idle");
        } catch {
          setStatus(controller.signal.aborted ? "idle" : "error");
        } finally {
          abortRef.current = undefined;
        }
      })();
    },
    [gateway, messages, handleEvent, options.streamOptions],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    setStatus("idle");
  }, []);

  return { messages, status, send, stop, clear };
}
