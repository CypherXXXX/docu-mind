"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DragDropZone } from "@/components/DragDropZone";
import { Sparkles, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function UploadHub() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-transparent">
            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full max-w-2xl"
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur-sm mb-5"
                        >
                            <Sparkles className="h-3 w-3" />
                            AI-Powered Document Analysis
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight"
                        >
                            Upload. Analyze.{" "}
                            <span className="text-gradient">Understand.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto"
                        >
                            Drag & drop your documents to unlock powerful AI insights instantly.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.35 }}
                        className="rounded-3xl border border-border/60 bg-card/30 backdrop-blur-sm p-8 shadow-sm"
                    >
                        <DragDropZone onUploadComplete={() => router.push("/dashboard/documents")} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex justify-center mt-6"
                    >
                        <Link
                            href="/dashboard/documents"
                            className="group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-secondary/50"
                        >
                            <FileText className="h-4 w-4" />
                            View All Documents
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
