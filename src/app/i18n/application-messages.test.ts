import { describe, expect, it } from "vitest";

import { applicationTranslationResources } from "~/app/i18n/application-messages";

describe("applicationTranslationResources", () => {
  it("composes module-owned messages under stable message ids", () => {
    expect(applicationTranslationResources["zh-CN"].translation).toMatchObject({
      auth: { login: { title: "登录账号" } },
      home: { modelLabel: "模型" },
      language: {
        switchToChinese: "切换到简体中文",
        switchToEnglish: "切换到英文",
      },
    });
    expect(applicationTranslationResources["en-GB"].translation).toMatchObject({
      auth: { login: { title: "Sign in" } },
      home: { modelLabel: "Model" },
      language: {
        switchToChinese: "Switch to Simplified Chinese",
        switchToEnglish: "Switch to English",
      },
    });
  });
});
