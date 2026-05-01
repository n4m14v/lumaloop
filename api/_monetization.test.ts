import { describe, expect, it } from "vitest";

import {
  createProfileUpsertPayload,
  createStripeCustomerParams,
  getFullGameEntitlementGrant,
} from "./_monetization";
import { FULL_GAME_PRODUCT_KEY } from "./_server";

describe("monetization payment helpers", () => {
  it("omits Stripe customer email when Supabase user email is missing", () => {
    expect(createStripeCustomerParams({ id: "user_123" })).toEqual({
      metadata: {
        supabase_user_id: "user_123",
      },
    });
  });

  it("includes Stripe customer email when available", () => {
    expect(createStripeCustomerParams({ email: "player@example.com", id: "user_123" })).toEqual({
      email: "player@example.com",
      metadata: {
        supabase_user_id: "user_123",
      },
    });
  });

  it("does not write undefined profile email fields", () => {
    expect(createProfileUpsertPayload({
      customerId: "cus_123",
      user: { id: "user_123" },
    })).toMatchObject({
      stripe_customer_id: "cus_123",
      user_id: "user_123",
    });
    expect(createProfileUpsertPayload({
      customerId: "cus_123",
      user: { id: "user_123" },
    })).not.toHaveProperty("email");
  });

  it("creates a full-game entitlement grant for valid checkout metadata", () => {
    const grant = getFullGameEntitlementGrant({
      customer: "cus_123",
      id: "cs_123",
      metadata: {
        product_key: FULL_GAME_PRODUCT_KEY,
        supabase_user_id: "user_123",
      },
    } as never);

    expect(grant).toEqual({
      active: true,
      product_key: FULL_GAME_PRODUCT_KEY,
      source: "stripe",
      stripe_checkout_session_id: "cs_123",
      stripe_customer_id: "cus_123",
      user_id: "user_123",
    });
  });

  it("does not grant entitlements for missing user ids or other products", () => {
    expect(getFullGameEntitlementGrant({
      id: "cs_123",
      metadata: {
        product_key: FULL_GAME_PRODUCT_KEY,
      },
    } as never)).toBeNull();

    expect(getFullGameEntitlementGrant({
      id: "cs_123",
      metadata: {
        product_key: "other_product",
        supabase_user_id: "user_123",
      },
    } as never)).toBeNull();
  });
});
