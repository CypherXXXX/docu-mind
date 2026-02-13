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

interface SearchResult {
    id: string;
    content: string;
    chunk_index: number;
    page_number: number | null;
    bm25_score: number;
    trigram_score: number;
    combined_score: number;
}

interface ChunkRow {
    content: string;
    chunk_index: number;
    page_number: number | null;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            .select("id, file_name, file_type, file_size, page_count, summary")
            .eq("id", docId)
            .eq("user_id", userId)
            .single();

        if (docError || !doc) {
            return Response.json({ error: "Document not found or access denied" }, { status: 404 });
        }

        const latestUserMessage = messages[messages.length - 1]?.content || "";

        const { data: allChunks, error: chunksError } = await supabase
            .from("document_chunks")
            .select("content, chunk_index, page_number")
            .eq("document_id", docId)
            .eq("user_id", userId)
            .order("chunk_index", { ascending: true });

        if (chunksError) {
            return Response.json({ error: "Failed to load document content" }, { status: 500 });
        }

        if (!allChunks || allChunks.length === 0) {
            return Response.json(
                { error: "No content found. The document may not have been processed yet." },
                { status: 404 }
            );
        }

        const chunks = allChunks as ChunkRow[];
        const totalChunks = chunks.length;
        const fileType = doc.file_type || "pdf";
        const isPptx = fileType === "pptx";
        const hasSlideNumbers = isPptx && chunks.some((c) => c.page_number && c.page_number > 0);

        let context = "";
        let usedHybridSearch = false;

        try {
            const { data: searchResults, error: searchError } = await supabase.rpc(
                "hybrid_search_chunks",
                {
                    query_text: latestUserMessage,
                    target_doc_id: docId,
                    target_user_id: userId,
                    match_count: 10,
                    bm25_weight: 1.0,
                    trigram_weight: 0.5,
                }
            );

            if (!searchError && searchResults && searchResults.length > 0) {
                const results = searchResults as SearchResult[];
                const contextParts: string[] = [];
                for (const r of results) {
                    if (hasSlideNumbers && r.page_number) {
                        contextParts.push(`[Slide ${r.page_number}]: ${r.content}`);
                    } else {
                        contextParts.push(r.content);
                    }
                }
                context = contextParts.join("\n\n");
                usedHybridSearch = true;
            }
        } catch {
            usedHybridSearch = false;
        }

        if (!context) {
            const MAX_CONTEXT_CHARS = 28_000;
            for (const c of chunks) {
                const entry = hasSlideNumbers && c.page_number
                    ? `[Slide ${c.page_number}]: ${c.content}`
                    : c.content;
                if (context.length + entry.length > MAX_CONTEXT_CHARS) break;
                context += entry + "\n\n";
            }
        }

        const docMeta = [
            `File: "${doc.file_name}"`,
            `Type: ${fileType.toUpperCase()}`,
            `Size: ${formatFileSize(doc.file_size || 0)}`,
            doc.page_count ? `Total ${isPptx ? "slides" : "pages"}: ${doc.page_count}` : null,
            `Indexed sections: ${totalChunks}`,
            doc.summary ? `Summary: ${doc.summary}` : null,
        ].filter(Boolean).join("\n");

        const slideInstructions = hasSlideNumbers
            ? "\n- For PPTX presentations, content is tagged with [Slide N]. Reference slide numbers when relevant."
            : "";

        const systemPrompt = `You are DocuMind, an expert AI document assistant. You have been given the complete indexed content of a document to answer questions about.

DOCUMENT INFO:
${docMeta}

YOUR GUIDELINES:
- Answer ONLY based on the document content provided below. Never use outside knowledge.
- If information is not found in the document, clearly state: "I couldn't find that information in this document."
- Be thorough but concise. Give complete answers without unnecessary filler.
- Use markdown formatting for readability: headers, bold, lists, code blocks as appropriate.
- When quoting directly from the document, use blockquotes (>).
- Structure longer answers with clear sections and bullet points.
- If the user asks about the document structure (e.g. number of pages, what it covers), use the DOCUMENT INFO above.${slideInstructions}
- Do NOT fabricate page numbers or section references. Only cite slide numbers if they appear in the content tags.
- Search method: ${usedHybridSearch ? "Hybrid (BM25 + keyword matching)" : "Full document scan"}

DOCUMENT CONTENT:
${context}`;

        const models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "gemma2-9b-it",
        ];

        let lastError: unknown = null;

        for (const modelName of models) {
            try {
                const result = await generateText({
                    model: getGroq()(modelName),
                    system: systemPrompt,
                    messages,
                });

                const now = new Date();
                const userTime = now.toISOString();
                const assistantTime = new Date(now.getTime() + 1000).toISOString();

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
