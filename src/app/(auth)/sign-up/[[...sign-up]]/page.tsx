import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex w-full max-w-4xl flex-col lg:flex-row gap-8 lg:gap-12 items-start px-4" suppressHydrationWarning>
            {/* Form side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner shadow-primary/20 mb-5">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h1 className="font-heading text-2xl lg:text-3xl font-bold text-foreground mb-1.5 tracking-tight text-center lg:text-left">Create your account</h1>
                <p className="text-sm text-muted-foreground mb-8 text-center lg:text-left">Join thousands of users transforming their documents with AI</p>

                <SignUp
                    forceRedirectUrl="/dashboard"
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "bg-card border border-border shadow-2xl shadow-primary/5 backdrop-blur-xl rounded-2xl",
                            headerTitle: "text-foreground text-xl font-bold",
                            headerSubtitle: "text-muted-foreground text-sm",
                            formFieldLabel: "text-foreground/80 text-sm font-medium",
                            formFieldInput: "bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
                            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20",
                            footerActionLink: "text-primary hover:text-primary/80 font-medium",
                            footerActionText: "text-muted-foreground",
                            socialButtonsBlockButton: "bg-secondary/50 border-border text-foreground hover:bg-secondary/80",
                            socialButtonsBlockButtonText: "text-foreground font-medium",
                            dividerLine: "bg-border",
                            dividerText: "text-muted-foreground text-xs",
                            formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                            formFieldWarningText: "text-amber-500 dark:text-amber-400",
                            formFieldSuccessText: "text-emerald-500 dark:text-emerald-400",
                            formFieldErrorText: "text-destructive",
                            alertText: "text-foreground/80",
                            badge: "bg-primary/20 text-primary",
                        },
                    }}
                />
            </div>

            {/* Features side */}
            <div className="hidden lg:flex flex-col w-1/2 pt-14">
                <h2 className="font-heading text-xl font-bold text-foreground mb-1.5">What you&apos;ll get</h2>
                <p className="text-sm text-muted-foreground mb-8">Get instant access to all DocuMind features</p>

                <div className="space-y-5">
                    <FeatureItem text="AI-powered document analysis" />
                    <FeatureItem text="Unlimited file uploads" />
                    <FeatureItem text="Semantic search capabilities" />
                    <FeatureItem text="Smart document organization" />
                </div>

                <div className="mt-10 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/50 p-6 backdrop-blur-sm shadow-lg shadow-primary/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-heading text-3xl font-bold text-foreground">Free</p>
                            <div className="mt-2 h-1 w-20 rounded-full bg-primary/50" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-foreground/90">No credit card required</p>
                            <p className="text-xs text-muted-foreground">Start building today</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-sm font-medium text-foreground/90">{text}</span>
        </div>
    );
}
