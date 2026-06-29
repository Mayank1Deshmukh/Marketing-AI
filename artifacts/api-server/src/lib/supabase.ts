import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error("SUPABASE_URL must be set.");
if (!supabaseAnonKey) throw new Error("SUPABASE_ANON_KEY must be set.");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
