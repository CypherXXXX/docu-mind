import { inngest } from "./client";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> = require("pdf-parse");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 500;

function sanitizeText(raw: string): string {
    return raw
        .replace(/\0/g, "")
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/\uFFFD/g, "")
        .replace(/[\uFFF0-\uFFFF]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function splitTextIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length);
        let chunkEnd = end;
        if (end < text.length) {
            const lastNewline = text.lastIndexOf("\n", end);
            const lastPeriod = text.lastIndexOf(". ", end);
            const lastSpace = text.lastIndexOf(" ", end);
            if (lastNewline > start + CHUNK_SIZE * 0.5) chunkEnd = lastNewline + 1;
            else if (lastPeriod > start + CHUNK_SIZE * 0.5) chunkEnd = lastPeriod + 2;
            else if (lastSpace > start + CHUNK_SIZE * 0.5) chunkEnd = lastSpace + 1;
        }
        chunks.push(text.slice(start, chunkEnd).trim());
        start = chunkEnd - CHUNK_OVERLAP;
        if (start < 0) start = 0;
        if (chunkEnd >= text.length) break;
    }
    return chunks.filter((c) => c.length > 0);
}

async function extractPdfText(buffer: Buffer): Promise<{ text: string; numPages: number }> {
    let rawText = "";
    let numPages = 1;

    try {
        const parsed = await pdfParse(buffer);
        rawText = parsed.text;
        numPages = parsed.numpages || 1;
    } catch {
        rawText = "";
    }

    if (!rawText || rawText.trim().length < 50) {
        try {
            const { createWorker } = await import("tesseract.js");
            const worker = await createWorker("eng");
            const { data: ocrData } = await worker.recognize(buffer);
            await worker.terminate();
            rawText = ocrData.text;
        } catch {
            rawText = "";
        }
    }

    return { text: rawText, numPages };
}

async function extractDocxText(buffer: Buffer): Promise<string> {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
}

interface SlideChunk {
    text: string;
    slideNumber: number;
}

async function extractPptxSlides(buffer: Buffer): Promise<SlideChunk[]> {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);

    const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
            const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
            return numA - numB;
        });

    const slides: SlideChunk[] = [];

    for (let i = 0; i < slideFiles.length; i++) {
        const xml = await zip.files[slideFiles[i]].async("text");
        const texts: string[] = [];
        const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
        let match;
        while ((match = regex.exec(xml)) !== null) {
            const text = match[1]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .trim();
            if (text) texts.push(text);
        }

        if (texts.length > 0) {
            slides.push({ text: `--- Slide ${i + 1} ---\n${texts.join(" ")}`, slideNumber: i + 1 });
        }
    }

    return slides;
}

export const processDocument = inngest.createFunction(
    {
        id: "process-document",
        retries: 2,
        onFailure: async ({ event }) => {
            const { docId } = event.data.event.data as { docId: string };
            const errorMsg = event.data.error?.message || "Unknown processing error";
            await getSupabaseAdmin()
                .from("documents")
                .update({ status: "failed", status_message: errorMsg })
                .eq("id", docId);
        },
    },
    { event: "app/doc.uploaded" },
    async ({ event, step }) => {
        const { docId, userId, filePath, fileName, fileType } = event.data;
        const supabase = getSupabaseAdmin();

        await step.run("update-status-processing", async () => {
            await supabase
                .from("documents")
                .update({ status: "processing" })
                .eq("id", docId);
        });

        const result = await step.run("download-parse-chunk", async () => {
            const { data, error } = await supabase.storage
                .from("user_uploads")
                .download(filePath);

            if (error || !data) {
                throw new Error(`Failed to download file: ${error?.message || "No data"}`);
            }

            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const type = fileType || fileName.split(".").pop()?.toLowerCase() || "pdf";

            if (type === "pptx") {
                const slides = await extractPptxSlides(buffer);
                if (slides.length === 0) {
                    throw new Error(`Could not extract text from "${fileName}". The PowerPoint presentation may be empty or corrupted.`);
                }
                const allText = sanitizeText(slides.map((s) => s.text).join("\n\n"));
                const chunks = splitTextIntoChunks(allText);

                const totalSlides = slides.length;
                const charsPerSlide = Math.ceil(allText.length / totalSlides);
                const chunkRows = chunks.map((text, i) => {
                    const midpoint = i * CHUNK_SIZE;
                    const slideNum = Math.min(Math.floor(midpoint / charsPerSlide) + 1, totalSlides);
                    return { text, slideNumber: slideNum };
                });

                return { chunks: chunkRows.map((c) => c.text), pageCount: totalSlides, isPptx: true, slideMap: chunkRows };
            }

            let rawText = "";
            let pageCount = 1;

            if (type === "docx") {
                rawText = await extractDocxText(buffer);
            } else {
                const pdf = await extractPdfText(buffer);
                rawText = pdf.text;
                pageCount = pdf.numPages;
            }

            if (!rawText || rawText.trim().length === 0) {
                const typeLabel = type === "docx" ? "Word document" : "PDF";
                throw new Error(`Could not extract text from "${fileName}". The ${typeLabel} may be empty or corrupted.`);
            }

            const cleanText = sanitizeText(rawText);
            const chunks = splitTextIntoChunks(cleanText);

            return { chunks, pageCount, isPptx: false, slideMap: null };
        });

        await step.run("save-chunks-and-metadata", async () => {
            await supabase
                .from("documents")
                .update({ page_count: result.pageCount })
                .eq("id", docId);

            const chunkRows = result.chunks.map((text: string, i: number) => ({
                document_id: docId,
                user_id: userId,
                chunk_index: i,
                content: text,
                page_number: result.isPptx && result.slideMap ? result.slideMap[i]?.slideNumber || 1 : null,
            }));

            for (let i = 0; i < chunkRows.length; i += BATCH_SIZE) {
                const batch = chunkRows.slice(i, i + BATCH_SIZE);
                const { error } = await supabase.from("document_chunks").insert(batch);
                if (error) {
                    throw new Error(`Failed to save chunks: ${error.message}`);
                }
            }
        });

        await step.run("generate-summary", async () => {
            const apiKey = process.env.GROQ_API_KEY;
            if (!apiKey) return;

            const combinedText = result.chunks.slice(0, 10).join("\n").slice(0, 5000);
            const groq = createGroq({ apiKey });

            const models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
            let summary: string | null = null;

            for (const modelName of models) {
                try {
                    const genResult = await generateText({
                        model: groq(modelName),
                        system:
                            "You are a document summarizer. Generate exactly 3 concise sentences that capture the key information of the document. Do not include any preamble — just output the 3 sentences directly.",
                        prompt: `Summarize this document:\n\n${combinedText}`,
                        maxOutputTokens: 200,
                        temperature: 0.3,
                    });
                    summary = genResult.text.trim();
                    if (summary) break;
                } catch {
                    continue;
                }
            }

            if (summary) {
                await supabase.from("documents").update({ summary }).eq("id", docId);
            }
        });

        await step.run("mark-completed", async () => {
            await supabase
                .from("documents")
                .update({ status: "completed", status_message: null })
                .eq("id", docId);
        });

        return { success: true, chunks: result.chunks.length, pageCount: result.pageCount, fileName };
    }
);
