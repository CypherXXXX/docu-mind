export default function AuthLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                    Loading…
                </p>
            </div>
        </div>
    );
}
