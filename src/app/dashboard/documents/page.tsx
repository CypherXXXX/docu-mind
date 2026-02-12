import { getDocuments, getStorageUsage, getProjects } from "@/lib/actions/documents";
import { DocumentsClient } from "./DocumentsClient";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
    const [documents, storageUsage, projects] = await Promise.all([
        getDocuments(),
        getStorageUsage(),
        getProjects(),
    ]);

    return (
        <DocumentsClient
            documents={documents}
            storageUsage={storageUsage}
            projects={projects}
        />
    );
}
