import { notFound } from "next/navigation";
import { getDocument, getDocumentChunkCount, updateLastOpened } from "@/lib/actions/documents";
import { getChatMessages } from "@/lib/actions/chat";
import { DocumentView } from "./DocumentView";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ docId: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
    const { docId } = await params;

    const [document, chunkCount, chatHistory] = await Promise.all([
        getDocument(docId),
        getDocumentChunkCount(docId),
        getChatMessages(docId),
    ]);

    if (!document) {
        notFound();
    }

    updateLastOpened(docId);

    return (
        <DocumentView
            document={document}
            chunkCount={chunkCount}
            initialMessages={chatHistory.map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
            }))}
        />
    );
}
