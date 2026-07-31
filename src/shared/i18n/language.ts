export const supportedLanguages = ["zh-CN", "en-GB"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = "zh-CN";

export interface LocalizedName {
  readonly en?: string;
  readonly zh?: string;
}

export function isSupportedLanguage(
  value: unknown,
): value is SupportedLanguage {
  return supportedLanguages.some((language) => language === value);
}

export function matchSupportedLanguage(
  languageCode: string,
): SupportedLanguage | undefined {
  const normalizedCode = languageCode.toLowerCase();
  const exactMatch = supportedLanguages.find(
    (language) => language.toLowerCase() === normalizedCode,
  );

  if (exactMatch !== undefined) return exactMatch;
  const languagePrefix = normalizedCode.split("-")[0];
  return supportedLanguages.find((language) =>
    language.toLowerCase().startsWith(`${languagePrefix}-`),
  );
}

export function detectBrowserLanguage(
  browserLanguages: readonly string[] = typeof navigator === "undefined"
    ? []
    : navigator.languages,
): SupportedLanguage {
  for (const browserLanguage of browserLanguages) {
    const supportedLanguage = matchSupportedLanguage(browserLanguage);
    if (supportedLanguage !== undefined) return supportedLanguage;
  }
  return defaultLanguage;
}

export function getLocalizedName(
  name: LocalizedName | undefined,
  language: SupportedLanguage,
): string {
  return language === "zh-CN" ? (name?.zh ?? "") : (name?.en ?? "");
}
