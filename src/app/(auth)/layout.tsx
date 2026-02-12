export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background selection:bg-primary/20 px-4 py-12">
            <div className="absolute inset-0 z-0">
                <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-primary/10 dark:bg-primary/20 blur-[120px] animate-pulse-slow" />
                <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 dark:bg-indigo-500/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative z-10 w-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}
