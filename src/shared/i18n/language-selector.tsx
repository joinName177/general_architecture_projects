import { radioGroupVariants, radioVariants } from "@heroui/styles";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { useTranslation } from "react-i18next";

import { useApplicationI18n } from "~/shared/i18n/application-i18n";
import { isSupportedLanguage, languageOptions } from "~/shared/i18n/language";

import * as styles from "./language-selector.module.css";

const languageRadioStyles = radioVariants();

interface LanguageSelectorProps {
  readonly placement?: "floating" | "inline";
}

export function LanguageSelector({
  placement = "floating",
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useApplicationI18n();

  return (
    <RadioGroup
      aria-label={t("language.label")}
      className={`${radioGroupVariants()} ${styles.selector} ${placement === "inline" ? styles.inline : ""}`}
      orientation="horizontal"
      onChange={(nextLanguage) => {
        if (isSupportedLanguage(nextLanguage)) {
          setLanguage(nextLanguage);
        }
      }}
      value={language}
    >
      {languageOptions.map((option) => (
        <Radio
          className={`${languageRadioStyles.base()} ${styles.option}`}
          key={option.value}
          value={option.value}
        >
          <span className={languageRadioStyles.content()}>
            {t(option.labelKey)}
          </span>
        </Radio>
      ))}
    </RadioGroup>
  );
}
