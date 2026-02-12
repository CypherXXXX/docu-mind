"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
    content: string;
    role: "user" | "assistant";
}

export function ChatMessage({ content, role }: ChatMessageProps) {
    if (role === "user") {
        return <span>{content}</span>;
    }

    return (
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
    );
}
