import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Only database access — no Auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
