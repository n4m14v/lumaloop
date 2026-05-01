import { campaignLevels } from "./campaign";

export type AccessGroup = "free" | "premium";

export interface CampaignManifestEntry {
  accessGroup: AccessGroup;
  id: string;
  index: number;
  name: string;
  world: string;
  idealSolutionLength?: number;
}

export const FULL_GAME_PRODUCT_KEY = "full_game";

export const freeLevelIds = [
  "world-01-level-01",
  "world-01-level-02",
  "world-01-level-03",
  "world-01-level-04",
  "world-01-level-05",
  "world-01-level-06",
  "world-01-level-07",
  "world-01-level-08",
  "world-01-level-09",
  "world-01-level-10",
  "world-01-level-11",
] as const;

export const freeLevelIdSet = new Set<string>(freeLevelIds);

export function isFreeLevel(levelId: string) {
  return freeLevelIdSet.has(levelId);
}

export const campaignManifest: CampaignManifestEntry[] = campaignLevels.map((level, index) => ({
  accessGroup: isFreeLevel(level.id) ? "free" : "premium",
  id: level.id,
  index,
  name: level.name,
  world: level.world,
  ...(level.metadata?.idealSolutionLength !== undefined
    ? { idealSolutionLength: level.metadata.idealSolutionLength }
    : {}),
}));

export const firstPremiumLevelId = campaignManifest.find((level) => level.accessGroup === "premium")?.id ?? null;

export function getFirstPremiumLevelIndex() {
  return campaignManifest.findIndex((level) => level.accessGroup === "premium");
}
