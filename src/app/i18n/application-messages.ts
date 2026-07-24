import { authMessages } from "~/modules/auth/presentation/auth-messages";
import { authenticatedHomeMessages } from "~/modules/auth/presentation/authenticated-home-messages";
import { languageMessages } from "~/shared/i18n/language-messages";
import { buildTranslationResources } from "~/shared/i18n/message-catalog";

export const applicationTranslationResources = buildTranslationResources({
  auth: authMessages,
  home: authenticatedHomeMessages,
  language: languageMessages,
});
