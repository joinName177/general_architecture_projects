import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { defaultLanguage, detectBrowserLanguage } from "~/shared/i18n/language";
import type { TranslationResources } from "~/shared/i18n/message-catalog";

export function initializeI18n(resources: TranslationResources) {
  void i18n.use(initReactI18next).init({
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
    lng: detectBrowserLanguage(),
    resources,
    supportedLngs: Object.keys(resources),
  });
  return i18n;
}
