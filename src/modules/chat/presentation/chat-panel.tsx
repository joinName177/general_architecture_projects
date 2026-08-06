"use client";

import { Expand, Minimize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "react-aria-components/Button";

import type {
  ChatMessage,
  ChatModel,
} from "~/modules/chat/application/chat-gateway";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { ChatMessageList } from "~/modules/chat/presentation/chat-message-list";

import * as styles from "./chat-panel.module.css";

export type ChatPanelMode = "fullscreen" | "inline";

interface ChatPanelProps {
  readonly error: string | undefined;
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly mode: ChatPanelMode;
  readonly model: ChatModel;
  readonly onClear?: (() => void) | undefined;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly onToggleMode: () => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

interface ChatPanelViewProps {
  readonly error: string | undefined;
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly model: ChatModel;
  readonly onClear?: (() => void) | undefined;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly onToggleMode: () => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

function FullscreenView({
  error,
  isStreaming,
  messages,
  model,
  onClear,
  onModelChange,
  onSend,
  onStop,
  onToggleMode,
  webSearch,
  onWebSearchChange,
}: ChatPanelViewProps) {
  const { t } = useTranslation();
  const hasMessages = messages.length > 0;

  return (
    <div className={styles.fullscreenOverlay}>
      <div className={styles.fullscreenShell}>
        <header className={styles.fullscreenHeader}>
          <span className={styles.fullscreenTitle}>{t("chat.heading")}</span>
          <div className={styles.fullscreenActions}>
            {hasMessages && onClear !== undefined && (
              <Button
                className={styles.clearButton}
                onPress={onClear}
                type="button"
              >
                {t("chat.clear")}
              </Button>
            )}
            <Button
              className={styles.fullscreenButton}
              onPress={onToggleMode}
              type="button"
            >
              <Minimize2 aria-hidden="true" size={18} />
              {t("chat.minimize")}
            </Button>
          </div>
        </header>
        <section className={styles.fullscreenBody}>
          <ChatMessageList
            error={error}
            isStreaming={isStreaming}
            messages={messages}
            variant="fullscreen"
          />
        </section>
        <footer className={styles.fullscreenFooter}>
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
        </footer>
      </div>
    </div>
  );
}

function InlineView({
  error,
  messages,
  isStreaming,
  onClear,
  onToggleMode,
}: Pick<
  ChatPanelViewProps,
  "error" | "isStreaming" | "messages" | "onClear" | "onToggleMode"
>) {
  const { t } = useTranslation();

  return (
    <section className={styles.inlinePanel}>
      <div className={styles.inlineHeader}>
        <span className={styles.inlineTitle}>{t("chat.heading")}</span>
        <div className={styles.inlineActions}>
          {onClear !== undefined && (
            <Button
              className={styles.clearButton}
              onPress={onClear}
              type="button"
            >
              {t("chat.clear")}
            </Button>
          )}
          <Button
            className={styles.fullscreenButton}
            onPress={onToggleMode}
            type="button"
          >
            <Expand aria-hidden="true" size={18} />
            {t("chat.fullscreen")}
          </Button>
        </div>
      </div>
      <div className={styles.inlineBody}>
        <ChatMessageList
          error={error}
          isStreaming={isStreaming}
          messages={messages}
          variant="inline"
        />
      </div>
    </section>
  );
}

export function ChatPanel({
  error,
  isStreaming,
  messages,
  mode,
  model,
  onClear,
  onModelChange,
  onSend,
  onStop,
  onToggleMode,
  webSearch,
  onWebSearchChange,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0;

  if (mode === "fullscreen") {
    return (
      <FullscreenView
        error={error}
        isStreaming={isStreaming}
        messages={messages}
        model={model}
        onClear={onClear}
        onModelChange={onModelChange}
        onSend={onSend}
        onStop={onStop}
        onToggleMode={onToggleMode}
        webSearch={webSearch}
        onWebSearchChange={onWebSearchChange}
      />
    );
  }

  if (!hasMessages) return null;

  return (
    <InlineView
      error={error}
      isStreaming={isStreaming}
      messages={messages}
      onClear={onClear}
      onToggleMode={onToggleMode}
    />
  );
}
