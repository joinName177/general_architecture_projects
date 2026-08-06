import { Alert } from "@heroui/react/alert";
import { Card } from "@heroui/react/card";
import { Spinner } from "@heroui/react/spinner";
import { useTranslation } from "react-i18next";

import { LanguageSelector } from "~/shared/i18n/language-selector";

import * as styles from "./auth-shell.module.css";

export function Brand() {
  const { t } = useTranslation();
  return (
    <div className={styles.brand}>
      <span aria-hidden="true" className={styles.brandMark}>
        <span className={styles.brandCore} />
      </span>
      <span className={styles.brandCopy}>
        <strong>{t("auth.brand")}</strong>
        <small>{t("auth.brandTagline")}</small>
      </span>
    </div>
  );
}

export function LiquidBackdrop() {
  return (
    <div aria-hidden="true" className={styles.liquidBackdrop}>
      <span className={styles.liquidOrbPrimary} />
      <span className={styles.liquidOrbSecondary} />
      <span className={styles.liquidLens} />
    </div>
  );
}

export function ShellHeader() {
  return (
    <header className={styles.topbar}>
      <Brand />
      <LanguageSelector placement="inline" />
    </header>
  );
}

export function StatusCard({
  status,
  text,
}: {
  readonly status: "error" | "loading";
  readonly text: string;
}) {
  return (
    <main className={`${styles.shell} ${styles.shellCentered}`}>
      <LiquidBackdrop />
      <ShellHeader />
      <div className={styles.statusRegion}>
        <Card className={styles.card}>
          <Card.Content className={styles.cardContent}>
            {status === "loading" ? (
              <div className={styles.statusContent} role="status">
                <Spinner aria-hidden="true" size="sm" />
                <span>{text}</span>
              </div>
            ) : (
              <Alert className={styles.alert} status="danger" role="alert">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{text}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}
