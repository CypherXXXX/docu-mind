"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    Check,
    X,
    Crown,
    Zap,
    Sparkles,
    Shield,
    Users,
    HardDrive,
    Bot,
    Upload,
    FileText,
    BarChart3,
    Globe,
    Lock,
    Star,
    Loader2,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

interface PlanFeature {
    text: string;
    included: boolean;
    highlight?: boolean;
}

interface Plan {
    name: string;
    description: string;
    price: string;
    priceSubtext: string;
    icon: React.ComponentType<{ className?: string }>;
    iconGradient: string;
    features: PlanFeature[];
    cta: string;
    ctaVariant: "outline" | "primary" | "gradient";
    badge?: string;
    popular?: boolean;
}

const plans: Plan[] = [
    {
        name: "Free",
        description: "Perfect for getting started with document AI",
        price: "₹0",
        priceSubtext: "Forever free",
        icon: Sparkles,
        iconGradient: "from-emerald-500 to-teal-500",
        badge: "Current Plan",
        cta: "Current Plan",
        ctaVariant: "outline",
        features: [
            { text: "5MB max file upload", included: true },
            { text: "50MB total storage", included: true },
            { text: "Groq AI (Llama 3.3 70B)", included: true },
            { text: "PDF, DOCX, PPTX support", included: true },
            { text: "Basic document chat", included: true },
            { text: "Chat history", included: true },
            { text: "5 documents limit", included: true },
            { text: "Community support", included: true },
            { text: "Advanced AI models", included: false },
            { text: "Priority processing", included: false },
            { text: "API access", included: false },
            { text: "Team collaboration", included: false },
        ],
    },
    {
        name: "Pro",
        description: "For professionals who need more power",
        price: "₹499",
        priceSubtext: "/month",
        icon: Zap,
        iconGradient: "from-primary to-indigo-500",
        badge: "Most Popular",
        popular: true,
        cta: "Upgrade to Pro",
        ctaVariant: "gradient",
        features: [
            { text: "25MB max file upload", included: true, highlight: true },
            { text: "500MB total storage", included: true, highlight: true },
            { text: "GPT-4o + Groq AI", included: true, highlight: true },
            { text: "All document formats", included: true },
            { text: "Advanced document chat", included: true },
            { text: "Full chat history & export", included: true },
            { text: "Unlimited documents", included: true, highlight: true },
            { text: "Priority email support", included: true },
            { text: "Priority processing", included: true, highlight: true },
            { text: "Advanced analytics", included: true },
            { text: "API access", included: false },
            { text: "Team collaboration", included: false },
        ],
    },
    {
        name: "Enterprise",
        description: "For teams and organizations at scale",
        price: "₹1,499",
        priceSubtext: "/month",
        icon: Crown,
        iconGradient: "from-amber-500 to-orange-500",
        cta: "Upgrade to Enterprise",
        ctaVariant: "primary",
        features: [
            { text: "100MB max file upload", included: true, highlight: true },
            { text: "Unlimited storage", included: true, highlight: true },
            { text: "All AI models (GPT-4o, Claude, Gemini)", included: true, highlight: true },
            { text: "All document formats + OCR", included: true },
            { text: "Advanced chat with citations", included: true },
            { text: "Full history, export & backup", included: true },
            { text: "Unlimited documents", included: true },
            { text: "24/7 priority support", included: true, highlight: true },
            { text: "Fastest processing queue", included: true },
            { text: "Custom analytics & reports", included: true },
            { text: "Full API access & webhooks", included: true, highlight: true },
            { text: "Team collaboration (up to 25)", included: true, highlight: true },
        ],
    },
];

const highlights = [
    { icon: Bot, label: "AI-Powered", desc: "Multiple AI models" },
    { icon: Shield, label: "Secure", desc: "Enterprise-grade security" },
    { icon: Upload, label: "Multi-Format", desc: "PDF, DOCX, PPTX" },
    { icon: BarChart3, label: "Analytics", desc: "Document insights" },
];

