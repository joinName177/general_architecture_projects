import { createContext, useContext } from "react";
import type { ChatGateway } from "~/modules/chat/application/chat-gateway";

const ChatGatewayContext = createContext<ChatGateway | undefined>(undefined);

export function useChatGateway(): ChatGateway {
  const gateway = useContext(ChatGatewayContext);
  if (gateway === undefined)
    throw new Error("useChatGateway must be used inside ChatGatewayProvider");
  return gateway;
}

export { ChatGatewayContext };
