import { getStripe, getSupabaseServiceClient, sendError, sendJson } from "../_server";
import { getFullGameEntitlementGrant } from "../_monetization";

export const config = {
  api: {
    bodyParser: false,
  },
};

function readRawBody(req: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    }

    const stripe = getStripe();
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    const supabase = getSupabaseServiceClient();

    const { data: existingEvent } = await supabase
      .from("stripe_events")
      .select("event_id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existingEvent) {
      sendJson(res, 200, { received: true, duplicate: true });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const entitlementGrant = getFullGameEntitlementGrant(session);

      if (entitlementGrant) {
        await supabase.from("entitlements").upsert(entitlementGrant);
      }
    }

    await supabase.from("stripe_events").insert({
      event_id: event.id,
      type: event.type,
    });

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendError(res, 400, error);
  }
}
