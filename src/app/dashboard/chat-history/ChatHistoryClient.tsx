"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    MessageSquare,
    ChevronDown,
    User,
    Bot,
    Trash2,
    Loader2,
    FileText,
    ArrowLeft,
    ExternalLink,
    Search,
    Clock,
    Sparkles,
    MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearChatHistory, type ChatHistoryGroup } from "@/lib/actions/chat";
import { formatRelativeTime } from "@/lib/utils/time";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

interface ChatHistoryClientProps {
    history: ChatHistoryGroup[];
}

export function ChatHistoryClient({ history: initialHistory }: ChatHistoryClientProps) {
    const router = useRouter();
    const [history, setHistory] = useState(initialHistory);
    const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
    const [clearingId, setClearingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase();
        return history.filter(
            (group) =>
                group.document_name.toLowerCase().includes(q) ||
                group.messages.some((m) => m.content.toLowerCase().includes(q))
        );
    }, [history, searchQuery]);

    const totalMessages = useMemo(
        () => history.reduce((sum, g) => sum + g.messages.length, 0),
        [history]
    );

    const handleClear = async (documentId: string) => {
        setClearingId(documentId);
        const result = await clearChatHistory(documentId);
        if (result.success) {
            setHistory((prev) => prev.filter((h) => h.document_id !== documentId));
            if (expandedDoc === documentId) setExpandedDoc(null);
        }
        setClearingId(null);
    };

    const toggleExpand = (docId: string) => {
        setExpandedDoc((prev) => (prev === docId ? null : docId));
    };

    const getMessageCountColor = (count: number) => {
        if (count >= 20) return "from-rose-500/20 to-orange-500/20 text-rose-400 ring-rose-500/30";
        if (count >= 10) return "from-amber-500/20 to-yellow-500/20 text-amber-400 ring-amber-500/30";
        if (count >= 5) return "from-blue-500/20 to-cyan-500/20 text-blue-400 ring-blue-500/30";
        return "from-emerald-500/20 to-teal-500/20 text-emerald-400 ring-emerald-500/30";
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/dashboard"
                                    className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                                <div>
                                    <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary ring-1 ring-primary/25">
                                            <MessagesSquare className="h-4.5 w-4.5" />
                                        </div>
                                        Chat History
                                    </h1>
                                    <p className="text-sm text-muted-foreground mt-1 ml-[46px]">
                                        {history.length} conversation{history.length !== 1 ? "s" : ""} · {totalMessages} message{totalMessages !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        {history.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <input
                                        type="text"
                                        placeholder="Search conversations by document name or message content..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm pl-11 pr-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus:bg-card/60"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <p className="text-xs text-muted-foreground mt-2 ml-1">
                                        {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""} found
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="relative mb-6">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 to-indigo-500/20 blur-xl" />
                                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-indigo-500/10 ring-1 ring-primary/20">
                                    <MessageSquare className="h-12 w-12 text-primary/50" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">No chat history yet</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
                                Start chatting with your documents to see conversations here. Your chat history will be saved automatically.
                            </p>
                            <Link
                                href="/dashboard/documents"
                                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95"
                            >
                                <FileText className="h-4 w-4" />
                                View Documents
                            </Link>
                        </motion.div>
                    ) : filteredHistory.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <Search className="h-10 w-10 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-1">No matches found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try a different search term
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {filteredHistory.map((group, index) => (
                                <motion.div
                                    key={group.document_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: Math.min(index * 0.06, 0.4),
                                    }}
                                    className="group rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden transition-all hover:border-border/80 hover:bg-card/50 hover:shadow-lg hover:shadow-black/5"
                                >
                                    <div
                                        className="flex items-center gap-3.5 px-5 py-4 cursor-pointer transition-colors"
                                        onClick={() => toggleExpand(group.document_id)}
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105">
                                            <FileText className="h-5 w-5" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                {group.document_name}
                                            </h3>
                                            <div className="flex items-center gap-2.5 mt-1">
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span suppressHydrationWarning>
                                                        {formatRelativeTime(group.last_message_at)}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className={cn(
                                                "flex items-center gap-1 rounded-lg bg-gradient-to-r px-2.5 py-1 text-[11px] font-semibold ring-1",
                                                getMessageCountColor(group.messages.length)
                                            )}
                                        >
                                            <MessageSquare className="h-3 w-3" />
                                            {group.messages.length}
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/dashboard/document/${group.document_id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                                                title="Open document"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClear(group.document_id);
                                                }}
                                                disabled={clearingId === group.document_id}
                                                className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                                title="Clear chat"
                                            >
                                                {clearingId === group.document_id ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                            <div className="transition-transform duration-200" style={{ transform: expandedDoc === group.document_id ? "rotate(0deg)" : "rotate(-90deg)" }}>
                                                <ChevronDown className="h-4 w-4 text-muted-foreground/50" />
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedDoc === group.document_id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-t border-border/30 bg-gradient-to-b from-secondary/20 to-transparent">
                                                    <div className="relative max-h-[500px] overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin">
                                                        {group.messages.map((msg, msgIndex) => (
                                                            <motion.div
                                                                key={msg.id}
                                                                initial={{ opacity: 0, x: msg.role === "user" ? 12 : -12 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{
                                                                    duration: 0.25,
                                                                    delay: Math.min(msgIndex * 0.03, 0.3),
                                                                }}
                                                                className={cn(
                                                                    "flex gap-2.5",
                                                                    msg.role === "user" ? "justify-end" : "justify-start"
                                                                )}
                                                            >
                                                                {msg.role === "assistant" && (
                                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-indigo-500/15 text-primary ring-1 ring-primary/20 mt-0.5">
                                                                        <Bot className="h-3.5 w-3.5" />
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className={cn(
                                                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                                                        msg.role === "user"
                                                                            ? "bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-br-md shadow-md shadow-primary/15"
                                                                            : "bg-card border border-border/50 text-foreground rounded-bl-md shadow-sm"
                                                                    )}
                                                                >
                                                                    <ChatMessage content={msg.content} role={msg.role} />
                                                                    <p className="text-[10px] mt-2 opacity-40 flex items-center gap-1" suppressHydrationWarning>
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        {formatRelativeTime(msg.created_at)}
                                                                    </p>
                                                                </div>
                                                                {msg.role === "user" && (
                                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/80 text-muted-foreground ring-1 ring-border/50 mt-0.5">
                                                                        <User className="h-3.5 w-3.5" />
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    <div className="px-5 pb-4 pt-2">
                                                        <Link
                                                            href={`/dashboard/document/${group.document_id}`}
                                                            className="flex items-center justify-center gap-2 w-full rounded-xl border border-border/40 bg-card/40 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                                                        >
                                                            <Sparkles className="h-3.5 w-3.5" />
                                                            Continue this conversation
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