export function PlansClient() {
    const searchParams = useSearchParams();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [mounted, setMounted] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        setMounted(true);
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        if (success) {
            setStatusBanner({ type: "success", msg: "Payment successful! Your plan has been upgraded." });
        } else if (canceled) {
            setStatusBanner({ type: "error", msg: "Payment was canceled. You can try again anytime." });
        }
    }, [searchParams]);

    const handleUpgrade = async (planName: string) => {
        const planId = `${planName.toLowerCase()}_${billingCycle}`;
        setLoadingPlan(planId);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                setStatusBanner({ type: "error", msg: data.error || "Failed to start checkout" });
                setLoadingPlan(null);
            }
        } catch {
            setStatusBanner({ type: "error", msg: "Network error. Please try again." });
            setLoadingPlan(null);
        }
    };

    const getPrice = (plan: Plan) => {
        if (plan.price === "₹0") return "₹0";
        if (billingCycle === "yearly") {
            const monthly = parseInt(plan.price.replace(/[₹,]/g, ""));
            const yearly = Math.round(monthly * 10); // 2 months free
            return `₹${yearly.toLocaleString("en-IN")}`;
        }
        return plan.price;
    };

    const getPriceSubtext = (plan: Plan) => {
        if (plan.priceSubtext === "Forever free") return "Forever free";
        return billingCycle === "yearly" ? "/year (2 months free)" : "/month";
    };

    return (
        <div className="min-h-screen bg-transparent">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Status Banner */}
                    {statusBanner && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "mb-6 flex items-center gap-3 rounded-xl border px-5 py-3.5",
                                statusBanner.type === "success"
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                            )}
                        >
                            {statusBanner.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <span className="text-sm font-medium">{statusBanner.msg}</span>
                            <button onClick={() => setStatusBanner(null)} className="ml-auto text-xs opacity-50 hover:opacity-100">✕</button>
                        </motion.div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div>
                                <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-500 ring-1 ring-amber-500/25">
                                        <Crown className="h-4.5 w-4.5" />
                                    </div>
                                    Plans & Pricing
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1 ml-[46px]">
                                    Choose the plan that fits your needs
                                </p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>

                    {/* Highlights Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="flex items-center justify-center gap-6 py-6 mb-6"
                    >
                        {highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                <h.icon className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-xs font-semibold text-foreground">{h.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{h.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Billing Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="flex items-center justify-center gap-3 mb-10"
                    >
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground")}>
                            Monthly
                        </span>
                        <button
                            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                            className={cn(
                                "relative h-7 w-14 rounded-full transition-colors duration-300",
                                billingCycle === "yearly"
                                    ? "bg-gradient-to-r from-primary to-indigo-500"
                                    : "bg-secondary/80 dark:bg-white/10"
                            )}
                        >
                            <motion.div
                                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
                                animate={{ left: billingCycle === "yearly" ? "calc(100% - 1.5rem)" : "0.25rem" }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                        <span className={cn("text-sm font-medium transition-colors", billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground")}>
                            Yearly
                        </span>
                        {billingCycle === "yearly" && (
                            <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 ring-1 ring-emerald-500/20">
                                Save 17%
                            </span>
                        )}
                    </motion.div>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {plans.map((plan, index) => {
                            const Icon = plan.icon;
                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 0.2 + index * 0.1,
                                        ease: [0.25, 0.1, 0.25, 1],
                                    }}
                                    className={cn(
                                        "relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl",
                                        plan.popular
                                            ? "border-primary/50 bg-card/60 shadow-lg shadow-primary/10 scale-[1.02] hover:shadow-primary/20"
                                            : "border-border/50 bg-card/30 backdrop-blur-sm hover:border-border/80 hover:bg-card/50 hover:shadow-black/5"
                                    )}
                                >
                                    {/* Popular Badge */}
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-primary" />
                                    )}

                                    <div className="p-6">
                                        {/* Plan Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10",
                                                plan.iconGradient
                                            )}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            {plan.badge && (
                                                <span className={cn(
                                                    "rounded-full px-3 py-1 text-[11px] font-bold",
                                                    plan.popular
                                                        ? "bg-gradient-to-r from-primary/20 to-indigo-500/20 text-primary ring-1 ring-primary/30"
                                                        : "bg-secondary/60 text-muted-foreground ring-1 ring-border/50"
                                                )}>
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold tracking-tight text-foreground">
                                                    {mounted ? getPrice(plan) : plan.price}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {mounted ? getPriceSubtext(plan) : plan.priceSubtext}
                                                </span>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <button
                                            className={cn(
                                                "w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 mb-6",
                                                plan.ctaVariant === "gradient"
                                                    ? "bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                                                    : plan.ctaVariant === "primary"
                                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                                                        : "border border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground cursor-default"
                                            )}
                                            disabled={plan.ctaVariant === "outline" || !!loadingPlan}
                                            onClick={() => plan.ctaVariant !== "outline" && handleUpgrade(plan.name)}
                                        >
                                            {loadingPlan === `${plan.name.toLowerCase()}_${billingCycle}` ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Redirecting to Stripe...
                                                </span>
                                            ) : plan.ctaVariant === "outline" ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Check className="h-4 w-4 text-emerald-500" />
                                                    {plan.cta}
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Zap className="h-4 w-4" />
                                                    {plan.cta}
                                                </span>
                                            )}
                                        </button>

                                        {/* Features List */}
                                        <div className="space-y-2.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
                                                What&apos;s included
                                            </p>
                                            {plan.features.map((feature, fi) => (
                                                <motion.div
                                                    key={fi}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{
                                                        duration: 0.25,
                                                        delay: 0.4 + fi * 0.03,
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-2.5 text-sm",
                                                        feature.included ? "text-foreground" : "text-muted-foreground/40"
                                                    )}
                                                >
                                                    {feature.included ? (
                                                        <div className={cn(
                                                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                                                            feature.highlight
                                                                ? "bg-primary/15 text-primary"
                                                                : "bg-emerald-500/10 text-emerald-500"
                                                        )}>
                                                            <Check className="h-3 w-3" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/50">
                                                            <X className="h-3 w-3" />
                                                        </div>
                                                    )}
                                                    <span className={cn(feature.highlight && "font-medium")}>
                                                        {feature.text}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* FAQ / Bottom Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-center pb-8"
                    >
                        <div className="inline-flex items-center gap-3 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm px-6 py-4">
                            <Lock className="h-5 w-5 text-primary" />
                            <div className="text-left">
                                <p className="text-sm font-semibold text-foreground">Secure Payments via Stripe</p>
                                <p className="text-xs text-muted-foreground">256-bit SSL encryption · No card data stored · Cancel anytime</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
