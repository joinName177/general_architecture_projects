import { describe, expect, it } from "vitest";

import {
  buildTranslationResources,
  defineMessages,
} from "@/shared/i18n/message-catalog";

describe("message catalog", () => {
  it("builds locale resources from colocated messages", () => {
    const resources = buildTranslationResources({
      feature: defineMessages({
        greeting: {
          "en-GB": "Hello, {{name}}",
          "zh-CN": "你好，{{name}}",
        },
      }),
    });

    expect(resources["en-GB"].translation).toEqual({
      feature: { greeting: "Hello, {{name}}" },
    });
    expect(resources["zh-CN"].translation).toEqual({
      feature: { greeting: "你好，{{name}}" },
    });
  });
});
