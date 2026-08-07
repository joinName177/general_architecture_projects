"use client";

import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "~/modules/chat/application/chat-gateway";

import * as styles from "./chat-messages.module.css";

interface ChatMessageListProps {
  readonly error: string | undefined;
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly variant?: ChatMessageListVariant | undefined;
}

export type ChatMessageListVariant = "fullscreen" | "inline";

export function ChatMessageList({
  error,
  messages,
  isStreaming,
  variant,
}: ChatMessageListProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>{t("chat.composerPlaceholder")}</p>
      </div>
    );
  }

  return (
    <ScrollShadow
      className={`${styles.messageList} ${variant === "fullscreen" ? styles.messageListFullscreen : ""}`}
      hideScrollBar
    >
      {messages.map((message, index) => (
        <div
          className={`${styles.messageRow} ${message.role === "user" ? styles.messageRowUser : styles.messageRowAssistant}`}
          key={message.id}
        >
          <span
            aria-hidden="true"
            className={`${styles.avatar} ${message.role === "user" ? styles.avatarUser : styles.avatarAssistant}`}
          >
            {message.role === "user" ? "U" : <Bot size={20} />}
          </span>
          <div className={styles.messageBubble}>
            <p className={styles.messageText}>
              {message.content ||
                (isStreaming && index === messages.length - 1
                  ? "…"
                  : t("chat.emptyResponse"))}
            </p>
          </div>
        </div>
      ))}
      {error !== undefined && (
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      )}
      {isStreaming && (
        <div
          className={styles.streamingIndicator}
          aria-label={t("chat.streaming")}
        >
          <span className={styles.streamingDot} />
          <span className={styles.streamingDot} />
          <span className={styles.streamingDot} />
        </div>
      )}
      <div ref={bottomRef} />
    </ScrollShadow>
  );
}
