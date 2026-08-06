import { TextArea } from "@heroui/react/textarea";
import {
  buttonVariants,
  radioGroupVariants,
  radioVariants,
} from "@heroui/styles";
import { MessagesSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "react-aria-components/Button";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { Switch } from "react-aria-components/Switch";
import { useTranslation } from "react-i18next";

import type {
  ChatMessage,
  ChatModel,
} from "~/modules/chat/application/chat-gateway";
import { ChatInput } from "~/modules/chat/presentation/chat-input";

import * as styles from "./home-composer.module.css";

const sendButtonClassName = `${buttonVariants({ variant: "primary" })} ${styles.sendButton}`;
const modelGroupClassName = `${radioGroupVariants()} ${styles.modelGroup}`;
const modelRadioClassName = `${radioVariants().base()} ${styles.modelOption}`;

interface ComposerProps {
  readonly isStreaming: boolean;
  readonly messages: readonly ChatMessage[];
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly onSend: (content: string) => void;
  readonly onStop: () => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
}

export function IdleComposer({
  model,
  onModelChange,
  onSend,
  webSearch,
  onWebSearchChange,
}: ComposerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.composerTopline}>
        <span>{t("home.composerHeading")}</span>
        <span className={styles.composerIndex}>01</span>
      </div>
      <TextArea
        aria-label={t("home.composerLabel")}
        className={styles.textArea}
        fullWidth
        onChange={(event) => setDraft(event.currentTarget.value)}
        placeholder={t("home.composerPlaceholder")}
        value={draft}
      />
      <div className={styles.composerFooter}>
        <RadioGroup
          aria-label={t("home.modelLabel")}
          className={modelGroupClassName}
          onChange={(value) => onModelChange(value as ChatModel)}
          orientation="horizontal"
          value={model}
        >
          <Radio className={modelRadioClassName} value="pro">
            <span aria-hidden="true" className={styles.modelPulse} />
            {t("chat.modelPro")}
          </Radio>
          <Radio className={modelRadioClassName} value="flash">
            <span aria-hidden="true" className={styles.modelPulse} />
            {t("chat.modelFlash")}
          </Radio>
        </RadioGroup>
        <Switch
          className={styles.webSearchSwitch}
          isSelected={webSearch}
          onChange={onWebSearchChange}
        >
          <span aria-hidden="true" className={styles.webSearchToggle} />
          <span className={styles.webSearchLabel}>{t("chat.webSearch")}</span>
        </Switch>
        <Button
          className={sendButtonClassName}
          isDisabled={!canSend}
          type="submit"
        >
          {t("home.send")}
          <span aria-hidden="true" className={styles.sendArrow}>
            →
          </span>
        </Button>
      </div>
    </form>
  );
}

export function CompactComposer({
  isStreaming,
  model,
  onModelChange,
  onSend,
  onStop,
  webSearch,
  onWebSearchChange,
}: ComposerProps) {
  return (
    <div className={styles.compactComposer}>
      <MessagesSquare
        aria-hidden="true"
        className={styles.compactComposerIcon}
        size={18}
      />
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
    </div>
  );
}
