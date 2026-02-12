export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: Date;
    sources?: DocumentSource[];
}

export interface DocumentSource {
    documentId: string;
    documentTitle: string;
    excerpt: string;
    pageNumber?: number;
    relevanceScore?: number;
}

export interface ChatSession {
    id: string;
    userId: string;
    title: string;
    messages: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}
