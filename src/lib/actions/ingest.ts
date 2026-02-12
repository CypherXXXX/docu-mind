"use server";

import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { inngest } from "@/inngest/client";
import type { IngestResponse } from "@/types/documents";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ACCEPTED_MIME_TYPES: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

function getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || "";
}

function isAcceptedFile(file: File): boolean {
    if (ACCEPTED_MIME_TYPES[file.type]) return true;
    const ext = getFileExtension(file.name);
    return ext === "pdf" || ext === "docx" || ext === "pptx";
}

function resolveFileType(file: File): string {
    if (ACCEPTED_MIME_TYPES[file.type]) return ACCEPTED_MIME_TYPES[file.type];
    return getFileExtension(file.name);
}

export async function ingestDocument(
    formData: FormData
): Promise<IngestResponse> {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, message: "You must be signed in to upload." };
    }

    const file = formData.get("file") as File | null;

    if (!file) {
        return { success: false, message: "No file was provided." };
    }

    if (!isAcceptedFile(file)) {
        return {
            success: false,
            message: "Only PDF, Word (.docx), and PowerPoint (.pptx) files are supported.",
        };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            success: false,
            message: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`,
        };
    }

    const fileType = resolveFileType(file);

    try {
        const supabase = getSupabaseAdmin();

        const { data: existingDocs } = await supabase
            .from("documents")
            .select("id, file_name")
            .eq("user_id", userId)
            .eq("file_name", file.name)
            .limit(1);

        if (existingDocs && existingDocs.length > 0) {
            return {
                success: false,
                message: `A file named "${file.name}" has already been uploaded. Please rename the file or delete the existing one first.`,
            };
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueName = `${randomUUID()}_${safeName}`;
        const storagePath = `${userId}/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
            .from("user_uploads")
            .upload(storagePath, fileBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            return { success: false, message: `Upload failed: ${uploadError.message}` };
        }

        const {
            data: { publicUrl },
        } = supabase.storage.from("user_uploads").getPublicUrl(storagePath);

        const { data: dbRecord, error: dbError } = await supabase
            .from("documents")
            .insert({
                user_id: userId,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
                file_path: storagePath,
                status: "queued",
            })
            .select("id")
            .single();

        if (dbError || !dbRecord) {
            await supabase.storage.from("user_uploads").remove([storagePath]);
            return {
                success: false,
                message: `Database error: ${dbError?.message || "Unknown"}`,
            };
        }

        await inngest.send({
            name: "app/doc.uploaded",
            data: {
                docId: dbRecord.id,
                userId,
                filePath: storagePath,
                fileName: file.name,
                fileType,
            },
        });

        revalidatePath("/dashboard");

        const typeLabel = fileType === "pdf" ? "PDF" : fileType === "docx" ? "Word document" : "PowerPoint";
        return {
            success: true,
            message: `"${file.name}" (${typeLabel}) queued for processing!`,
            docId: dbRecord.id,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred during upload.",
        };
    }
}
