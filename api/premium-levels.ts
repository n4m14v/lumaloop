import { campaignLevels } from "../packages/level-data/src/campaign";
import { isFreeLevel } from "../packages/level-data/src/monetization";
import { FULL_GAME_PRODUCT_KEY, getUserFromRequest, sendError, sendJson } from "./_server";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const { supabase, user } = await getUserFromRequest(req);
    const { data } = await supabase
      .from("entitlements")
      .select("active")
      .eq("user_id", user.id)
      .eq("product_key", FULL_GAME_PRODUCT_KEY)
      .eq("active", true)
      .maybeSingle();

    if (data?.active !== true) {
      sendJson(res, 403, { error: "Full game entitlement is required." });
      return;
    }

    sendJson(res, 200, {
      campaignVersion: "2026-04-24",
      levels: campaignLevels.filter((level) => !isFreeLevel(level.id)),
    });
  } catch (error) {
    sendError(res, 401, error);
  }
}
