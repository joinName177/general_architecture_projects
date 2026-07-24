import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import type { PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { defaultLanguage, isSupportedLanguage } from "~/shared/i18n/language";
import type { SupportedLanguage } from "~/shared/i18n/language";

interface ApplicationI18n {
  readonly formatDate: (
    date: Date,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  readonly formatNumber: (
    value: number,
    options?: Intl.NumberFormatOptions,
  ) => string;
  readonly language: SupportedLanguage;
  readonly setLanguage: (language: SupportedLanguage) => void;
}

const ApplicationI18nContext = createContext<ApplicationI18n | undefined>(
  undefined,
);

export function ApplicationI18nProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const language = isSupportedLanguage(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : defaultLanguage;
  const setLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      void i18n.changeLanguage(nextLanguage);
    },
    [i18n],
  );
  const formatDate = useCallback(
    (date: Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(language, options).format(date),
    [language],
  );
  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(language, options).format(value),
    [language],
  );
  const contextValue = useMemo(
    () => ({ formatDate, formatNumber, language, setLanguage }),
    [formatDate, formatNumber, language, setLanguage],
  );

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previousLanguage;
    };
  }, [language]);

  return (
    <ApplicationI18nContext value={contextValue}>
      {children}
    </ApplicationI18nContext>
  );
}

export function useApplicationI18n(): ApplicationI18n {
  const applicationI18n = useContext(ApplicationI18nContext);
  if (applicationI18n === undefined) {
    throw new Error("Application i18n provider is unavailable.");
  }
  return applicationI18n;
}
