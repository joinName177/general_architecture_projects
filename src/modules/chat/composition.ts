import type { ChatGateway } from "~/modules/chat/application/chat-gateway";
import { HttpChatGateway } from "~/modules/chat/infrastructure/http-chat-gateway";
import type { HttpClient } from "~/shared/http/http-client";

export function createChatGateway(httpClient: HttpClient): ChatGateway {
  return new HttpChatGateway(httpClient);
}
