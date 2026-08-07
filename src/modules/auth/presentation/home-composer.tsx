import { Button } from "@heroui/react/button";
import { Radio } from "@heroui/react/radio";
import { RadioGroup } from "@heroui/react/radio-group";
import { Switch } from "@heroui/react/switch";
import { TextArea } from "@heroui/react/textarea";
import { MessagesSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type {
  ChatMessage,
  ChatModel,
} from "~/modules/chat/application/chat-gateway";
import { ChatInput } from "~/modules/chat/presentation/chat-input";

import * as styles from "./home-composer.module.css";

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
          className={styles.modelGroup}
          onChange={(value) => onModelChange(value as ChatModel)}
          orientation="horizontal"
          value={model}
        >
          <Radio value="pro">
            <Radio.Content className={styles.modelOption}>
              <span aria-hidden="true" className={styles.modelPulse} />
              {t("chat.modelPro")}
            </Radio.Content>
          </Radio>
          <Radio value="flash">
            <Radio.Content className={styles.modelOption}>
              <span aria-hidden="true" className={styles.modelPulse} />
              {t("chat.modelFlash")}
            </Radio.Content>
          </Radio>
        </RadioGroup>
        <Switch
          className={styles.webSearchSwitch}
          isSelected={webSearch}
          onChange={onWebSearchChange}
        >
          {t("chat.webSearch")}
        </Switch>
        <Button
          className={styles.sendButton}
          isDisabled={!canSend}
          type="submit"
          variant="primary"
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
