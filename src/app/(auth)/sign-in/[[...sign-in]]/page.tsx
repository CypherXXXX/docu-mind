import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex flex-col items-center w-full max-w-md px-4" suppressHydrationWarning>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner shadow-primary/20 mb-5">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-1.5 tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mb-8">Sign in to your DocuMind account to continue</p>

            <SignIn
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
                        identityPreviewEditButton: "text-primary hover:text-primary/80",
                        otpCodeFieldInput: "bg-secondary/50 border-border text-foreground",
                        formFieldWarningText: "text-amber-500 dark:text-amber-400",
                        formFieldSuccessText: "text-emerald-500 dark:text-emerald-400",
                        formFieldErrorText: "text-destructive",
                        alertText: "text-foreground/80",
                        formResendCodeLink: "text-primary hover:text-primary/80",
                        badge: "bg-primary/20 text-primary",
                    },
                }}
            />
        </div>
    );
}
