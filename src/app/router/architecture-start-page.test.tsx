import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import "@/shared/i18n/i18n";
import { ArchitectureStartPage } from "@/app/router/architecture-start-page";

describe("ArchitectureStartPage", () => {
  it("renders the architecture initialization status", () => {
    render(<ArchitectureStartPage />);

    expect(
      screen.getByRole("heading", { name: "中型前端架构基座已初始化" }),
    ).toBeTruthy();
  });
});
