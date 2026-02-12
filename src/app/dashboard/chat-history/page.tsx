import { getAllChatHistory } from "@/lib/actions/chat";
import { ChatHistoryClient } from "./ChatHistoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ChatHistoryPage() {
    const chatHistory = await getAllChatHistory();

    return <ChatHistoryClient history={chatHistory} />;
}
