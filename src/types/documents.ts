export type DocumentStatus = "queued" | "processing" | "completed" | "failed";

export interface SupabaseDocument {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_size: number;
    file_type: string;
    file_path?: string | null;
    created_at: string;
    updated_at: string;
    summary?: string | null;
    status?: DocumentStatus | null;
    status_message?: string | null;
    page_count?: number | null;
    is_archived?: boolean;
    is_starred?: boolean;
    project_id?: string | null;
    last_opened_at?: string | null;
}

export interface DocumentChunk {
    id: string;
    document_id: string;
    user_id: string;
    chunk_index: number;
    content: string;
    page_number?: number | null;
    created_at: string;
}

export interface Project {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    doc_count?: number;
}

export interface IngestResponse {
    success: boolean;
    message: string;
    docId?: string;
}
