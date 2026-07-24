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
        apiBaseUrl: "http://127.0.0.1:3000/api/v1",
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
        accessToken: "a".repeat(40),
        expiresAt: "2026-07-24T12:00:00Z",
        user: authenticatedUser,
      },
    });
  });
  await page.route("**/api/v1/auth/logout", async (route) => {
    await route.fulfill({ status: 204 });
  });

  await page.goto("/");
  await page.getByLabel("Email").fill(authenticatedUser.email);
  await page.getByLabel("Password").fill("local-admin-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("heading", { name: "Hello, Admin User" }),
  ).toBeVisible();
  await expect(page.getByText("Super administrator")).toBeVisible();

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

async function fulfillApiError(
  route: Route,
  status: number,
  code: string,
): Promise<void> {
  await route.fulfill({
    json: {
      code,
      message: "Authentication required.",
      requestId: "e2e-request",
    },
    status,
  });
}
