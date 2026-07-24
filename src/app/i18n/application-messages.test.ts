import { describe, expect, it } from "vitest";

import { applicationTranslationResources } from "~/app/i18n/application-messages";

describe("applicationTranslationResources", () => {
  it("composes module-owned messages under stable message ids", () => {
    expect(applicationTranslationResources["zh-CN"].translation).toMatchObject({
      auth: { login: { title: "登录账号" } },
      language: { label: "语言" },
    });
    expect(applicationTranslationResources["en-GB"].translation).toMatchObject({
      auth: { login: { title: "Sign in" } },
      language: { label: "Language" },
    });
  });
});
