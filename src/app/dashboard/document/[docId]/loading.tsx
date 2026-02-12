import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentLoading() {
    return (
        <div className="flex h-screen bg-background animate-in fade-in duration-500">
            <div className="flex w-[60%] flex-col border-r border-border/40">
                <div className="flex h-14 items-center gap-3 border-b border-border/40 px-4 bg-card/30">
                    <Skeleton className="h-8 w-16 rounded-lg" />
                    <div className="h-5 w-px bg-border/60" />
                    <Skeleton className="h-4 w-48" />
                    <div className="ml-auto flex items-center gap-3">
                        <Skeleton className="h-3.5 w-16" />
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-16" />
                    </div>
                </div>

                <div className="flex-1 p-3">
                    <div className="relative h-full rounded-xl border border-border/40 bg-card/30 overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-card/50">
                            <Skeleton className="h-3.5 w-3.5 rounded" />
                            <Skeleton className="h-3 w-36" />
                            <div className="ml-auto">
                                <Skeleton className="h-2.5 w-10" />
                            </div>
                        </div>
                        <div className="absolute inset-0 top-8 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                                    <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                </div>
                                <Skeleton className="h-3.5 w-28" />
                            </div>
                        </div>
                        <div className="p-6 space-y-4 opacity-20">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[95%]" />
                            <Skeleton className="h-4 w-[80%]" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[85%]" />
                            <div className="h-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[70%]" />
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[60%]" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex w-[40%] flex-col">
                <div className="flex h-14 items-center gap-3 border-b border-border/40 px-5 bg-card/30">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2.5 w-44" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
                        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary/60 animate-spin" />
                    </div>
                    <Skeleton className="h-5 w-52" />
                    <Skeleton className="h-3.5 w-40" />

                    <div className="mt-6 space-y-2 w-full max-w-xs">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-11 w-full rounded-xl" />
                        ))}
                    </div>
                </div>

                <div className="border-t border-border/40 p-4 bg-card/30">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
