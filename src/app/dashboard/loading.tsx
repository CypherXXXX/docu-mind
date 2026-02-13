import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background">
            <div className="fixed inset-y-0 left-0 w-64 border-r border-border bg-sidebar/50 backdrop-blur-xl p-4">
                <div className="mb-8 flex items-center gap-3 px-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-2 py-2">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="pl-64">
                <div className="flex h-16 items-center justify-between border-b border-border bg-background/50 backdrop-blur-xl px-6">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex gap-4">
                        <Skeleton className="h-9 w-64 rounded-lg" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>

                <div className="px-6 py-8">
                    <div className="mx-auto max-w-7xl space-y-8">
                        <Skeleton className="h-48 w-full rounded-3xl" />
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-border bg-card/60 dark:bg-white/5 p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <Skeleton className="h-10 w-10 rounded-lg" />
                                        <Skeleton className="h-2 w-8 rounded-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <div className="pt-2">
                                        <Skeleton className="h-5 w-12 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
