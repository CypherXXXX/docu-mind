import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
    if (_supabaseAdmin) return _supabaseAdmin;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
        throw new Error("Missing env var: SUPABASE_URL");
    }

    if (!supabaseServiceRoleKey || supabaseServiceRoleKey === "your_supabase_service_role_key") {
        throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");
    }

    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return _supabaseAdmin;
}
