import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthGateway } from "@/modules/auth/application/auth-gateway";
import { AuthScreen } from "@/modules/auth/presentation/auth-route";
import { i18n } from "@/app/i18n/i18n";
import { ApplicationI18nProvider } from "@/shared/i18n/application-i18n";

beforeEach(async () => {
  await i18n.changeLanguage("zh-CN");
});

describe("AuthScreen", () => {
  it("logs in and renders the authenticated identity", async () => {
    const user = {
      createdAt: "2026-07-24T11:00:00Z",
      displayName: "管理员",
      email: "admin@example.test",
      id: "d9428888-122b-11e1-b85c-61cd3cbb3210",
      role: "super_admin" as const,
    };
    const login = vi.fn().mockResolvedValue(user);
    const gateway: AuthGateway = {
      login,
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(user),
      restoreSession: vi.fn().mockResolvedValue(null),
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <ApplicationI18nProvider>
        <QueryClientProvider client={queryClient}>
          <AuthScreen gateway={gateway} />
        </QueryClientProvider>
      </ApplicationI18nProvider>,
    );

    await screen.findByRole("heading", { name: "登录账号" });
    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: user.email },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "local-admin-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "你好，管理员" }),
      ).toBeTruthy(),
    );
    expect(login).toHaveBeenCalledWith({
      email: user.email,
      password: "local-admin-password",
    });
    expect(screen.getByText("超级管理员")).toBeTruthy();
  });
});
