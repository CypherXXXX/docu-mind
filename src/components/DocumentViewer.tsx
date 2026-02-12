"use client";

import { useState } from "react";
import { FileText, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
    fileUrl: string;
    fileName: string;
    className?: string;
}

function getFileExtension(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    return ext;
}

function getViewerUrl(fileUrl: string, ext: string): string {
    if (ext === "pdf") {
        return `${fileUrl}#toolbar=1&navpanes=0`;
    }
    return `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}

function getFormatLabel(ext: string): string {
    switch (ext) {
        case "pdf":
            return "PDF";
        case "docx":
        case "doc":
            return "Word Document";
        case "pptx":
        case "ppt":
            return "PowerPoint";
        default:
            return "Document";
    }
}

export function DocumentViewer({ fileUrl, fileName, className }: DocumentViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const ext = getFileExtension(fileName);
    const viewerUrl = getViewerUrl(fileUrl, ext);
    const formatLabel = getFormatLabel(ext);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={cn("relative flex flex-col rounded-xl overflow-hidden border border-border/40 bg-card/30", className)}>
            {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        Loading {formatLabel}...
                    </p>
                </div>
            )}

            {hasError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background/90 backdrop-blur-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground mb-1">
                            Unable to load {formatLabel}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                            The document preview could not be loaded. Try opening it directly.
                        </p>
                    </div>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in new tab
                    </a>
                </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-card/50">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{fileName}</span>
                <span className="ml-auto text-[10px] font-medium text-muted-foreground/60 uppercase">{ext}</span>
            </div>

            <iframe
                src={viewerUrl}
                title={`Preview of ${fileName}`}
                className="flex-1 w-full border-0"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
