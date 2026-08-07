"use client";

import { Button } from "@heroui/react/button";
import { ListBox } from "@heroui/react/list-box";
import { Select } from "@heroui/react/select";
import { Tooltip } from "@heroui/react/tooltip";
import { ArrowUp, Globe2, Square } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatModel } from "~/modules/chat/application/chat-gateway";

import { LexicalAgentEditor } from "./lexical-agent-editor";
import * as styles from "./chat-input.module.css";

interface ChatInputProps {
  readonly disabled: boolean;
  readonly isStreaming: boolean;
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

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
    <>
      <Tooltip>
        <Button
          aria-label={t("chat.webSearch")}
          aria-pressed={webSearch}
          className={styles.iconButton}
          onPress={() => onWebSearchChange(!webSearch)}
          type="button"
          variant="secondary"
        >
          <Globe2 aria-hidden="true" size={17} />
        </Button>
        <Tooltip.Content>{t("chat.webSearch")}</Tooltip.Content>
      </Tooltip>
      <Select
        aria-label={t("chat.modelLabel")}
        className={styles.modelSelector}
        onSelectionChange={(selected) => {
          if (selected === "pro" || selected === "flash") {
            onModelChange(selected);
          }
        }}
        selectedKey={model}
      >
        <Select.Trigger className={styles.modelTrigger}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover placement="top start">
          <ListBox>
            <ListBox.Item id="flash">{t("chat.modelFlash")}</ListBox.Item>
            <ListBox.Item id="pro">{t("chat.modelPro")}</ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
    </>
  );
}

export function ChatInput({
  disabled,
  isStreaming,
  model,
  onModelChange,
  onSend,
  onStop,
  webSearch,
  onWebSearchChange,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [clearVersion, setClearVersion] = useState(0);
  const canSend = draft.trim().length > 0;

  const sendDraft = () => {
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
    setClearVersion((version) => version + 1);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendDraft();
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <LexicalAgentEditor
        ariaLabel={t("chat.composerLabel")}
        clearVersion={clearVersion}
        disabled={disabled}
        onChange={setDraft}
        onSubmit={sendDraft}
        placeholder={t("chat.composerPlaceholder")}
      />
      <div className={styles.controlsRow}>
        <ChatControls
          model={model}
          onModelChange={onModelChange}
          webSearch={webSearch}
          onWebSearchChange={onWebSearchChange}
        />
        <div className={styles.composerActions}>
          {isStreaming ? (
            <Tooltip>
              <Button
                aria-label={t("chat.stop")}
                className={styles.submitButton}
                onPress={onStop}
                type="button"
                variant="secondary"
              >
                <Square aria-hidden="true" size={16} fill="currentColor" />
              </Button>
              <Tooltip.Content>{t("chat.stop")}</Tooltip.Content>
            </Tooltip>
          ) : (
            <Tooltip>
              <Button
                aria-label={t("chat.send")}
                className={styles.submitButton}
                isDisabled={!canSend}
                type="submit"
                variant="primary"
              >
                <ArrowUp aria-hidden="true" size={22} strokeWidth={2.25} />
              </Button>
              <Tooltip.Content>{t("chat.send")}</Tooltip.Content>
            </Tooltip>
          )}
        </div>
      </div>
    </form>
  );
}
