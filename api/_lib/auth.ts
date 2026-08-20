/**
 * api/_lib/auth.ts
 *
 * Shared server-side authentication utility for all AI API endpoints.
 * Extracts the Bearer token from the Authorization header, builds an
 * RLS-scoped Supabase client using the user's own JWT, and validates
 * the token via supabase.auth.getUser().
 *
 * Security invariants (must hold for every endpoint that calls this):
 *  - Identity is ALWAYS derived from supabase.auth.getUser(token).
 *  - The authenticated client is scoped to the user's token so every
 *    subsequent DB query is subject to RLS policies.
 *  - No client-supplied userId is ever trusted for authorization.
 *  - Groq key and Supabase service role key are never returned or logged.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthSuccess {
  user: { id: string; email?: string };
  supabase: SupabaseClient;
  token: string;
}

export interface AuthFailure {
  error: string;
  status: 401 | 500;
}

export type AuthResult = AuthSuccess | AuthFailure;

/** Type-guard: narrows AuthResult to AuthSuccess */
export function isAuthSuccess(result: AuthResult): result is AuthSuccess {
  return !("error" in result);
}

// ── authenticate ─────────────────────────────────────────────────────────────

/**
 * Authenticate a Vercel API request using the Bearer token in the
 * Authorization header.  Returns either { user, supabase, token } on
 * success or { error, status } on failure.
 *
 * Usage:
 *   const auth = await authenticate(req);
 *   if (!isAuthSuccess(auth)) return res.status(auth.status).json({ error: auth.error });
 *   const { user, supabase } = auth;
 */
export async function authenticate(req: VercelRequest): Promise<AuthResult> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Missing authorization token", status: 401 };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { error: "Empty authorization token", status: 401 };
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: "Server misconfiguration", status: 500 };
  }

  // Build an RLS-scoped client: all DB queries will be subject to RLS
  // policies using this user's JWT — we never use the service-role key
  // for user-data queries.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // Validate the token server-side — identity comes from Supabase, never
  // from any client-supplied field.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: "Invalid or expired token", status: 401 };
  }

  return { user: { id: user.id, email: user.email }, supabase, token };
}
