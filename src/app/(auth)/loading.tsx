export default function AuthLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-5 animate-in fade-in duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner shadow-primary/20">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div className="relative h-8 w-8">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" style={{ animationDuration: "0.8s" }} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                    Preparing your workspace…
                </p>
            </div>
        </div>
    );
}
