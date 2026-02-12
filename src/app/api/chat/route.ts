import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

let _groq: ReturnType<typeof createGroq> | null = null;

function getGroq() {
    if (!_groq) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Missing env var: GROQ_API_KEY");
        }
        _groq = createGroq({ apiKey });
    }
    return _groq;
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages, docId } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Response.json({ error: "Messages array is required" }, { status: 400 });
        }

        if (!docId) {
            return Response.json({ error: "docId is required" }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        const { data: doc, error: docError } = await supabase
            .from("documents")
            .select("id, file_name")
            .eq("id", docId)
            .eq("user_id", userId)
            .single();

        if (docError || !doc) {
            return Response.json({ error: "Document not found or access denied" }, { status: 404 });
        }

        const { data: chunks, error: chunksError } = await supabase
            .from("document_chunks")
            .select("content, chunk_index")
            .eq("document_id", docId)
            .eq("user_id", userId)
            .order("chunk_index", { ascending: true });

        if (chunksError) {
            return Response.json({ error: "Failed to load document content" }, { status: 500 });
        }

        if (!chunks || chunks.length === 0) {
            return Response.json(
                { error: "No content found. The document may not have been processed yet." },
                { status: 404 }
            );
        }

        const MAX_CONTEXT_CHARS = 28_000;
        let context = "";
        for (const c of chunks) {
            if (context.length + c.content.length > MAX_CONTEXT_CHARS) break;
            context += c.content + "\n\n";
        }

        const systemPrompt = `You are DocuMind, an intelligent AI document assistant. You are chatting about the document: "${doc.file_name}".

RULES:
1. Answer based ONLY on the provided document content below. Do not use external knowledge.
2. If the answer is not found in the document, say: "I cannot find that information in this document."
3. Be concise, clear, and helpful.
4. Format your responses with markdown for readability.
5. When quoting from the document, use blockquotes.

DOCUMENT CONTENT:
${context}`;

        const models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "gemma2-9b-it",
        ];

        let lastError: unknown = null;

        const latestUserMessage = messages[messages.length - 1]?.content || "";

        for (const modelName of models) {
            try {
                const result = await generateText({
                    model: getGroq()(modelName),
                    system: systemPrompt,
                    messages,
                });

                // Persist both messages with explicit timestamps to guarantee order
                const now = new Date();
                const userTime = now.toISOString();
                const assistantTime = new Date(now.getTime() + 1000).toISOString();

                // Dedup check: skip insert if an identical user message was saved in the last 30 seconds
                const thirtySecsAgo = new Date(now.getTime() - 30000).toISOString();
                const { data: recentDups } = await supabase
                    .from("chat_messages")
                    .select("id")
                    .eq("document_id", docId)
                    .eq("user_id", userId)
                    .eq("role", "user")
                    .eq("content", latestUserMessage)
                    .gte("created_at", thirtySecsAgo)
                    .limit(1);

                if (!recentDups || recentDups.length === 0) {
                    const { error: insertError } = await supabase.from("chat_messages").insert([
                        { document_id: docId, user_id: userId, role: "user", content: latestUserMessage, created_at: userTime },
                        { document_id: docId, user_id: userId, role: "assistant", content: result.text, created_at: assistantTime },
                    ]);

                    if (insertError) {
                        console.error("Failed to save chat messages:", insertError.message, insertError.details, insertError.hint);
                    } else {
                        revalidatePath("/dashboard/chat-history");
                    }
                } else {
                    console.log("Skipped duplicate chat message insert");
                }

                return Response.json({ content: result.text });
            } catch (err: unknown) {
                lastError = err;
                const errMsg = err instanceof Error ? err.message : String(err);

                const isQuotaError =
                    errMsg.includes("429") ||
                    errMsg.includes("quota") ||
                    errMsg.includes("rate") ||
                    errMsg.includes("Too Many Requests");

                if (!isQuotaError) break;
                await new Promise((r) => setTimeout(r, 1000));
            }
        }

        const errorMsg =
            lastError instanceof Error
                ? lastError.message
                : "AI service is temporarily unavailable. Please try again in a minute.";

        return Response.json({ error: errorMsg }, { status: 429 });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error";
        return Response.json({ error: message }, { status: 500 });
    }
}
