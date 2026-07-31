import { buttonVariants } from "@heroui/styles";
import { Languages } from "lucide-react";
import { Button } from "react-aria-components/Button";
import { useTranslation } from "react-i18next";

import { useApplicationI18n } from "~/shared/i18n/application-i18n";

import * as styles from "./language-selector.module.css";

const languageButtonClassName = `${buttonVariants({
  isIconOnly: true,
  variant: "tertiary",
})} ${styles.selector}`;

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
      className={`${languageButtonClassName} ${placement === "inline" ? styles.inline : ""}`}
      onClick={() => setLanguage(nextLanguage)}
      type="button"
    >
      <Languages aria-hidden="true" className={styles.icon} strokeWidth={2} />
    </Button>
  );
}
