import { authMessages } from "~/modules/auth/presentation/auth-messages";
import { languageMessages } from "~/shared/i18n/language-messages";
import { buildTranslationResources } from "~/shared/i18n/message-catalog";

export const applicationTranslationResources = buildTranslationResources({
  auth: authMessages,
  language: languageMessages,
});
