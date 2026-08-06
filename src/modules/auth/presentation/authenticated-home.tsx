import { TextArea } from "@heroui/react/textarea";
import {
  buttonVariants,
  radioGroupVariants,
  radioVariants,
} from "@heroui/styles";
import { MessagesSquare } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "react-aria-components/Button";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { useTranslation } from "react-i18next";

import type { ChatMessage } from "~/modules/chat/application/chat-gateway";
import { ChatPanel } from "~/modules/chat/presentation/chat-panel";
import type { ChatPanelMode } from "~/modules/chat/presentation/chat-panel";
import type { ChatModel } from "~/modules/chat/presentation/chat-input";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { useChat } from "~/modules/chat/presentation/use-chat";
import { LanguageSelector } from "~/shared/i18n/language-selector";

import * as styles from "./authenticated-home.module.css";

interface AuthenticatedHomeProps {
  readonly displayName: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
}

interface ModelOption {
  readonly id: "balanced" | "fast" | "reasoning";
  readonly labelKey:
    | "home.modelOptions.balanced"
    | "home.modelOptions.fast"
    | "home.modelOptions.reasoning";
}

const modelOptions: readonly ModelOption[] = [
  { id: "balanced", labelKey: "home.modelOptions.balanced" },
  { id: "fast", labelKey: "home.modelOptions.fast" },
  { id: "reasoning", labelKey: "home.modelOptions.reasoning" },
];

const logoutButtonClassName = `${buttonVariants({ variant: "secondary" })} ${styles.logoutButton}`;
const sendButtonClassName = `${buttonVariants({ variant: "primary" })} ${styles.sendButton}`;
const modelGroupClassName = `${radioGroupVariants()} ${styles.modelGroup}`;
const modelRadioClassName = `${radioVariants().base()} ${styles.modelOption}`;

export function AuthenticatedHome(props: AuthenticatedHomeProps) {
  const { t } = useTranslation();

  return (
    <main className={styles.shell}>
      <div aria-hidden="true" className={styles.ambientBackdrop}>
        <span className={styles.ambientPrimary} />
        <span className={styles.ambientSecondary} />
        <span className={styles.ambientLens} />
      </div>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label={t("home.brand")}>
          <span aria-hidden="true" className={styles.brandMark}>
            <span className={styles.brandCore} />
          </span>
          <span className={styles.brandCopy}>
            <strong>{t("home.brand")}</strong>
            <small>{t("auth.brandTagline")}</small>
          </span>
        </a>
        <div className={styles.headerActions}>
          <LanguageSelector placement="inline" />
          <Button
            className={logoutButtonClassName}
            isDisabled={props.isLoggingOut}
            onClick={props.onLogout}
            type="button"
          >
            {t("auth.logout")}
          </Button>
        </div>
      </header>
      <HomeContent displayName={props.displayName} />
    </main>
  );
}

interface HomeChatAreaProps {
  readonly chat: ReturnType<typeof useChat>;
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
  readonly panelMode: ChatPanelMode;
  readonly onToggleMode: () => void;
}

function HomeChatArea({
  chat,
  model,
  onModelChange,
  webSearch,
  onWebSearchChange,
  panelMode,
  onToggleMode,
}: HomeChatAreaProps) {
  const hasMessages = chat.messages.length > 0;
  const isChatActive = hasMessages || chat.status === "streaming";

  return (
    <>
      <div className={styles.composerColumn}>
        {isChatActive ? (
          <CompactComposer
            isStreaming={chat.status === "streaming"}
            messages={chat.messages}
            model={model}
            onModelChange={onModelChange}
            onSend={chat.send}
            onStop={chat.stop}
            webSearch={webSearch}
            onWebSearchChange={onWebSearchChange}
          />
        ) : (
          <IdleComposer
            isStreaming={false}
            messages={[]}
            model={model}
            onModelChange={onModelChange}
            onSend={chat.send}
            onStop={chat.stop}
            webSearch={webSearch}
            onWebSearchChange={onWebSearchChange}
          />
        )}
        <ChatPanel
          isStreaming={chat.status === "streaming"}
          messages={chat.messages}
          mode={panelMode}
          model={model}
          onClear={chat.clear}
          onModelChange={onModelChange}
          onSend={chat.send}
          onStop={chat.stop}
          onToggleMode={onToggleMode}
          webSearch={webSearch}
          onWebSearchChange={onWebSearchChange}
        />
      </div>

      {panelMode === "fullscreen" && (
        <ChatPanel
          isStreaming={chat.status === "streaming"}
          messages={chat.messages}
          mode="fullscreen"
          model={model}
          onClear={chat.clear}
          onModelChange={onModelChange}
          onSend={chat.send}
          onStop={chat.stop}
          onToggleMode={onToggleMode}
          webSearch={webSearch}
          onWebSearchChange={onWebSearchChange}
        />
      )}
    </>
  );
}

function HomeContent({ displayName }: { readonly displayName: string }) {
  const { t } = useTranslation();
  const [model, setModel] = useState<ChatModel>("pro");
  const [webSearch, setWebSearch] = useState(false);
  const chat = useChat({
    streamOptions: {
      model: model === "pro" ? "deepseek-v4-pro" : "deepseek-v4-flash",
      webSearch,
    },
  });
  const [panelMode, setPanelMode] = useState<ChatPanelMode>("inline");

  const handleToggleMode = useCallback(() => {
    setPanelMode((prev) => (prev === "fullscreen" ? "inline" : "fullscreen"));
  }, []);

  const isChatActive = chat.messages.length > 0 || chat.status === "streaming";

  return (
    <section
      className={`${styles.content} ${isChatActive ? styles.contentChatActive : ""}`}
      aria-labelledby="home-heading"
    >
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{t("home.eyebrow")}</p>
        <p className={styles.readyStatus}>
          <span aria-hidden="true" className={styles.readyDot} />
          {t("home.sessionReady")}
        </p>
        <h1 className={styles.heading} id="home-heading">
          {t("home.title", { name: displayName })}
        </h1>
        <p className={styles.subtitle}>{t("home.subtitle")}</p>
      </div>
      <HomeChatArea
        chat={chat}
        model={model}
        onModelChange={setModel}
        webSearch={webSearch}
        onWebSearchChange={setWebSearch}
        panelMode={panelMode}
        onToggleMode={handleToggleMode}
      />
    </section>
  );
}

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

function IdleComposer({
  model: _model,
  onModelChange: _onModelChange,
  onSend,
  webSearch: _webSearch,
  onWebSearchChange: _onWebSearchChange,
}: ComposerProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [modelId, setModelId] = useState("balanced");
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
          onChange={setModelId}
          orientation="horizontal"
          value={modelId}
        >
          {modelOptions.map((option) => (
            <Radio
              className={modelRadioClassName}
              key={option.id}
              value={option.id}
            >
              <span aria-hidden="true" className={styles.modelPulse} />
              {t(option.labelKey)}
            </Radio>
          ))}
        </RadioGroup>
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

function CompactComposer({
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
        variant="inline"
        webSearch={webSearch}
        onWebSearchChange={onWebSearchChange}
      />
    </div>
  );
}
