import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";

async function getPlatformStats() {
  try {
    const supabase = getSupabaseAdmin();
    const { count: totalDocs } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    const { count: completedDocs } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    return {
      totalDocuments: totalDocs ?? 0,
      processedDocuments: completedDocs ?? 0,
    };
  } catch {
    return { totalDocuments: 0, processedDocuments: 0 };
  }
}

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  const stats = await getPlatformStats();

  return (
    <div className="flex h-screen flex-col bg-background bg-grid-pattern selection:bg-primary/20 overflow-hidden">
      <nav className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/60 px-4 sm:px-6 backdrop-blur-xl animate-fade-up">
        <div className="flex items-center gap-2 font-heading font-bold text-base text-foreground tracking-tight">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">DocuMind</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/sign-in" className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Sign In
          </Link>
          <Link href="/sign-up" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-gradient-to-br from-primary/15 via-indigo-500/10 to-violet-500/8 blur-[120px] pointer-events-none animate-gradient-bg" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] rounded-full bg-gradient-to-tl from-violet-500/10 to-transparent blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto -mt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 dark:bg-primary/15 px-3 py-1 text-[11px] font-medium text-primary backdrop-blur-sm mb-4 animate-fade-up">
            <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Powered Document Intelligence
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15] animate-fade-up-delay-1">
            Transform Your Documents
            <br />
            <span className="text-gradient">with AI Intelligence</span>
          </h1>

          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed animate-fade-up-delay-2">
            Upload, analyze, and interact with your documents using cutting-edge AI.
            Get instant insights, hybrid search, and page-level citations in seconds.
          </p>

          <div className="mt-6 flex items-center justify-center animate-fade-up-delay-3">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 animate-glow-cta">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Start Free
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 max-w-3xl">
          <FeatureChip icon="⚡" text="AI Analysis" delay={0} />
          <FeatureChip icon="📁" text="Smart Organization" delay={1} />
          <FeatureChip icon="🔍" text="Hybrid Search" delay={2} />
          <FeatureChip icon="📄" text="Page Citations" delay={3} />
        </div>

        <div className="relative z-10 mt-8 w-full max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            <StatPill value={stats.totalDocuments.toLocaleString()} label="Docs Uploaded" live delay={0} />
            <StatPill value={stats.processedDocuments.toLocaleString()} label="AI Processed" live delay={1} />
            <StatPill value="100+" label="Concurrent Users" delay={2} />
            <StatPill value="1 GB" label="Storage Capacity" delay={3} />
            <StatPill value="~120ms" label="Avg Response" className="col-span-2 sm:col-span-1" delay={4} />
          </div>
        </div>
      </main>

      <footer className="shrink-0 border-t border-border py-3 text-center">
        <p className="text-[10px] text-muted-foreground/40">
          &copy; {new Date().getFullYear()} DocuMind &bull; Built with Next.js
        </p>
      </footer>
    </div>
  );
}

function FeatureChip({ icon, text, delay }: { icon: string; text: string; delay: number }) {
  const delayClass = ["animate-scale-in", "animate-scale-in-delay-1", "animate-scale-in-delay-2", "animate-scale-in-delay-3"][delay] || "animate-scale-in";
  return (
    <div className={`flex items-center gap-2 rounded-full border border-border bg-secondary/50 dark:bg-white/[0.06] px-4 py-2 text-xs sm:text-sm font-medium text-foreground/80 backdrop-blur-sm shadow-sm hover:bg-secondary dark:hover:bg-white/[0.1] transition-colors ${delayClass}`}>
      <span>{icon}</span>
      {text}
    </div>
  );
}

function StatPill({ value, label, live, className, delay }: { value: string; label: string; live?: boolean; className?: string; delay: number }) {
  const delayClass = [
    "animate-scale-in",
    "animate-scale-in-delay-1",
    "animate-scale-in-delay-2",
    "animate-scale-in-delay-3",
    "animate-scale-in-delay-3",
  ][delay] || "animate-scale-in";
  return (
    <div className={`flex flex-col items-center rounded-xl border border-border bg-card/60 dark:bg-white/[0.06] px-3 py-3 text-center backdrop-blur-sm shadow-sm hover:bg-card dark:hover:bg-white/[0.1] transition-colors ${delayClass} ${className ?? ""}`}>
      <div className="flex items-center gap-1.5">
        <span className="font-heading text-lg sm:text-xl font-bold text-gradient">{value}</span>
        {live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      </div>
      <span className="mt-0.5 text-[10px] sm:text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
