import { FULL_GAME_PRODUCT_KEY, getSiteUrl, getStripe, getUserFromRequest, sendError, sendJson } from "../_server";
import { createProfileUpsertPayload, createStripeCustomerParams } from "../_monetization";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const priceId = process.env.STRIPE_FULL_GAME_PRICE_ID;
    if (!priceId) {
      throw new Error("STRIPE_FULL_GAME_PRICE_ID is not configured.");
    }

    const { supabase, user } = await getUserFromRequest(req);
    const stripe = getStripe();
    const siteUrl = getSiteUrl();
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create(createStripeCustomerParams(user));
      customerId = customer.id;

      await supabase.from("profiles").upsert(createProfileUpsertPayload({ customerId, user }));
    }

    const session = await stripe.checkout.sessions.create({
      cancel_url: `${siteUrl}/play?checkout=cancelled`,
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${siteUrl}/play?checkout=success`,
      metadata: {
        product_key: FULL_GAME_PRODUCT_KEY,
        supabase_user_id: user.id,
      },
    });

    sendJson(res, 200, { url: session.url });
  } catch (error) {
    sendError(res, 400, error);
  }
}
