"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Send,
    Loader2,
    Bot,
    User,
    Sparkles,
    FileText,
    Layers,
    Clock,
    MessageSquare,
    Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatRelativeTime, formatFileSize } from "@/lib/utils/time";
import type { SupabaseDocument } from "@/types/documents";
import { motion, AnimatePresence } from "framer-motion";
import { saveChatMessage, clearChatHistory } from "@/lib/actions/chat";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface DocumentViewProps {
    document: SupabaseDocument;
    chunkCount: number;
    initialMessages?: Message[];
}

const DEFAULT_QUESTIONS = [
    "What is this document about?",
    "Summarize the key points",
    "What are the main conclusions?",
];

export function DocumentView({ document: doc, chunkCount, initialMessages = [] }: DocumentViewProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch("/api/suggest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ docId: doc.id, summary: doc.summary }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.questions && data.questions.length > 0) {
                        setSuggestedQuestions(data.questions);
                    }
                }
            } catch {
            }
        };
        fetchQuestions();
    }, [doc.id, doc.summary]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = async (messageText?: string) => {
        const trimmed = (messageText || input).trim();
        if (!trimmed || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        saveChatMessage(doc.id, "user", trimmed);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    docId: doc.id,
                }),
            });

            const contentType = res.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error(
                    res.status === 401 || res.status === 403 || res.redirected
                        ? "Session expired. Please refresh the page and sign in again."
                        : `Server returned an unexpected response (HTTP ${res.status}). Please try again.`
                );
            }

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }

            const responseContent = data.content || "No response received.";
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: responseContent,
                },
            ]);
            saveChatMessage(doc.id, "assistant", responseContent);
        } catch (err) {
            const errMsg =
                err instanceof Error ? err.message : "An error occurred";
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `⚠️ ${errMsg}`,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    const handleClearChat = async () => {
        if (messages.length === 0) return;
        setIsClearing(true);
        const result = await clearChatHistory(doc.id);
        if (result.success) {
            setMessages([]);
        }
        setIsClearing(false);
    };

    return (
        <div className="flex h-screen bg-background">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex w-[60%] flex-col border-r border-border/40"
            >
                <div className="flex h-14 items-center gap-3 border-b border-border/40 px-4 bg-card/30">
                    <Link
                        href="/dashboard/documents"
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                    </Link>

                    <div className="h-5 w-px bg-border/60" />

                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold text-foreground truncate">
                            {doc.file_name}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {formatFileSize(doc.file_size)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" />
                            {chunkCount} chunks
                        </span>
                        <span className="flex items-center gap-1" suppressHydrationWarning>
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(doc.created_at)}
                        </span>
                        <ThemeToggle className="ml-1" />
                    </div>
                </div>

                <div className="flex-1 p-3">
                    <DocumentViewer
                        fileUrl={doc.file_url}
                        fileName={doc.file_name}
                        className="h-full"
                    />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex w-[40%] flex-col"
            >
                <div className="relative flex h-14 items-center gap-3 border-b border-border/40 px-5 bg-card/30 overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/50 via-indigo-500/50 to-primary/20" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20">
                        <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-foreground">
                            Chat with Document
                        </h2>
                        <p className="text-[11px] text-muted-foreground">
                            AI-powered Q&A about this document
                        </p>
                    </div>
                    {messages.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] tabular-nums text-muted-foreground/60">
                                {messages.length} msg{messages.length !== 1 ? "s" : ""}
                            </span>
                            <button
                                onClick={handleClearChat}
                                disabled={isClearing}
                                className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                title="Clear chat history"
                            >
                                {isClearing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col items-center justify-center h-full text-center pb-8"
                        >
                            <div className="relative mb-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-indigo-500/15 to-purple-500/10 ring-1 ring-primary/20 shadow-lg shadow-primary/10">
                                    <Sparkles className="h-9 w-9 text-primary/70" />
                                </div>
                                <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-indigo-500 text-white shadow-md">
                                    <Bot className="h-3 w-3" />
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-foreground mb-1.5">
                                Ask anything about this document
                            </h4>
                            <p className="text-sm text-muted-foreground max-w-[260px] mb-8 leading-relaxed">
                                DocuMind will analyze &quot;{doc.file_name}&quot;
                                and provide intelligent answers.
                            </p>

                            <div className="space-y-2.5 w-full max-w-xs">
                                {suggestedQuestions.map((q: string, i: number) => (
                                    <motion.button
                                        key={q}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSubmit(q)}
                                        className="w-full rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-gradient-to-r hover:from-primary/5 hover:to-indigo-500/5 hover:text-foreground hover:shadow-sm group"
                                    >
                                        <span className="opacity-60 group-hover:opacity-100 transition-opacity mr-2">💡</span>
                                        {q}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20 mt-0.5 shadow-sm">
                                        <Bot className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-br-md shadow-md shadow-primary/20"
                                            : "bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm"
                                    )}
                                >
                                    <ChatMessage content={msg.content} role={msg.role} />
                                </div>
                                {msg.role === "user" && (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border mt-0.5">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20 mt-0.5 shadow-sm">
                                <Bot className="h-3.5 w-3.5" />
                            </div>
                            <div className="rounded-2xl rounded-bl-md bg-card border border-border/50 px-4 py-3 shadow-sm">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="flex gap-1">
                                        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                                        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                                        <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                                    </span>
                                </span>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-border/40 p-4 bg-gradient-to-t from-card/50 to-transparent backdrop-blur-sm">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about this document..."
                                disabled={isLoading}
                                className="w-full rounded-xl border border-input bg-background/80 backdrop-blur-sm px-4 py-2.5 text-sm outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:shadow-lg focus:shadow-primary/5 disabled:opacity-50"
                            />
                            {input.length > 0 && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 tabular-nums">
                                    {input.length}
                                </span>
                            )}
                        </div>
                        <motion.button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-md shadow-primary/25 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
