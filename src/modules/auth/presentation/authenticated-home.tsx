import { TextArea } from "@heroui/react/textarea";
import {
  buttonVariants,
  radioGroupVariants,
  radioVariants,
} from "@heroui/styles";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "react-aria-components/Button";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { useTranslation } from "react-i18next";

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
      <section className={styles.content} aria-labelledby="home-heading">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("home.eyebrow")}</p>
          <p className={styles.readyStatus}>
            <span aria-hidden="true" className={styles.readyDot} />
            {t("home.sessionReady")}
          </p>
          <h1 className={styles.heading} id="home-heading">
            {t("home.title", { name: props.displayName })}
          </h1>
          <p className={styles.subtitle}>{t("home.subtitle")}</p>
        </div>
        <HomeComposer />
      </section>
    </main>
  );
}

function HomeComposer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [modelId, setModelId] = useState("balanced");
  const canSend = draft.trim().length > 0;

  return (
    <form
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) void navigate("/chat");
      }}
    >
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
