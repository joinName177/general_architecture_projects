import type { SupportedLanguage } from "~/shared/i18n/language";

export interface LocalizedMessage {
  readonly "en-GB": string;
  readonly "zh-CN": string;
}

export interface MessageCatalog {
  readonly [messageKey: string]: LocalizedMessage | MessageCatalog;
}

export interface TranslationTree {
  readonly [messageKey: string]: string | TranslationTree;
}

export type TranslationResources = Readonly<
  Record<SupportedLanguage, { readonly translation: TranslationTree }>
>;

export function defineMessages<const Catalog extends MessageCatalog>(
  catalog: Catalog,
): Catalog {
  return catalog;
}

export function buildTranslationResources(
  catalog: MessageCatalog,
): TranslationResources {
  return {
    "en-GB": { translation: localizeCatalog(catalog, "en-GB") },
    "zh-CN": { translation: localizeCatalog(catalog, "zh-CN") },
  };
}

function localizeCatalog(
  catalog: MessageCatalog,
  language: SupportedLanguage,
): TranslationTree {
  const translation: Record<string, string | TranslationTree> = {};

  for (const [messageKey, messageValue] of Object.entries(catalog)) {
    translation[messageKey] = isLocalizedMessage(messageValue)
      ? messageValue[language]
      : localizeCatalog(messageValue, language);
  }
  return translation;
}

function isLocalizedMessage(
  value: LocalizedMessage | MessageCatalog,
): value is LocalizedMessage {
  return (
    typeof value["en-GB"] === "string" && typeof value["zh-CN"] === "string"
  );
}
