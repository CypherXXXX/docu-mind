import { Suspense } from "react";
import { PlansClient } from "./PlansClient";

export const dynamic = "force-dynamic";

export default function PlansPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>}>
            <PlansClient />
        </Suspense>
    );
}
