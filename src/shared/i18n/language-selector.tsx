import { Button } from "@heroui/react/button";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useApplicationI18n } from "~/shared/i18n/application-i18n";

import * as styles from "./language-selector.module.css";

interface LanguageSelectorProps {
  readonly placement?: "floating" | "inline";
}

export function LanguageSelector({
  placement = "floating",
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useApplicationI18n();
  const nextLanguage = language === "zh-CN" ? "en-GB" : "zh-CN";
  const accessibleLabel = t(
    nextLanguage === "en-GB"
      ? "language.switchToEnglish"
      : "language.switchToChinese",
  );

  return (
    <Button
      aria-label={accessibleLabel}
      className={`${styles.selector} ${placement === "inline" ? styles.inline : ""}`}
      isIconOnly
      onPress={() => setLanguage(nextLanguage)}
      type="button"
      variant="tertiary"
    >
      <Languages aria-hidden="true" className={styles.icon} strokeWidth={2} />
    </Button>
  );
}
