"use client";

import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthGateway } from "~/modules/auth/presentation/auth-gateway-context";
import type {
  ChatMessage,
  ChatStreamOptions,
  StreamEvent,
} from "~/modules/chat/application/chat-gateway";
import type { ChatModel } from "~/modules/chat/presentation/chat-input";
import { useChatGateway } from "~/modules/chat/presentation/chat-gateway-context";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { ChatMessages } from "~/modules/chat/presentation/chat-messages";

import * as styles from "./chat-route.module.css";

type ChatStatus = "error" | "idle" | "streaming";

interface UseChatStreamResult {
  readonly messages: ChatMessage[];
  readonly status: ChatStatus;
  readonly handleSend: (content: string) => Promise<void>;
  readonly handleStop: () => void;
}

function useChatStream(
  model: ChatModel,
  webSearch: boolean,
): UseChatStreamResult {
  const gateway = useChatGateway();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const abortRef = useRef<AbortController | undefined>(undefined);

  const streamOptions = useMemo<ChatStreamOptions>(
    () => ({
      model: model === "pro" ? "deepseek-v4-pro" : "deepseek-v4-flash",
      webSearch,
    }),
    [model, webSearch],
  );

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
      if (event.type === "text_delta") {
        appendContent(event.content ?? "");
      } else if (event.type === "done") {
        setStatus("idle");
      } else if (event.type === "error") {
        setStatus("error");
      }
    },
    [appendContent],
  );

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = { role: "user", content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setStatus("streaming");

      const controller = new AbortController();
      abortRef.current = controller;

      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      try {
        for await (const event of gateway.chatStream(
          updatedMessages,
          controller.signal,
          streamOptions,
        )) {
          handleEvent(event);
        }
      } catch {
        setStatus(controller.signal.aborted ? "idle" : "error");
      } finally {
        abortRef.current = undefined;
      }
    },
    [gateway, messages, handleEvent, streamOptions],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, status, handleSend, handleStop };
}

function ChatLoading() {
  return (
    <main className={styles.shell}>
      <div className={styles.statusRegion}>
        <Spinner aria-label="Loading" size="sm" />
      </div>
    </main>
  );
}

export function ChatRoute() {
  const authGateway = useAuthGateway();

  const session = useQuery({
    queryFn: ({ signal }) => authGateway.restoreSession({ signal }),
    queryKey: ["auth", "session"],
    staleTime: Number.POSITIVE_INFINITY,
  });

  const [model, setModel] = useState<ChatModel>("pro");
  const [webSearch, setWebSearch] = useState(false);
  const { messages, status, handleSend, handleStop } = useChatStream(
    model,
    webSearch,
  );

  if (session.isPending) return <ChatLoading />;

  return (
    <ChatLayout
      isStreaming={status === "streaming"}
      messages={messages}
      model={model}
      onModelChange={setModel}
      onSend={(content) => void handleSend(content)}
      onStop={handleStop}
      webSearch={webSearch}
      onWebSearchChange={setWebSearch}
    />
  );
}

interface ChatLayoutProps {
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

function ChatLayout({
  isStreaming,
  messages,
  model,
  onModelChange,
  onSend,
  onStop,
  webSearch,
  onWebSearchChange,
}: ChatLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.heading}>{t("chat.heading")}</h1>
      </header>
      <section className={styles.chatArea}>
        <Card className={styles.chatCard}>
          <Card.Content className={styles.chatContent}>
            <ChatMessages isStreaming={isStreaming} messages={messages} />
          </Card.Content>
          <Card.Footer className={styles.chatFooter}>
            <ChatInput
              disabled={isStreaming}
              isStreaming={isStreaming}
              model={model}
              onModelChange={onModelChange}
              onSend={onSend}
              onStop={onStop}
              webSearch={webSearch}
              onWebSearchChange={onWebSearchChange}
            />
          </Card.Footer>
        </Card>
      </section>
    </main>
  );
}
