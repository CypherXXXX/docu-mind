"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface ChatMessage {
    id: string;
    document_id: string;
    user_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export async function getChatMessages(documentId: string): Promise<ChatMessage[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("document_id", documentId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Failed to fetch chat messages:", error.message);
        return [];
    }

    // Secondary sort: put 'user' before 'assistant' when timestamps match
    const sorted = (data || []) as ChatMessage[];
    sorted.sort((a, b) => {
        const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        // user should come before assistant
        if (a.role === "user" && b.role === "assistant") return -1;
        if (a.role === "assistant" && b.role === "user") return 1;
        return 0;
    });

    // Deduplicate: remove consecutive messages with same role + content
    const deduped: ChatMessage[] = [];
    for (const msg of sorted) {
        const prev = deduped[deduped.length - 1];
        if (prev && prev.role === msg.role && prev.content === msg.content) continue;
        deduped.push(msg);
    }
    return deduped;
}

export async function saveChatMessage(
    documentId: string,
    role: "user" | "assistant",
    content: string
): Promise<{ success: boolean; id?: string }> {
    const { userId } = await auth();
    if (!userId) return { success: false };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from("chat_messages")
        .insert({
            document_id: documentId,
            user_id: userId,
            role,
            content,
        })
        .select("id")
        .single();

    if (error) {
        console.error("Failed to save chat message:", error.message);
        return { success: false };
    }

    return { success: true, id: data?.id };
}

export async function clearChatHistory(
    documentId: string
): Promise<{ success: boolean }> {
    const { userId } = await auth();
    if (!userId) return { success: false };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("document_id", documentId)
        .eq("user_id", userId);

    if (error) {
        console.error("Failed to clear chat history:", error.message);
        return { success: false };
    }

    return { success: true };
}

export interface ChatHistoryGroup {
    document_id: string;
    document_name: string;
    messages: ChatMessage[];
    last_message_at: string;
}

export async function getAllChatHistory(): Promise<ChatHistoryGroup[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const supabase = getSupabaseAdmin();

    // Fetch all chat messages for this user
    const { data: messages, error: msgError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (msgError) {
        console.error("Failed to fetch chat messages:", msgError.message);
        return [];
    }

    if (!messages || messages.length === 0) return [];

    // Secondary sort: put 'user' before 'assistant' when timestamps match
    messages.sort((a: { created_at: string; role: string }, b: { created_at: string; role: string }) => {
        const timeDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        if (a.role === "user" && b.role === "assistant") return -1;
        if (a.role === "assistant" && b.role === "user") return 1;
        return 0;
    });

    // Get unique document IDs
    const docIds = [...new Set(messages.map((m) => m.document_id))];

    // Fetch document names
    const { data: docs } = await supabase
        .from("documents")
        .select("id, file_name")
        .in("id", docIds);

    const docNameMap = new Map<string, string>();
    for (const doc of docs || []) {
        docNameMap.set(doc.id, doc.file_name);
    }

    // Group messages by document
    const groups = new Map<string, ChatHistoryGroup>();

    for (const row of messages) {
        const docId = row.document_id;
        if (!docId) continue;

        if (!groups.has(docId)) {
            groups.set(docId, {
                document_id: docId,
                document_name: docNameMap.get(docId) || "Unknown Document",
                messages: [],
                last_message_at: row.created_at,
            });
        }

        const group = groups.get(docId)!;
        group.messages.push({
            id: row.id,
            document_id: row.document_id,
            user_id: row.user_id,
            role: row.role,
            content: row.content,
            created_at: row.created_at,
        });
        group.last_message_at = row.created_at;
    }

    return Array.from(groups.values()).sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );
}
