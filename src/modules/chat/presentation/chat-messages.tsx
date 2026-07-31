"use client";

import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "~/modules/chat/application/chat-gateway";

import * as styles from "./chat-route.module.css";

interface ChatMessagesProps {
  readonly messages: readonly ChatMessage[];
  readonly isStreaming: boolean;
}

export function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
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
    <ScrollShadow className={styles.messageList} hideScrollBar>
      {messages.map((message, index) => (
        <div
          className={`${styles.messageRow} ${message.role === "user" ? styles.messageRowUser : styles.messageRowAssistant}`}
          key={index}
        >
          <span
            aria-hidden="true"
            className={`${styles.avatar} ${message.role === "user" ? styles.avatarUser : styles.avatarAssistant}`}
          >
            {message.role === "user" ? "U" : "A"}
          </span>
          <div className={styles.messageBubble}>
            <p className={styles.messageText}>
              {message.content ||
                (isStreaming && index === messages.length - 1 ? "…" : "")}
            </p>
          </div>
        </div>
      ))}
      {isStreaming && (
        <div className={styles.streamingIndicator}>
          <span className={styles.streamingDot} />
          {t("chat.streaming")}
        </div>
      )}
      <div ref={bottomRef} />
    </ScrollShadow>
  );
}
