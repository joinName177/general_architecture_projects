"use client";

import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthGateway } from "~/modules/auth/presentation/auth-gateway-context";
import type {
  ChatMessage,
  StreamEvent,
} from "~/modules/chat/application/chat-gateway";
import { useChatGateway } from "~/modules/chat/presentation/chat-gateway-context";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { ChatMessages } from "~/modules/chat/presentation/chat-messages";

import * as styles from "./chat-route.module.css";

type ChatStatus = "error" | "idle" | "streaming";

export function ChatRoute() {
  const gateway = useChatGateway();
  const authGateway = useAuthGateway();

  const session = useQuery({
    queryFn: ({ signal }) => authGateway.restoreSession({ signal }),
    queryKey: ["auth", "session"],
    staleTime: Number.POSITIVE_INFINITY,
  });

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
      if (session.data === null || session.data === undefined) return;

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
        )) {
          handleEvent(event);
        }
      } catch {
        setStatus(controller.signal.aborted ? "idle" : "error");
      } finally {
        abortRef.current = undefined;
      }
    },
    [gateway, messages, session.data, handleEvent],
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  if (session.isPending) {
    return (
      <main className={styles.shell}>
        <div className={styles.statusRegion}>
          <Spinner aria-label="Loading" size="sm" />
        </div>
      </main>
    );
  }

  return (
    <ChatLayout
      isStreaming={status === "streaming"}
      messages={messages}
      onSend={(content) => void handleSend(content)}
      onStop={handleStop}
    />
  );
}

interface ChatLayoutProps {
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
}

function ChatLayout({
  isStreaming,
  messages,
  onSend,
  onStop,
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
              onSend={onSend}
              onStop={onStop}
            />
          </Card.Footer>
        </Card>
      </section>
    </main>
  );
}
