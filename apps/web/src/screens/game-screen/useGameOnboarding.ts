import { useEffect, useMemo, useState } from "react";

import type { Command } from "@lumaloop/engine";

import { useI18n } from "../../i18n/I18nProvider";

const ONBOARDING_STORAGE_KEY = "lumaloop-onboarding-v1";
const LEVEL_ONE_ID = "world-01-level-01";
const LEVEL_TWO_ID = "world-01-level-02";
const TOGGLE_LEVEL_ONE_ID = "world-11-level-01";

type OnboardingProgress = {
  completedLevel1?: boolean;
  completedLevel2?: boolean;
  completedToggleIntro?: boolean;
  dismissed?: boolean;
};

type StepContent = {
  body: string;
  title: string;
};

type OnboardingTarget =
  | "game-board"
  | "palette-activate"
  | "palette-forward"
  | "palette-toggle"
  | "palette-turn-right"
  | "routine-main"
  | "run-button";

type OnboardingStep = {
  content: StepContent;
  id: string;
  target: OnboardingTarget;
  type: "action" | "manual";
  whenComplete?: (commands: Command[], hasRunStarted: boolean) => boolean;
};

function loadProgress() {
  if (typeof window === "undefined") {
    return {} as OnboardingProgress;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return {} as OnboardingProgress;
    }

    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed as OnboardingProgress : {};
  } catch {
    return {} as OnboardingProgress;
  }
}

function saveProgress(progress: OnboardingProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
}

function hasCommandPrefix(commands: Command[], prefix: Command[]) {
  return prefix.every((command, index) => commands[index] === command);
}

function buildLevelOneSteps(copy: ReturnType<typeof useI18n>["t"]): OnboardingStep[] {
  return [
    {
      content: copy.onboardingLevel1.firstForward,
      id: "level1-forward-1",
      target: "palette-forward",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["FORWARD"]),
    },
    {
      content: copy.onboardingLevel1.mainRoutine,
      id: "level1-main-routine",
      target: "routine-main",
      type: "manual",
    },
    {
      content: copy.onboardingLevel1.secondForward,
      id: "level1-forward-2",
      target: "palette-forward",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["FORWARD", "FORWARD"]),
    },
    {
      content: copy.onboardingLevel1.activate,
      id: "level1-activate",
      target: "palette-activate",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["FORWARD", "FORWARD", "ACTIVATE"]),
    },
    {
      content: copy.onboardingLevel1.play,
      id: "level1-play",
      target: "run-button",
      type: "action",
      whenComplete: (_commands, hasRunStarted) => hasRunStarted,
    },
  ];
}

function buildLevelTwoSteps(copy: ReturnType<typeof useI18n>["t"]): OnboardingStep[] {
  return [
    {
      content: copy.onboardingLevel2.boardIntro,
      id: "level2-board-intro",
      target: "game-board",
      type: "manual",
    },
    {
      content: copy.onboardingLevel2.turnRight,
      id: "level2-turn-right",
      target: "palette-turn-right",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["TURN_RIGHT"]),
    },
    {
      content: copy.onboardingLevel2.forwardTwice,
      id: "level2-forward-twice",
      target: "palette-forward",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["TURN_RIGHT", "FORWARD", "FORWARD"]),
    },
    {
      content: copy.onboardingLevel2.activate,
      id: "level2-activate",
      target: "palette-activate",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["TURN_RIGHT", "FORWARD", "FORWARD", "ACTIVATE"]),
    },
    {
      content: copy.onboardingLevel2.play,
      id: "level2-play",
      target: "run-button",
      type: "action",
      whenComplete: (_commands, hasRunStarted) => hasRunStarted,
    },
  ];
}

function buildToggleIntroSteps(copy: ReturnType<typeof useI18n>["t"]): OnboardingStep[] {
  return [
    {
      content: copy.onboardingToggleIntro.boardIntro,
      id: "toggle-board-intro",
      target: "game-board",
      type: "manual",
    },
    {
      content: copy.onboardingToggleIntro.toggle,
      id: "toggle-action",
      target: "palette-toggle",
      type: "action",
      whenComplete: (commands) => hasCommandPrefix(commands, ["TOGGLE"]),
    },
    {
      content: copy.onboardingToggleIntro.play,
      id: "toggle-play",
      target: "run-button",
      type: "action",
      whenComplete: (_commands, hasRunStarted) => hasRunStarted,
    },
  ];
}

export function useGameOnboarding({
  hasRunStarted,
  levelId,
  mainSlots,
  result,
}: {
  hasRunStarted: boolean;
  levelId: string;
  mainSlots: (Command | null)[];
  result: object | null;
}) {
  const { t } = useI18n();
  const [progress, setProgress] = useState<OnboardingProgress>(loadProgress);
  const [acknowledgedSteps, setAcknowledgedSteps] = useState<Record<string, boolean>>({});
  const commands = useMemo(
    () => mainSlots.filter((command): command is Command => command !== null),
    [mainSlots],
  );
  const hasProgramRun = hasRunStarted || result !== null;

  const flow = useMemo(() => {
    if (progress.dismissed) {
      return null;
    }

    if (levelId === LEVEL_ONE_ID && !progress.completedLevel1) {
      return "level1";
    }

    if (levelId === LEVEL_TWO_ID && progress.completedLevel1 && !progress.completedLevel2) {
      return "level2";
    }

    if (levelId === TOGGLE_LEVEL_ONE_ID && !progress.completedToggleIntro) {
      return "toggle";
    }

    return null;
  }, [levelId, progress.completedLevel1, progress.completedLevel2, progress.completedToggleIntro, progress.dismissed]);

  const steps = useMemo(() => {
    if (flow === "level1") {
      return buildLevelOneSteps(t);
    }

    if (flow === "level2") {
      return buildLevelTwoSteps(t);
    }

    if (flow === "toggle") {
      return buildToggleIntroSteps(t);
    }

    return [];
  }, [flow, t]);

  useEffect(() => {
    setAcknowledgedSteps({});
  }, [flow]);

  const currentStep = useMemo(() => {
    return steps.find((step) => {
      if (step.type === "manual") {
        return !acknowledgedSteps[step.id];
      }

      return !step.whenComplete?.(commands, hasProgramRun);
    }) ?? null;
  }, [acknowledgedSteps, commands, hasProgramRun, steps]);

  useEffect(() => {
    if (!flow || currentStep) {
      return;
    }

    const nextProgress =
      flow === "level1"
        ? { ...progress, completedLevel1: true }
        : flow === "level2"
          ? { ...progress, completedLevel2: true }
          : { ...progress, completedToggleIntro: true };

    setProgress(nextProgress);
    saveProgress(nextProgress);
  }, [currentStep, flow, progress]);

  function handleContinue() {
    if (!currentStep || currentStep.type !== "manual") {
      return;
    }

    setAcknowledgedSteps((current) => ({
      ...current,
      [currentStep.id]: true,
    }));
  }

  function handleSkip() {
    const nextProgress = {
      ...progress,
      dismissed: true,
    };

    setProgress(nextProgress);
    saveProgress(nextProgress);
  }

  if (!currentStep) {
    return null;
  }

  return {
    body: currentStep.content.body,
    continueLabel: t.onboardingContinue,
    onContinue: currentStep.type === "manual" ? handleContinue : undefined,
    onSkip: handleSkip,
    skipLabel: t.onboardingSkip,
    target: currentStep.target,
    title: currentStep.content.title,
    type: currentStep.type,
  } as const;
}
