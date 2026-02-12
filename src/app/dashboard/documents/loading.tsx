import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
    return (
        <div className="min-h-screen bg-transparent">
            <div className="pl-64">
                <div className="flex h-screen flex-col">
                    <div className="flex h-16 items-center gap-4 border-b border-border/40 px-6 bg-card/20">
                        <Skeleton className="h-4 w-24" />
                        <div className="h-5 w-px bg-border/60" />
                        <Skeleton className="h-4 w-32" />
                        <div className="ml-auto flex items-center gap-3">
                            <Skeleton className="h-9 w-56 rounded-xl" />
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <Skeleton className="h-9 w-9 rounded-lg" />
                        </div>
                    </div>

                    <main className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-9 w-20 rounded-lg" />
                                    <Skeleton className="h-9 w-24 rounded-lg" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <Skeleton className="h-10 w-full rounded-xl" />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="rounded-2xl border border-border/40 bg-card/30 p-5 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="h-12 w-12 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                <Skeleton className="h-5 w-14 rounded-full" />
                                                <Skeleton className="h-5 w-10 rounded-full" />
                                            </div>
                                            <Skeleton className="h-6 w-6 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
