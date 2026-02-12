export function getFileTypeLabel(fileType: string): string {
    const lower = fileType.toLowerCase();
    if (lower.includes("pdf")) return "PDF";
    if (lower.includes("presentationml") || lower.includes("pptx") || lower.includes("ppt")) return "PPTX";
    if (lower.includes("wordprocessingml") || lower.includes("msword") || lower === "docx") return "Word";
    return "DOC";
}

export function getFileTypeFromName(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    switch (ext) {
        case "pdf":
            return "PDF";
        case "docx":
        case "doc":
            return "Word";
        case "pptx":
        case "ppt":
            return "PPTX";
        default:
            return "DOC";
    }
}

export function getFileTypeColor(label: string): string {
    switch (label) {
        case "PDF":
            return "bg-rose-500/10 text-rose-500 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-rose-500/25";
        case "Word":
            return "bg-blue-500/10 text-blue-600 ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/25";
        case "PPTX":
            return "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/25";
        default:
            return "bg-secondary/50 text-muted-foreground ring-border dark:bg-white/5 dark:ring-white/10";
    }
}

export function getFileTypeSortOrder(fileType: string): number {
    const label = getFileTypeLabel(fileType);
    switch (label) {
        case "PDF":
            return 0;
        case "Word":
            return 1;
        case "PPTX":
            return 2;
        default:
            return 3;
    }
}
