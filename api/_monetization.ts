import type Stripe from "stripe";

import { FULL_GAME_PRODUCT_KEY } from "./_server";

interface CheckoutUser {
  email?: string;
  id: string;
}

export function createStripeCustomerParams(user: CheckoutUser): Stripe.CustomerCreateParams {
  const params: Stripe.CustomerCreateParams = {
    metadata: {
      supabase_user_id: user.id,
    },
  };

  if (user.email) {
    params.email = user.email;
  }

  return params;
}

export function createProfileUpsertPayload({
  customerId,
  user,
}: {
  customerId: string;
  user: CheckoutUser;
}) {
  return {
    ...(user.email ? { email: user.email } : {}),
    stripe_customer_id: customerId,
    updated_at: new Date().toISOString(),
    user_id: user.id,
  };
}

export function getFullGameEntitlementGrant(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id;
  const productKey = session.metadata?.product_key ?? FULL_GAME_PRODUCT_KEY;

  if (!userId || productKey !== FULL_GAME_PRODUCT_KEY) {
    return null;
  }

  return {
    active: true,
    product_key: FULL_GAME_PRODUCT_KEY,
    source: "stripe",
    stripe_checkout_session_id: session.id,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id,
    user_id: userId,
  };
}
