import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PRICE_MAP: Record<string, { amount: number; name: string }> = {
    pro_monthly: { amount: 49900, name: "DocuMind Pro — Monthly" },
    pro_yearly: { amount: 499000, name: "DocuMind Pro — Yearly" },
    enterprise_monthly: { amount: 149900, name: "DocuMind Enterprise — Monthly" },
    enterprise_yearly: { amount: 1499000, name: "DocuMind Enterprise — Yearly" },
};

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your .env.local" },
                { status: 503 }
            );
        }

        const { planId } = await req.json();

        const priceInfo = PRICE_MAP[planId];
        if (!priceInfo) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const origin = req.headers.get("origin") || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: priceInfo.name,
                            description: "DocuMind AI Document Intelligence Platform",
                        },
                        unit_amount: priceInfo.amount,
                        recurring: {
                            interval: planId.includes("yearly") ? "year" : "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                planId,
            },
            success_url: `${origin}/dashboard/plans?success=true`,
            cancel_url: `${origin}/dashboard/plans?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: unknown) {
        console.error("Stripe checkout error:", error);
        const message = error instanceof Error ? error.message : "Failed to create checkout session";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
