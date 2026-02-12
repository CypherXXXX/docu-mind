"use server";

import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function generateSummary(docId: string): Promise<void> {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) return;

        const supabase = getSupabaseAdmin();

        const { data: chunks, error: chunksError } = await supabase
            .from("document_chunks")
            .select("content, chunk_index")
            .eq("document_id", docId)
            .order("chunk_index", { ascending: true })
            .limit(10);

        if (chunksError || !chunks || chunks.length === 0) return;

        const combinedText = chunks.map((c) => c.content).join("\n").slice(0, 5000);
        const groq = createGroq({ apiKey });

        const models = [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "gemma2-9b-it",
        ];

        let summary: string | null = null;

        for (const modelName of models) {
            try {
                const result = await generateText({
                    model: groq(modelName),
                    system:
                        "You are a document summarizer. Generate exactly 3 concise sentences that capture the key information of the document. Do not include any preamble — just output the 3 sentences directly.",
                    prompt: `Summarize this document:\n\n${combinedText}`,
                    maxOutputTokens: 200,
                    temperature: 0.3,
                });

                summary = result.text.trim();
                if (summary) break;
            } catch {
                continue;
            }
        }

        if (!summary) return;

        const { error: updateError } = await supabase
            .from("documents")
            .update({ summary })
            .eq("id", docId);

        if (updateError) {
            console.error("[summarize] Failed to save summary:", updateError.message);
        }
    } catch (err) {
        console.error("[summarize] Unexpected error:", err);
    }
}
