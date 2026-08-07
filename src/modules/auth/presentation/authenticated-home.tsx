import { Button } from "@heroui/react/button";
import { Bot, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ChatModel } from "~/modules/chat/application/chat-gateway";
import { resolveChatModelName } from "~/modules/chat/application/chat-gateway";
import { ChatInput } from "~/modules/chat/presentation/chat-input";
import { ChatMessageList } from "~/modules/chat/presentation/chat-message-list";
import { useChat } from "~/modules/chat/presentation/use-chat";
import { LanguageSelector } from "~/shared/i18n/language-selector";

import * as styles from "./authenticated-home.module.css";

const drawerTransitionDurationMs = 320;

interface AuthenticatedHomeProps {
  readonly displayName: string;
  readonly isLoggingOut: boolean;
  readonly onLogout: () => void;
}

export function AuthenticatedHome(props: AuthenticatedHomeProps) {
  const { t } = useTranslation();
  const { handleCloseDrawer, handleOpenDrawer, isDrawerMounted, isDrawerOpen } =
    useAgentDrawer();

  return (
    <main
      className={`${styles.shell} ${isDrawerOpen ? styles.shellSplit : ""}`}
    >
      <h1 className={styles.srOnly}>{t("home.brand")}</h1>
      {/* Main column — adapts its width when the drawer opens */}
      <div className={styles.mainColumn}>
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
      </div>

      {/* Floating action button — scales out when drawer opens */}
      <button
        aria-label={t("home.openAgent")}
        className={`${styles.fab} ${isDrawerMounted ? styles.fabHidden : ""}`}
        onClick={handleOpenDrawer}
        type="button"
      >
        <Bot aria-hidden="true" size={24} />
      </button>

      {/* Side panel — slides in alongside the main column */}
      {isDrawerMounted && (
        <aside
          aria-hidden={!isDrawerOpen}
          aria-label={t("home.agentDrawer")}
          className={styles.drawer}
          inert={!isDrawerOpen}
        >
          <AgentDrawerContent onClose={handleCloseDrawer} />
        </aside>
      )}
    </main>
  );
}

function useAgentDrawer() {
  const openAnimationFrameRef = useRef<number | null>(null);
  const [isDrawerMounted, setDrawerMounted] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isDrawerClosing, setDrawerClosing] = useState(false);

  useEffect(
    () => () => {
      if (openAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(openAnimationFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isDrawerClosing) {
      return undefined;
    }

    const closeTimeout = window.setTimeout(() => {
      setDrawerMounted(false);
      setDrawerClosing(false);
    }, drawerTransitionDurationMs);

    return () => window.clearTimeout(closeTimeout);
  }, [isDrawerClosing]);

  const handleOpenDrawer = useCallback(() => {
    setDrawerClosing(false);
    setDrawerMounted(true);
    openAnimationFrameRef.current = window.requestAnimationFrame(() => {
      openAnimationFrameRef.current = null;
      setDrawerOpen(true);
    });
  }, []);
  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setDrawerClosing(true);
  }, []);

  return {
    handleCloseDrawer,
    handleOpenDrawer,
    isDrawerMounted,
    isDrawerOpen,
  };
}

interface AgentDrawerContentProps {
  readonly onClose: () => void;
}

function AgentDrawerContent({ onClose }: AgentDrawerContentProps) {
  const { t } = useTranslation();
  const [model, setModel] = useState<ChatModel>("flash");
  const [webSearch, setWebSearch] = useState(false);
  const streamOptions = useMemo(
    () => ({ model: resolveChatModelName(model), webSearch }),
    [model, webSearch],
  );
  const chat = useChat({ streamOptions });

  const chatError = chat.status === "error" ? t("chat.error") : undefined;

  return (
    <>
      {/* Drawer header */}
      <header className={styles.drawerHeader}>
        <div className={styles.drawerHeaderActions}>
          <Button
            aria-label={t("home.closeAgent")}
            className={styles.drawerCloseButton}
            onPress={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </Button>
        </div>
      </header>

      {/* Drawer body — messages */}
      <section className={styles.drawerBody}>
        <ChatMessageList
          error={chatError}
          isStreaming={chat.status === "streaming"}
          messages={chat.messages}
          variant="inline"
        />
      </section>

      {/* Drawer footer — input */}
      <footer className={styles.drawerFooter}>
        <ChatInput
          disabled={chat.status === "streaming"}
          isStreaming={chat.status === "streaming"}
          model={model}
          onModelChange={setModel}
          onSend={chat.send}
          onStop={chat.stop}
          webSearch={webSearch}
          onWebSearchChange={setWebSearch}
        />
      </footer>
    </>
  );
}
