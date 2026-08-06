import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedUser } from "~/modules/auth/application/auth-gateway";
import type { AuthGateway } from "~/modules/auth/application/auth-gateway";
import { AuthGatewayProvider } from "~/modules/auth/presentation/auth-gateway-context";
import type { ChatGateway } from "~/modules/chat/application/chat-gateway";
import type { StreamEvent } from "~/modules/chat/application/chat-gateway";
import { chatMessages } from "~/modules/chat/presentation/chat-messages";
import { ChatGatewayContext } from "~/modules/chat/presentation/chat-gateway-context";
import { ChatRoute } from "~/modules/chat/presentation/chat-route";
import { authMessages } from "~/modules/auth/presentation/auth-messages";
import { authenticatedHomeMessages } from "~/modules/auth/presentation/authenticated-home-messages";
import { ApplicationI18nProvider } from "~/shared/i18n/application-i18n";
import { initializeI18n } from "~/shared/i18n/i18n";
import { languageMessages } from "~/shared/i18n/language-messages";
import { buildTranslationResources } from "~/shared/i18n/message-catalog";

const i18n = initializeI18n(
  buildTranslationResources({
    auth: authMessages,
    chat: chatMessages,
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

describe("ChatRoute", () => {
  it("shows empty-response placeholder when the stream yields no content", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    async function* chatStream(): AsyncIterable<StreamEvent> {
      yield { type: "done" };
    }

    const chatGateway: ChatGateway = {
      chatStream: vi.fn().mockImplementation(chatStream),
    };
    renderChatRoute(chatGateway);

    await screen.findByRole("heading", { name: "智能体对话" });

    fireEvent.change(screen.getByLabelText("输入你的消息"), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(screen.getByText("未收到回复。")).toBeTruthy();
    });
  });

  it("renders the chat heading and empty state", async () => {
    const chatGateway: ChatGateway = {
      chatStream: vi.fn(),
    };
    renderChatRoute(chatGateway);

    await screen.findByRole("heading", { name: "智能体对话" });
    expect(screen.getByText("随便问点什么…")).toBeTruthy();
  });

  it("sends a message and displays the assistant reply", async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    async function* chatStream(): AsyncIterable<StreamEvent> {
      yield { type: "text_delta", content: "你好，" };
      yield { type: "text_delta", content: "有什么可以帮你的？" };
      yield { type: "done" };
    }

    const chatGateway: ChatGateway = {
      chatStream: vi.fn().mockImplementation(chatStream),
    };
    renderChatRoute(chatGateway);

    await screen.findByRole("heading", { name: "智能体对话" });

    const input = screen.getByLabelText("输入你的消息");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(screen.getByText("你好，有什么可以帮你的？")).toBeTruthy();
    });
  });

  it("stops streaming when the stop button is clicked", async () => {
    async function* chatStream(): AsyncIterable<StreamEvent> {
      yield { type: "text_delta", content: "Part 1" };
      // 保持流持续进行（永不 yield "done"），以便停止按钮保持可见
      await new Promise<void>(() => {});
    }

    const chatGateway: ChatGateway = {
      chatStream: vi.fn().mockImplementation(chatStream),
    };
    renderChatRoute(chatGateway);

    await screen.findByRole("heading", { name: "智能体对话" });

    fireEvent.change(screen.getByLabelText("输入你的消息"), {
      target: { value: "Hello" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => {
      expect(screen.getByText("Part 1")).toBeTruthy();
    });

    // Stop button should appear while streaming
    const stopButton = screen.getByRole("button", { name: "停止" });
    fireEvent.click(stopButton);
  });
});

function renderChatRoute(chatGateway: ChatGateway) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const authGateway: AuthGateway = {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    restoreSession: vi.fn().mockResolvedValue(authenticatedUser),
  };
  return render(
    <ApplicationI18nProvider>
      <QueryClientProvider client={queryClient}>
        <ChatGatewayContext.Provider value={chatGateway}>
          <AuthGatewayProvider gateway={authGateway}>
            <ChatRoute />
          </AuthGatewayProvider>
        </ChatGatewayContext.Provider>
      </QueryClientProvider>
    </ApplicationI18nProvider>,
  );
}
