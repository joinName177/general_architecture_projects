"use client";

import { TextArea } from "@heroui/react/textarea";
import { buttonVariants } from "@heroui/styles";
import { useState } from "react";
import { Button } from "react-aria-components/Button";
import { useTranslation } from "react-i18next";

import * as styles from "./chat-route.module.css";

interface ChatInputProps {
  readonly disabled: boolean;
  readonly isStreaming: boolean;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
}

export function ChatInput({
  disabled,
  isStreaming,
  onSend,
  onStop,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend && !disabled) {
        onSend(draft.trim());
        setDraft("");
      }
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <TextArea
        aria-label={t("chat.composerLabel")}
        className={styles.textArea}
        fullWidth
        disabled={disabled}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("chat.composerPlaceholder")}
        value={draft}
      />
      <div className={styles.composerActions}>
        {isStreaming ? (
          <Button
            className={buttonVariants({ variant: "secondary" })}
            onPress={onStop}
            type="button"
          >
            {t("chat.stop")}
          </Button>
        ) : (
          <Button
            className={buttonVariants({ variant: "primary" })}
            isDisabled={!canSend}
            type="submit"
          >
            {t("chat.send")}
          </Button>
        )}
      </div>
    </form>
  );
}
