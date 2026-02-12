import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn(
        "⚠️  STRIPE_SECRET_KEY is not set. Stripe payments will not work. " +
        "Get your keys from https://dashboard.stripe.com/apikeys"
    );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2026-01-28.clover",
    typescript: true,
});
