import { radioGroupVariants, radioVariants } from "@heroui/styles";
import { Radio, RadioGroup } from "react-aria-components/RadioGroup";
import { useTranslation } from "react-i18next";

import { useApplicationI18n } from "@/shared/i18n/application-i18n";
import { isSupportedLanguage, languageOptions } from "@/shared/i18n/language";

import * as styles from "./language-selector.module.css";

const languageRadioStyles = radioVariants();

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useApplicationI18n();

  return (
    <RadioGroup
      aria-label={t("language.label")}
      className={`${radioGroupVariants()} ${styles.selector}`}
      onChange={(nextLanguage) => {
        if (isSupportedLanguage(nextLanguage)) {
          setLanguage(nextLanguage);
        }
      }}
      value={language}
    >
      {languageOptions.map((option) => (
        <Radio
          className={languageRadioStyles.base()}
          key={option.value}
          value={option.value}
        >
          <span className={languageRadioStyles.control()}>
            <span
              aria-hidden="true"
              className={languageRadioStyles.indicator()}
            />
          </span>
          <span className={languageRadioStyles.content()}>
            {t(option.labelKey)}
          </span>
        </Radio>
      ))}
    </RadioGroup>
  );
}
