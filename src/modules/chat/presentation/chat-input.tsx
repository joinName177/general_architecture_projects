"use client";

import { TextArea } from "@heroui/react/textarea";
import { buttonVariants } from "@heroui/styles";
import { ToggleButton } from "@heroui/react/toggle-button";
import { ToggleButtonGroup } from "@heroui/react/toggle-button-group";
import { useState } from "react";
import { Button } from "react-aria-components/Button";
import { Switch } from "react-aria-components/Switch";
import { useTranslation } from "react-i18next";

import * as styles from "./chat-route.module.css";

export type ChatModel = "pro" | "flash";

interface ChatInputProps {
  readonly disabled: boolean;
  readonly isStreaming: boolean;
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly variant?: ChatInputVariant | undefined;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

export type ChatInputVariant = "fullscreen" | "inline";

interface ChatControlsProps {
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

function ChatControls({
  model,
  onModelChange,
  webSearch,
  onWebSearchChange,
}: ChatControlsProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.controlsRow}>
      <ToggleButtonGroup
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const selected = [...keys][0] as ChatModel | undefined;
          if (selected !== undefined) onModelChange(selected);
        }}
        selectedKeys={new Set([model])}
        size="sm"
      >
        <ToggleButton id="pro">{t("chat.modelPro")}</ToggleButton>
        <ToggleButton id="flash">{t("chat.modelFlash")}</ToggleButton>
      </ToggleButtonGroup>
      <Switch
        className={styles.webSearchSwitch}
        isSelected={webSearch}
        onChange={onWebSearchChange}
      >
        <span aria-hidden="true" className={styles.webSearchToggle} />
        <span className={styles.webSearchLabel}>{t("chat.webSearch")}</span>
      </Switch>
    </div>
  );
}

export function ChatInput({
  disabled,
  isStreaming,
  model,
  onModelChange,
  onSend,
  onStop,
  variant: _variant,
  webSearch,
  onWebSearchChange,
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
      <ChatControls
        model={model}
        onModelChange={onModelChange}
        webSearch={webSearch}
        onWebSearchChange={onWebSearchChange}
      />
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
