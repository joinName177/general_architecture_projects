"use client";

import { Alert } from "@heroui/react/alert";
import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
import { useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useTranslation } from "react-i18next";

import type {
  ChatMessage,
  ChatModel,
  ChatStreamOptions,
} from "~/modules/chat/application/chat-gateway";
import { resolveChatModelName } from "~/modules/chat/application/chat-gateway";
import { useAuthSession } from "~/modules/auth/presentation/use-auth-session";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { ChatMessageList } from "~/modules/chat/presentation/chat-message-list";
import { useChat } from "~/modules/chat/presentation/use-chat";

import * as styles from "./chat-route.module.css";

function ChatLoading() {
  return (
    <main className={styles.shell}>
      <div className={styles.statusRegion}>
        <Spinner aria-label="Loading" size="sm" />
      </div>
    </main>
  );
}

function ChatUnavailable({ text }: { readonly text: string }) {
  return (
    <main className={styles.shell}>
      <div className={styles.statusRegion}>
        <Card className={styles.chatCard}>
          <Card.Content className={styles.chatContent}>
            <Alert status="danger" role="alert">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{text}</Alert.Description>
              </Alert.Content>
            </Alert>
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}

export function ChatRoute() {
  const session = useAuthSession();
  const { t } = useTranslation();
  const [model, setModel] = useState<ChatModel>("pro");
  const [webSearch, setWebSearch] = useState(false);
  const streamOptions = useMemo<ChatStreamOptions>(
    () => ({ model: resolveChatModelName(model), webSearch }),
    [model, webSearch],
  );
  const { messages, status, send, stop } = useChat({ streamOptions });

  if (session.isPending) return <ChatLoading />;
  if (session.isError) return <ChatUnavailable text={t("chat.error")} />;
  if (session.data === null) return <Navigate to="/" replace />;

  return (
    <ChatLayout
      error={status === "error" ? t("chat.error") : undefined}
      isStreaming={status === "streaming"}
      messages={messages}
      model={model}
      onModelChange={setModel}
      onSend={send}
      onStop={stop}
      webSearch={webSearch}
      onWebSearchChange={setWebSearch}
    />
  );
}

interface ChatLayoutProps {
  readonly error: string | undefined;
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
  error,
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
            <ChatMessageList
              error={error}
              isStreaming={isStreaming}
              messages={messages}
            />
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
