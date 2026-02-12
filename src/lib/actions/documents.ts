"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SupabaseDocument } from "@/types/documents";

export async function getDocuments(): Promise<SupabaseDocument[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const { data, error } = await getSupabaseAdmin()
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[getDocuments] Error:", error);
        return [];
    }

    return (data as SupabaseDocument[]) ?? [];
}

export async function getDocument(docId: string): Promise<SupabaseDocument | null> {
    const { userId } = await auth();
    if (!userId) return null;

    const { data, error } = await getSupabaseAdmin()
        .from("documents")
        .select("*")
        .eq("id", docId)
        .eq("user_id", userId)
        .single();

    if (error || !data) return null;
    return data as SupabaseDocument;
}

export async function getDocumentChunkCount(docId: string): Promise<number> {
    const { userId } = await auth();
    if (!userId) return 0;

    const { count, error } = await getSupabaseAdmin()
        .from("document_chunks")
        .select("id", { count: "exact", head: true })
        .eq("document_id", docId)
        .eq("user_id", userId);

    if (error || count === null) return 0;
    return count;
}

export interface StorageUsage {
    usedBytes: number;
    totalBytes: number;
}

export async function getStorageUsage(): Promise<StorageUsage> {
    const TOTAL_STORAGE_BYTES = 100 * 1024 * 1024;

    const { userId } = await auth();
    if (!userId) return { usedBytes: 0, totalBytes: TOTAL_STORAGE_BYTES };

    const { data, error } = await getSupabaseAdmin()
        .from("documents")
        .select("file_size")
        .eq("user_id", userId);

    if (error || !data) return { usedBytes: 0, totalBytes: TOTAL_STORAGE_BYTES };

    const usedBytes = data.reduce((sum, row) => sum + (row.file_size || 0), 0);
    return { usedBytes, totalBytes: TOTAL_STORAGE_BYTES };
}

interface ActionResponse {
    success: boolean;
    message: string;
}

export async function deleteDocument(docId: string): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "You must be signed in." };

    try {
        const supabase = getSupabaseAdmin();

        const { data: doc, error: fetchError } = await supabase
            .from("documents")
            .select("*")
            .eq("id", docId)
            .eq("user_id", userId)
            .single();

        if (fetchError || !doc) {
            return { success: false, message: "Document not found or access denied." };
        }

        const storagePath = extractStoragePath(doc.file_url, userId);
        if (storagePath) {
            await supabase.storage.from("user_uploads").remove([storagePath]);
        }

        const { error: deleteError } = await supabase
            .from("documents")
            .delete()
            .eq("id", docId)
            .eq("user_id", userId);

        if (deleteError) {
            return { success: false, message: `Failed to delete: ${deleteError.message}` };
        }

        revalidatePath("/dashboard");
        return { success: true, message: "Document deleted successfully." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}

export async function archiveDocument(docId: string): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const { error } = await getSupabaseAdmin()
        .from("documents")
        .update({ is_archived: true })
        .eq("id", docId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: "Document archived." };
}

export async function restoreDocument(docId: string): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const { error } = await getSupabaseAdmin()
        .from("documents")
        .update({ is_archived: false })
        .eq("id", docId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: "Document restored." };
}

export async function toggleStar(docId: string, starred: boolean): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const { error } = await getSupabaseAdmin()
        .from("documents")
        .update({ is_starred: starred })
        .eq("id", docId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: starred ? "Starred!" : "Unstarred." };
}

export async function renameDocument(docId: string, newName: string): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const trimmed = newName.trim();
    if (!trimmed) return { success: false, message: "Name cannot be empty." };

    const { error } = await getSupabaseAdmin()
        .from("documents")
        .update({ file_name: trimmed })
        .eq("id", docId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: "Document renamed." };
}

import type { Project } from "@/types/documents";

export async function getProjects(): Promise<Project[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const supabase = getSupabaseAdmin();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error || !projects) return [];

    const { data: counts } = await supabase
        .from("documents")
        .select("project_id")
        .eq("user_id", userId)
        .not("project_id", "is", null);

    const countMap: Record<string, number> = {};
    if (counts) {
        for (const row of counts) {
            const pid = row.project_id as string;
            countMap[pid] = (countMap[pid] || 0) + 1;
        }
    }

    return projects.map((p) => ({
        ...p,
        doc_count: countMap[p.id] || 0,
    })) as Project[];
}

export async function createProject(name: string): Promise<{ success: boolean; message: string; project?: Project }> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: "Name cannot be empty." };

    const { data, error } = await getSupabaseAdmin()
        .from("projects")
        .insert({ user_id: userId, name: trimmed })
        .select()
        .single();

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: "Project created.", project: data as Project };
}

export async function deleteProject(projectId: string): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const supabase = getSupabaseAdmin();

    await supabase
        .from("documents")
        .update({ project_id: null })
        .eq("project_id", projectId)
        .eq("user_id", userId);

    const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: "Project deleted." };
}

export async function moveToProject(docId: string, projectId: string | null): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    const { error } = await getSupabaseAdmin()
        .from("documents")
        .update({ project_id: projectId })
        .eq("id", docId)
        .eq("user_id", userId);

    if (error) return { success: false, message: error.message };
    revalidatePath("/dashboard");
    return { success: true, message: projectId ? "Moved to project." : "Removed from project." };
}

export async function updateLastOpened(docId: string): Promise<void> {
    const { userId } = await auth();
    if (!userId) return;

    await getSupabaseAdmin()
        .from("documents")
        .update({ last_opened_at: new Date().toISOString() })
        .eq("id", docId)
        .eq("user_id", userId);
}

export async function deleteAllDocuments(): Promise<ActionResponse> {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Not signed in." };

    try {
        const supabase = getSupabaseAdmin();

        const { data: docs } = await supabase
            .from("documents")
            .select("file_url")
            .eq("user_id", userId);

        if (docs && docs.length > 0) {
            const paths = docs
                .map((d) => extractStoragePath(d.file_url, userId))
                .filter(Boolean) as string[];

            if (paths.length > 0) {
                await supabase.storage.from("user_uploads").remove(paths);
            }
        }

        const { error } = await supabase
            .from("documents")
            .delete()
            .eq("user_id", userId);

        if (error) return { success: false, message: error.message };

        await supabase.from("projects").delete().eq("user_id", userId);

        revalidatePath("/dashboard");
        return { success: true, message: "All documents deleted." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }
}

function extractStoragePath(fileUrl: string, userId: string): string | null {
    try {
        const marker = "user_uploads/";
        const idx = fileUrl.indexOf(marker);
        if (idx !== -1) return fileUrl.substring(idx + marker.length);
        const userIdx = fileUrl.indexOf(userId);
        if (userIdx !== -1) return fileUrl.substring(userIdx);
        return null;
    } catch {
        return null;
    }
}
