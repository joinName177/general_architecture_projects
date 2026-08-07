import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Route } from "@playwright/test";

import {
  apiContractId,
  apiContractSha256,
} from "../src/generated/dify-agent-api/contract.gen";

const authenticatedUser = {
  createdAt: "2026-07-24T11:00:00Z",
  displayName: "Admin User",
  email: "admin@example.test",
  id: "d9428888-122b-11e1-b85c-61cd3cbb3210",
  role: "super_admin",
} as const;

test.beforeEach(async ({ page }) => {
  await page.route("**/runtime-config.json", async (route) => {
    await route.fulfill({
      json: {
        apiBaseUrl: "http://127.0.0.1:3000",
        apiContractId,
        apiContractSha256,
        releaseId: "e2e",
      },
    });
  });
  await page.route("**/api/v1/auth/refresh", async (route) => {
    await fulfillApiError(route, 401, "INVALID_SESSION");
  });
});

test("should complete login and logout through the browser", async ({
  page,
}) => {
  await page.route("**/api/v1/auth/login", async (route) => {
    await route.fulfill({
      json: {
        code: 200,
        data: {
          accessToken: "a".repeat(40),
          expiresAt: "2026-07-24T12:00:00Z",
          user: authenticatedUser,
        },
        message: "Authentication succeeded.",
        requestId: "e2e-login-request",
      },
    });
  });
  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({
      json: {
        code: 200,
        data: { revoked: true },
        message: "Session revoked.",
        requestId: "e2e-logout-request",
      },
    });
  });
  await page.route("**/api/v1/agent/chat", async (route) => {
    await route.fulfill({
      body: [
        'data: {"type":"text_delta","content":"Hello from the agent"}',
        "",
        'data: {"type":"done"}',
        "",
        "data: [DONE]",
        "",
      ].join("\n"),
      contentType: "text/event-stream",
      status: 200,
    });
  });

  await page.goto("/");
  await page.getByLabel("Email").fill(authenticatedUser.email);
  await page.getByLabel("Password").fill("local-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("button", { name: "Open agent chat" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open agent chat" }).click();
  await expect(page.getByRole("button", { name: "Open agent chat" })).toHaveCSS(
    "opacity",
    "0",
  );
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  await page.getByLabel("Type your message").fill("Plan my next task");
  await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  await page.getByRole("button", { name: "Model" }).click();
  await page.getByRole("option", { name: "Pro" }).click();
  await expect(page.getByRole("button", { name: "Model" })).toContainText(
    "Pro",
  );
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Hello from the agent")).toBeVisible();

  const homeAccessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(homeAccessibilityResults.violations).toEqual([]);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("should expose no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityResults.violations).toEqual([]);
});

test("should render the calm precision canvas palette", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  const canvasBackgroundImage = await page
    .locator("main")
    .evaluate((main) =>
      getComputedStyle(main).getPropertyValue("background-image"),
    );
  expect(canvasBackgroundImage).toContain("linear-gradient");
  await expect(page.getByLabel("Email")).toHaveCSS(
    "backdrop-filter",
    "saturate(1.25) blur(14px)",
  );
  await page.getByLabel("Email").focus();
  await expect(page.getByLabel("Email")).toHaveCSS(
    "border-top-color",
    "rgba(255, 255, 255, 0.72)",
  );
});

test("should render the technology-blue primary action palette", async ({
  page,
}) => {
  await page.goto("/");
  const primaryAction = page.getByRole("button", { name: "Sign in" });
  await expect(primaryAction).toHaveCSS("background-color", "rgb(0, 113, 227)");

  await primaryAction.hover();
  await expect(primaryAction).toHaveCSS("background-color", "rgb(0, 104, 212)");
});

test("should show invalid credentials without a runtime error", async ({
  page,
}) => {
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));
  await page.route("**/api/v1/auth/login", async (route) => {
    await fulfillApiError(route, 401, "INVALID_CREDENTIALS");
  });

  await page.goto("/");
  await page.getByLabel("Email").fill(authenticatedUser.email);
  await page.getByLabel("Password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByText("The email or password is incorrect."),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

async function fulfillApiError(
  route: Route,
  status: number,
  errorCode: string,
): Promise<void> {
  await route.fulfill({
    json: {
      code: status,
      errorCode,
      message: "Authentication required.",
      requestId: "e2e-request",
    },
    status,
  });
}
