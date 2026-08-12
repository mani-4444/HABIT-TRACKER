import { createClient } from "@supabase/supabase-js";

let rawUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

// If user provided just project ref (e.g., fdszwucrmrjhsadrwbln), convert to full URL
if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  if (rawUrl.includes(".")) {
    rawUrl = `https://${rawUrl}`;
  } else {
    rawUrl = `https://${rawUrl}.supabase.co`;
  }
}

export const supabaseUrl = rawUrl;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase environment variables. Using placeholder values.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
