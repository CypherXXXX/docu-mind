"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, FileText } from "lucide-react";

interface PdfViewerProps {
    fileUrl: string;
    fileName: string;
    className?: string;
}

export function PdfViewer({ fileUrl, fileName, className }: PdfViewerProps) {
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    const handleLoad = useCallback(() => {
        setStatus("ready");
    }, []);

    const handleError = useCallback(() => {
        setStatus("error");
    }, []);

    return (
        <div className={cn("relative flex flex-col h-full bg-card/30 rounded-xl overflow-hidden border border-border/50", className)}>
            {/* Loading overlay */}
            {status === "loading" && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Loading PDF...</p>
                </div>
            )}

            {/* Error state */}
            {status === "error" && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Failed to load PDF</p>
                    <p className="text-xs text-muted-foreground mb-4">The document may be unavailable</p>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Open in new tab
                    </a>
                </div>
            )}

            {/* PDF Header */}
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3 bg-card/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground truncate flex-1">{fileName}</span>
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                    Open ↗
                </a>
            </div>

            {/* PDF iframe */}
            <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                title={`Preview of ${fileName}`}
                className="flex-1 w-full border-0"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
