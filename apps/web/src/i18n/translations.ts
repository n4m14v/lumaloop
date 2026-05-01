import type { Command, LevelDefinition } from "@lumaloop/engine";
import type { RunStatus } from "@lumaloop/engine";

export const SUPPORTED_LOCALES = ["en", "ru", "he"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_OPTIONS: { label: string; value: Locale }[] = [
  { value: "en", label: "English" },
  { value: "ru", label: "Русский" },
  { value: "he", label: "עברית" },
];

const RTL_LOCALES = new Set<Locale>(["he"]);

export type Messages = {
  actions: string;
  addCommandToSlot: (routineLabel: string, index: number) => string;
  allActions: string;
  backToPuzzle: string;
  clear: string;
  commandLabels: Record<Command, string>;
  fastPlay: string;
  idealSize: (value: number) => string;
  idealSizeLevelOnlyNote: string;
  language: string;
  left: string;
  level: string;
  levelOnly: string;
  levelOptionLabel: (index: number, name: string) => string;
  locked: string;
  lockedForLevel: string;
  loaderTitle: string;
  loaderSubtitle: string;
  mainRoutine: string;
  menu: string;
  next: string;
  newMechanic: (label: string) => string;
  noSlots: string;
  pause: string;
  play: string;
  povMode: string;
  povPlay: string;
  premiumPreviewCompleteBody: string;
  premiumPreviewCompleteCta: string;
  premiumPreviewCompleteSubtitle: string;
  premiumPreviewCompleteTitle: string;
  premiumPreviewPerfectNote: string;
  premiumPreviewProgress: (completed: number, total: number) => string;
  proc1Routine: string;
  proc2Routine: string;
  proceduralHierarchy: string;
  programSize: (value: number) => string;
  puzzleMenu: string;
  puzzleSolved: string;
  dismiss: string;
  removeCommandFromSlot: (routineLabel: string, index: number) => string;
  replay: string;
  continuePlaying: string;
  robotColor: string;
  right: string;
  routineSlots: (filled: number, total: number) => string;
  runOptions: string;
  showingFullCommandSet: string;
  showingLevelCommands: string;
  skipToEnd: string;
  splashStart: string;
  splashLoading: string;
  splashTagline: string;
  starsProgress: (earned: number, total: number) => string;
  bestSize: (value: number) => string;
  idealShort: (value: number) => string;
  currentLabel: string;
  perfectLabel: string;
  worldDisplayName: (worldId: string, fallbackName: string) => string;
  worldSubtitle: (worldId: string) => string;
  worldCurrent: string;
  worldCompleted: string;
  worldPerfected: string;
  successBody: string;
  replayTutorial: string;
  worldLabel: (index: number, name: string) => string;
  worldProgressSummary: (completed: number, total: number, perfected: number, stars: number, totalStars: number) => string;
  worldTheme: (label: string) => string;
  failureBodies: Record<RunStatus, string>;
  failureTitles: Record<RunStatus, string>;
  walkthroughClose: string;
  walkthroughDone: string;
  walkthroughNext: string;
  walkthroughOpen: string;
  walkthroughPrevious: string;
  walkthroughSubtitle: string;
  walkthroughTitle: string;
  walkthroughSlides: {
    body: string;
    bullets: string[];
    eyebrow: string;
    title: string;
  }[];
  onboardingContinue: string;
  onboardingSkip: string;
  onboardingLevel1: {
    activate: { body: string; title: string };
    firstForward: { body: string; title: string };
    mainRoutine: { body: string; title: string };
    play: { body: string; title: string };
    secondForward: { body: string; title: string };
  };
  onboardingLevel2: {
    activate: { body: string; title: string };
    boardIntro: { body: string; title: string };
    forwardTwice: { body: string; title: string };
    play: { body: string; title: string };
    turnRight: { body: string; title: string };
  };
  onboardingToggleIntro: {
    boardIntro: { body: string; title: string };
    play: { body: string; title: string };
    toggle: { body: string; title: string };
  };
};

export type LocalizedLevelCopy = {
  concept?: string;
  designerNotes?: string;
  name: string;
};

export type LocaleData = {
  levelCopy?: Record<string, LocalizedLevelCopy>;
  messages: Messages;
};

export function isRtlLocale(locale: Locale) {
  return RTL_LOCALES.has(locale);
}

export async function loadLocaleData(locale: Locale): Promise<LocaleData> {
  switch (locale) {
    case "ru":
      return (await import("./locales/ru")).localeData;
    case "he":
      return (await import("./locales/he")).localeData;
    case "en":
    default:
      return (await import("./locales/en")).localeData;
  }
}

export function localizeLevel(
  level: LevelDefinition,
  levelCopy?: Record<string, LocalizedLevelCopy>,
): LevelDefinition {
  if (!levelCopy) {
    return level;
  }

  const copy = levelCopy[level.id];

  if (!copy) {
    return level;
  }

  return {
    ...level,
    name: copy.name,
    metadata: level.metadata
      ? {
        ...level.metadata,
        concept: copy.concept ?? level.metadata.concept,
        designerNotes: copy.designerNotes ?? level.metadata.designerNotes,
      }
      : undefined,
  };
}
