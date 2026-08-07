import { Button } from "@heroui/react/button";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatModel } from "~/modules/chat/application/chat-gateway";
import { resolveChatModelName } from "~/modules/chat/application/chat-gateway";
import { ChatPanel } from "~/modules/chat/presentation/chat-panel";
import type { ChatPanelMode } from "~/modules/chat/presentation/chat-panel";
import { useChat } from "~/modules/chat/presentation/use-chat";
import { LanguageSelector } from "~/shared/i18n/language-selector";

import { CompactComposer, IdleComposer } from "./home-composer";
import * as styles from "./authenticated-home.module.css";

interface AuthenticatedHomeProps {
  readonly displayName: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
}

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
            className={styles.logoutButton}
            isDisabled={props.isLoggingOut}
            onPress={props.onLogout}
            type="button"
            variant="secondary"
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
  readonly error: string | undefined;
  readonly model: ChatModel;
  readonly onModelChange: (model: ChatModel) => void;
  readonly webSearch: boolean;
  readonly onWebSearchChange: (enabled: boolean) => void;
  readonly panelMode: ChatPanelMode;
  readonly onToggleMode: () => void;
}

function HomeChatArea({
  chat,
  error,
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
          error={error}
          isStreaming={chat.status === "streaming"}
          messages={chat.messages}
          mode="inline"
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
          error={error}
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
  const streamOptions = useMemo(
    () => ({ model: resolveChatModelName(model), webSearch }),
    [model, webSearch],
  );
  const chat = useChat({ streamOptions });
  const [panelMode, setPanelMode] = useState<ChatPanelMode>("inline");

  const handleToggleMode = useCallback(() => {
    setPanelMode((prev) => (prev === "fullscreen" ? "inline" : "fullscreen"));
  }, []);

  const isChatActive = chat.messages.length > 0 || chat.status === "streaming";
  const chatError = chat.status === "error" ? t("chat.error") : undefined;

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
        error={chatError}
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
