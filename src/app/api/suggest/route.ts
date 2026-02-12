import { auth } from "@clerk/nextjs/server";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { docId, summary } = await req.json();

        if (!docId || typeof docId !== "string") {
            return Response.json({ error: "docId is required" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return Response.json({
                questions: [
                    "What is the main topic of this document?",
                    "Summarize the key findings",
                    "What are the most important takeaways?",
                ],
            });
        }

        let contextText = "";
        if (summary) {
            contextText = summary;
        } else {
            const supabase = getSupabaseAdmin();
            const { data: chunks } = await supabase
                .from("document_chunks")
                .select("content")
                .eq("document_id", docId)
                .eq("user_id", userId)
                .order("chunk_index", { ascending: true })
                .limit(3);

            if (chunks && chunks.length > 0) {
                contextText = chunks.map((c) => c.content).join("\n").slice(0, 2000);
            }
        }

        if (!contextText) {
            return Response.json({
                questions: [
                    "What is this document about?",
                    "Summarize the key points",
                    "What are the main conclusions?",
                ],
            });
        }

        const groq = createGroq({ apiKey });

        const result = await generateText({
            model: groq("llama-3.1-8b-instant"),
            system:
                "Generate exactly 3 short, specific questions a user would want to ask about the following document content. Return ONLY the questions, one per line, with no numbering or prefixes.",
            prompt: contextText,
            maxOutputTokens: 150,
            temperature: 0.7,
        });

        const questions = result.text
            .split("\n")
            .map((q) => q.trim())
            .filter((q) => q.length > 5 && q.endsWith("?"))
            .slice(0, 3);

        while (questions.length < 3) {
            const defaults = [
                "What is the main topic of this document?",
                "What are the key findings?",
                "What conclusions can be drawn?",
            ];
            questions.push(defaults[questions.length]);
        }

        return Response.json({ questions });
    } catch {
        return Response.json({
            questions: [
                "What is this document about?",
                "Summarize the key points",
                "What are the main conclusions?",
            ],
        });
    }
}
