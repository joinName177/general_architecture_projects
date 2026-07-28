import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthError } from "~/modules/auth/application/auth-gateway";
import type {
  AuthenticatedUser,
  AuthGateway,
} from "~/modules/auth/application/auth-gateway";
import { authMessages } from "~/modules/auth/presentation/auth-messages";
import { authenticatedHomeMessages } from "~/modules/auth/presentation/authenticated-home-messages";
import { AuthScreen } from "~/modules/auth/presentation/auth-route";
import { ApplicationI18nProvider } from "~/shared/i18n/application-i18n";
import { initializeI18n } from "~/shared/i18n/i18n";
import { languageMessages } from "~/shared/i18n/language-messages";
import { buildTranslationResources } from "~/shared/i18n/message-catalog";

const i18n = initializeI18n(
  buildTranslationResources({
    auth: authMessages,
    home: authenticatedHomeMessages,
    language: languageMessages,
  }),
);
const authenticatedUser: AuthenticatedUser = {
  createdAt: "2026-07-24T11:00:00Z",
  displayName: "管理员",
  email: "admin@example.test",
  id: "d9428888-122b-11e1-b85c-61cd3cbb3210",
  role: "super_admin",
};

beforeEach(async () => {
  await i18n.changeLanguage("zh-CN");
});

describe("AuthScreen", () => {
  it("logs in and renders the authenticated identity", async () => {
    const login = vi
      .fn<AuthGateway["login"]>()
      .mockResolvedValue(authenticatedUser);
    const gateway: AuthGateway = {
      login,
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(authenticatedUser),
      restoreSession: vi.fn().mockResolvedValue(null),
    };
    renderAuthScreen(gateway);

    await screen.findByRole("heading", { name: "登录账号" });
    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: authenticatedUser.email },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "local-admin-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "管理员，今天想一起解决什么？",
        }),
      ).toBeTruthy(),
    );
    expect(login).toHaveBeenCalledOnce();
    expect(login.mock.calls[0]?.[0]).toEqual({
      email: authenticatedUser.email,
      password: "local-admin-password",
    });
    expect(login.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
    const sendButton = screen.getByRole("button", { name: "发送消息" });
    expect(sendButton.getAttribute("disabled")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("向智能体发送消息"), {
      target: { value: "帮我规划今天的工作" },
    });
    const fastModel = screen.getByRole("radio", { name: "快速模型" });
    fireEvent.click(fastModel);
    expect(fastModel.matches(":checked")).toBe(true);
    expect(sendButton.getAttribute("disabled")).toBeNull();
    fireEvent.click(sendButton);
    expect(screen.getByText(/对话能力将在下一阶段接入/u)).toBeTruthy();
  });

  it("shows invalid credentials as a handled form message", async () => {
    const gateway: AuthGateway = {
      login: vi.fn().mockRejectedValue(new AuthError("INVALID_CREDENTIALS")),
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(authenticatedUser),
      restoreSession: vi.fn().mockResolvedValue(null),
    };
    renderAuthScreen(gateway);

    await screen.findByRole("heading", { name: "登录账号" });
    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: authenticatedUser.email },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "incorrect-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByText("邮箱或密码不正确。")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "登录账号" })).toBeTruthy();
  });
});

describe("AuthScreen logout", () => {
  it("returns to the anonymous state when remote logout fails", async () => {
    const logout = vi.fn().mockRejectedValue(new AuthError("UNAVAILABLE"));
    const gateway: AuthGateway = {
      login: vi.fn().mockResolvedValue(authenticatedUser),
      logout,
      register: vi.fn().mockResolvedValue(authenticatedUser),
      restoreSession: vi.fn().mockResolvedValue(authenticatedUser),
    };
    renderAuthScreen(gateway);

    await screen.findByRole("heading", {
      name: "管理员，今天想一起解决什么？",
    });
    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));

    await screen.findByRole("heading", { name: "登录账号" });
    expect(logout).toHaveBeenCalledOnce();
  });
});

describe("AuthScreen cancellation", () => {
  it("aborts an active login when the screen is unmounted", async () => {
    let loginSignal: AbortSignal | undefined;
    const pendingLogin: AuthGateway["login"] = (_command, options) =>
      new Promise<AuthenticatedUser>(() => {
        loginSignal = options?.signal;
      });
    const login = vi.fn(pendingLogin);
    const gateway: AuthGateway = {
      login,
      logout: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockRejectedValue(new Error("Not used.")),
      restoreSession: vi.fn().mockResolvedValue(null),
    };
    const rendered = renderAuthScreen(gateway);
    await screen.findByRole("heading", { name: "登录账号" });
    fireEvent.change(screen.getByLabelText("邮箱"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "local-admin-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));
    await waitFor(() => expect(loginSignal).toBeDefined());

    rendered.unmount();

    expect(loginSignal?.aborted).toBe(true);
  });
});

function renderAuthScreen(gateway: AuthGateway) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <ApplicationI18nProvider>
      <QueryClientProvider client={queryClient}>
        <AuthScreen gateway={gateway} />
      </QueryClientProvider>
    </ApplicationI18nProvider>,
  );
}
