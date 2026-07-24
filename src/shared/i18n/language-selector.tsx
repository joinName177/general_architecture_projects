import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useApplicationI18n } from "@/shared/i18n/application-i18n";
import { isSupportedLanguage, languageOptions } from "@/shared/i18n/language";

export function LanguageSelector() {
  const { t } = useTranslation();
  const { language, setLanguage } = useApplicationI18n();

  return (
    <label className="language-selector">
      <Languages aria-hidden="true" size={18} strokeWidth={2} />
      <span>{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        value={language}
        onChange={(event) => {
          if (isSupportedLanguage(event.target.value)) {
            setLanguage(event.target.value);
          }
        }}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
