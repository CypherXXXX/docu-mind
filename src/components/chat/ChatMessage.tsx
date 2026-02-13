"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface ChatSource {
    pageNumber: number;
    excerpt: string;
    score: number;
}

interface ChatMessageProps {
    content: string;
    role: "user" | "assistant";
    sources?: ChatSource[];
}

export function ChatMessage({ content, role, sources }: ChatMessageProps) {
    if (role === "user") {
        return <span>{content}</span>;
    }

    return (
        <div className="space-y-2.5">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0 text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0 text-foreground">{children}</h3>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    code: ({ children, className: codeClassName, ...props }) => {
                        const isInline = !codeClassName;
                        if (isInline) {
                            return (
                                <code className="rounded-md bg-secondary/80 px-1.5 py-0.5 text-xs font-mono text-foreground" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <code className={cn("text-xs font-mono", codeClassName)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="mb-2 overflow-x-auto rounded-lg bg-secondary/60 p-3 text-xs last:mb-0">
                            {children}
                        </pre>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="mb-2 border-l-2 border-primary/40 pl-3 italic text-muted-foreground last:mb-0">
                            {children}
                        </blockquote>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-2 hover:text-primary/80"
                        >
                            {children}
                        </a>
                    ),
                    table: ({ children }) => (
                        <div className="mb-2 overflow-x-auto last:mb-0">
                            <table className="min-w-full text-xs border-collapse">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="border-b border-border/60">{children}</thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-2 py-1.5 text-left font-semibold text-foreground">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="px-2 py-1.5 border-t border-border/30">{children}</td>
                    ),
                    hr: () => <hr className="my-3 border-border/40" />,
                }}
            >
                {content}
            </ReactMarkdown>

            {sources && sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20">
                    {sources.map((source, idx) => (
                        <span
                            key={idx}
                            title={source.excerpt}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] sm:text-[11px] font-medium text-primary/80 ring-1 ring-primary/15 transition-colors hover:bg-primary/15 hover:text-primary cursor-default"
                        >
                            <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            Page {source.pageNumber}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
