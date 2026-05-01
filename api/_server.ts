import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

export const FULL_GAME_PRODUCT_KEY = "full_game";

export function getSiteUrl() {
  return process.env.PUBLIC_SITE_URL ?? "http://localhost:5173";
}

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(secretKey);
}

export function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getUserFromRequest(req: { headers: Record<string, string | string[] | undefined> }) {
  const authorization = req.headers.authorization;
  const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
  const token = headerValue?.startsWith("Bearer ") ? headerValue.slice("Bearer ".length) : null;

  if (!token) {
    throw new Error("Missing bearer token.");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Invalid bearer token.");
  }

  return {
    supabase,
    user: data.user,
  };
}

export function sendJson(res: { status: (code: number) => { json: (body: unknown) => void } }, status: number, body: unknown) {
  res.status(status).json(body);
}

export function sendError(res: { status: (code: number) => { json: (body: unknown) => void } }, status: number, error: unknown) {
  sendJson(res, status, {
    error: error instanceof Error ? error.message : "Request failed.",
  });
}
