import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { i18n } from "@/app/i18n/i18n";
import {
  ApplicationI18nProvider,
  useApplicationI18n,
} from "@/shared/i18n/application-i18n";
import { LanguageSelector } from "@/shared/i18n/language-selector";

beforeEach(async () => {
  await i18n.changeLanguage("zh-CN");
});

describe("ApplicationI18nProvider", () => {
  it("changes translations and the document language for the current session", async () => {
    render(
      <ApplicationI18nProvider>
        <LanguageSelector />
      </ApplicationI18nProvider>,
    );

    fireEvent.change(screen.getByLabelText("语言"), {
      target: { value: "en-GB" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Language")).toBeTruthy();
      expect(document.documentElement.lang).toBe("en-GB");
    });
  });

  it("formats dates and numbers with the active language", () => {
    const date = new Date("2026-07-24T00:00:00Z");
    render(
      <ApplicationI18nProvider>
        <FormattingProbe date={date} value={1234.5} />
      </ApplicationI18nProvider>,
    );

    expect(screen.getByTestId("formatted-date").textContent).toBe(
      new Intl.DateTimeFormat("zh-CN", { timeZone: "UTC" }).format(date),
    );
    expect(screen.getByTestId("formatted-number").textContent).toBe(
      new Intl.NumberFormat("zh-CN").format(1234.5),
    );
  });
});

function FormattingProbe({
  date,
  value,
}: {
  readonly date: Date;
  readonly value: number;
}) {
  const { formatDate, formatNumber } = useApplicationI18n();
  return (
    <>
      <output data-testid="formatted-date">
        {formatDate(date, { timeZone: "UTC" })}
      </output>
      <output data-testid="formatted-number">{formatNumber(value)}</output>
    </>
  );
}
