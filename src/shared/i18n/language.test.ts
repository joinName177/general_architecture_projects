import { describe, expect, it } from "vitest";

import {
  detectBrowserLanguage,
  getLocalizedName,
  matchSupportedLanguage,
} from "@/shared/i18n/language";

describe("language", () => {
  it("matches supported locales by exact code and language prefix", () => {
    expect(matchSupportedLanguage("en-GB")).toBe("en-GB");
    expect(matchSupportedLanguage("en-US")).toBe("en-GB");
    expect(matchSupportedLanguage("zh-Hans")).toBe("zh-CN");
  });

  it("uses the first supported browser language or the default", () => {
    expect(detectBrowserLanguage(["fr-FR", "en-US"])).toBe("en-GB");
    expect(detectBrowserLanguage(["fr-FR"])).toBe("zh-CN");
  });

  it("selects localized names without introducing UI message literals", () => {
    const name = { en: "Agent", zh: "智能体" };
    expect(getLocalizedName(name, "zh-CN")).toBe("智能体");
    expect(getLocalizedName(name, "en-GB")).toBe("Agent");
  });
});
