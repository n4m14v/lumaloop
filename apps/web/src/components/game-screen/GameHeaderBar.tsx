import { withBasePath } from "../../app/basePath";

import { Suspense, lazy, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { CircleHelp, ChevronDown } from "lucide-react";

import type { LevelDefinition } from "@lumaloop/engine";

import type { LevelAccessState } from "../../features/monetization/access";
import type { RobotColorId } from "../../features/game/robotColors";
import type { LevelProgressState } from "../../screens/game-screen/levelProgressStorage";
import { useI18n } from "../../i18n/I18nProvider";
import { BrandLogo } from "../BrandLogo";
import { GameMenu } from "../GameMenu";
import { LanguageSelect } from "../LanguageSelect";
import { GameStatusSnackbar, type GameStatusFeedback } from "./GameStatusSnackbar";
import { LevelMapBackdrop, LevelMapOverlayBackdrop, type LevelMapSection } from "./LevelMapBackdrop";
import { PremiumProgressBlock } from "./PremiumProgressBlock";
import { RunModeSplitButton } from "./RunModeSplitButton";

const GameWalkthroughDialog = lazy(async () => {
  const module = await import("./GameWalkthroughDialog");
  return { default: module.GameWalkthroughDialog };
});

type HeaderHelpTone = "info" | "success" | "warning" | "error" | "invalid";

interface HeaderHelpPopover {
  controlsBody?: string;
  feedback?: { body: string; title: string; tone: HeaderHelpTone } | null;
  goalLabel: string;
  guideBody: string;
  guideHint: string;
  guideTitle: string;
}

interface HeaderObjectivePopover {
  objectiveBody: string;
  objectiveLabel: string;
  objectiveTitle: string;
}

interface HeaderMenuConfig {
  extraActions?: Array<{ label: string; onSelect: () => void }>;
  onReplayTutorial?: () => void;
  onSetRobotColorId?: (value: RobotColorId) => void;
  onSetShowAllActions?: (value: boolean) => void;
  robotColorId?: RobotColorId;
  showAllActions?: boolean;
  titleEyebrow?: string;
}

interface MonetizationConfig {
  checkoutStatus: "cancelled" | "idle" | "success";
  hasFullGame: boolean;
  isAuthConfigured: boolean;
  isPurchasePromptOpen: boolean;
  message: string | null;
  previewNextWorldName: string;
  previewProgressCompleted: number;
  previewProgressTotal: number;
  onClosePurchasePrompt: () => void;
  onRefreshEntitlements: () => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onUnlockFullGame: () => Promise<void>;
  syncStatus: "local" | "offline" | "syncing" | "synced" | "error";
  userEmail: string | null;
}

interface GameHeaderBarProps {
  canStartRun: boolean;
  currentLevelIndex: number;
  isAutoRunning: boolean;
  isLevelMapOpen: boolean;
  levelId: string;
  levelName: string;
  levelProgress: LevelProgressState;
  localizedLevels?: LevelDefinition[];
  levelAccessStates?: LevelAccessState[];
  levelMapSections?: LevelMapSection[];
  menu?: HeaderMenuConfig;
  monetization?: MonetizationConfig;
  objectivePopover?: HeaderObjectivePopover;
  onCloseLevelMap: () => void;
  onOpenLevelMap: () => void;
  onRunWithMode: (mode: "normal" | "fast" | "instant" | "pov") => void;
  runFeedback?: GameStatusFeedback | null;
  onSetLevelIndex: (index: number) => void;
  onToggleRun: () => void;
  selectedRunMode: "normal" | "fast" | "instant" | "pov";
  unlockedLevels: boolean[];
  helpPopover?: HeaderHelpPopover;
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getHelpToneClass(tone: HeaderHelpTone) {
  switch (tone) {
    case "success":
      return "border-emerald-300/55 bg-emerald-300/12 text-emerald-50";
    case "warning":
      return "border-amber-300/55 bg-amber-300/12 text-amber-50";
    case "error":
      return "border-rose-300/55 bg-rose-300/12 text-rose-50";
    case "invalid":
      return "border-rose-300/65 bg-rose-300/14 text-rose-50";
    default:
      return "border-sky-200/45 bg-sky-200/10 text-slate-100";
  }
}

export function GameHeaderBar({
  canStartRun,
  currentLevelIndex,
  isAutoRunning,
  isLevelMapOpen,
  levelId,
  levelName,
  levelProgress,
  localizedLevels,
  levelAccessStates,
  levelMapSections,
  menu,
  monetization,
  objectivePopover,
  onCloseLevelMap,
  onOpenLevelMap,
  onRunWithMode,
  runFeedback,
  onSetLevelIndex,
  onToggleRun,
  selectedRunMode,
  unlockedLevels,
  helpPopover,
}: GameHeaderBarProps) {
  const { t } = useI18n();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isObjectiveOpen, setIsObjectiveOpen] = useState(false);
  const [hasOpenedLevelMap, setHasOpenedLevelMap] = useState(false);
  const [hasOpenedWalkthrough, setHasOpenedWalkthrough] = useState(false);
  const helpRef = useRef<HTMLDivElement | null>(null);
  const objectiveRef = useRef<HTMLDivElement | null>(null);
  const menuProps = {
    ...(monetization !== undefined
      ? {
          accountStatus: {
            email: monetization.userEmail,
            label: monetization.hasFullGame
              ? "Full game"
              : monetization.userEmail
                ? "Free account"
                : "Guest",
            syncStatus: monetization.syncStatus,
          },
        }
      : {}),
    title: levelName,
    ...(menu?.extraActions !== undefined ? { extraActions: menu.extraActions } : {}),
    ...(menu?.onReplayTutorial !== undefined ? { onReplayTutorial: menu.onReplayTutorial } : {}),
    ...(menu?.onSetRobotColorId !== undefined ? { onSetRobotColorId: menu.onSetRobotColorId } : {}),
    ...(menu?.onSetShowAllActions !== undefined ? { onSetShowAllActions: menu.onSetShowAllActions } : {}),
    ...(menu?.robotColorId !== undefined ? { robotColorId: menu.robotColorId } : {}),
    ...(menu?.showAllActions !== undefined ? { showAllActions: menu.showAllActions } : {}),
    ...(menu?.titleEyebrow !== undefined ? { titleEyebrow: menu.titleEyebrow } : {}),
  };
  const levelMapProps = {
    currentLevelId: levelId,
    isOpen: isLevelMapOpen,
    levelProgress,
    onClose: onCloseLevelMap,
    onSelectLevel: onSetLevelIndex,
    unlockedLevels,
    ...(levelAccessStates !== undefined ? { levelAccessStates } : {}),
    ...(localizedLevels !== undefined ? { localizedLevels } : {}),
    ...(levelMapSections !== undefined ? { sections: levelMapSections } : {}),
  };

  useEffect(() => {
    if (!isLevelMapOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseLevelMap();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLevelMapOpen, onCloseLevelMap]);

  useEffect(() => {
    if (!helpPopover || !isHelpOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!helpRef.current?.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsHelpOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [helpPopover, isHelpOpen]);

  useEffect(() => {
    if (!objectivePopover || !isObjectiveOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!objectiveRef.current?.contains(event.target as Node)) {
        setIsObjectiveOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsObjectiveOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isObjectiveOpen, objectivePopover]);

  useEffect(() => {
    setIsHelpOpen(false);
    setIsObjectiveOpen(false);
    setIsWalkthroughOpen(false);
  }, [currentLevelIndex, isAutoRunning]);

  return (
    <div className="pointer-events-none relative z-10 flex min-h-[calc(100vh-3rem)] flex-col">
      <div className="pointer-events-none relative xl:pr-[364px]">
        <div
          className="ui-gloss-panel pointer-events-auto relative z-20 grid gap-3 px-4 py-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center"
          dir="ltr"
        >
          <div className="flex items-center gap-2 md:justify-self-start">
            <GameMenu {...menuProps} />
            <LanguageSelect />
            <div className="relative" ref={helpRef}>
              <button
                aria-label={helpPopover ? "Help" : t.walkthroughOpen}
                className="ui-button h-8 w-8 justify-center rounded-full px-0 font-display text-sm font-semibold text-[var(--text-primary)]"
                onClick={() => {
                  if (helpPopover) {
                    setIsHelpOpen((value) => !value);
                    return;
                  }

                  setHasOpenedWalkthrough(true);
                  setIsWalkthroughOpen(true);
                }}
                title={helpPopover ? "Help" : t.walkthroughOpen}
                type="button"
              >
                ?
              </button>

              {helpPopover && isHelpOpen ? (
                <div className="ui-panel absolute left-0 top-[calc(100%+10px)] z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[16px] p-3.5 text-[var(--text-primary)]">
                  {helpPopover.feedback ? (
                    <div className={cx("rounded-[12px] border px-3 py-3", getHelpToneClass(helpPopover.feedback.tone))}>
                      <p className="text-[10px] uppercase tracking-[0.16em] opacity-75">Latest feedback</p>
                      <p className="mt-1 text-sm font-semibold">{helpPopover.feedback.title}</p>
                      <p className="mt-1 text-sm leading-6 opacity-90">{helpPopover.feedback.body}</p>
                    </div>
                  ) : null}
                  <div className={cx("rounded-[12px] border border-white/8 bg-white/4 px-3 py-3", helpPopover.feedback && "mt-3")}>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Goal</p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">{helpPopover.goalLabel}</p>
                  </div>
                  <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                    <h2 className="font-display text-lg text-white">{helpPopover.guideTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{helpPopover.guideBody}</p>
                    <p className="mt-3 rounded-[10px] border border-[var(--accent-soft)] bg-[var(--accent-soft)] px-3 py-2 text-sm leading-6 text-white/90">
                      {helpPopover.guideHint}
                    </p>
                  </div>
                  <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Controls</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {helpPopover.controlsBody ?? "Enter toggles the run button. Drag the scene to orbit the camera."}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-center md:justify-self-center">
            <h1>
              <BrandLogo className="text-[clamp(1.15rem,1.35vw,1.5rem)] font-semibold tracking-[0.08em]" strokeWidth={0.85} />
            </h1>
            <div className="pointer-events-auto relative flex items-center gap-2" ref={objectiveRef}>
              <button
                aria-expanded={isLevelMapOpen}
                className="ui-button flex h-9 items-center gap-2 rounded-[12px] px-3 text-left"
                onClick={() => {
                  setHasOpenedLevelMap(true);
                  onOpenLevelMap();
                }}
                type="button"
              >
                <span className="max-w-[min(42vw,19rem)] truncate text-[0.72rem] font-medium text-[var(--text-primary)] md:text-[0.78rem]">
                  {t.level} {currentLevelIndex + 1}: {levelName}
                </span>
                <ChevronDown
                  className={[
                    "h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition",
                    isLevelMapOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>
              {objectivePopover ? (
                <>
                  <button
                    aria-expanded={isObjectiveOpen}
                    aria-label={objectivePopover.objectiveTitle}
                    className="ui-button flex h-9 w-9 items-center justify-center rounded-[12px] px-0"
                    onClick={() => {
                      setIsObjectiveOpen((value) => !value);
                    }}
                    title={objectivePopover.objectiveTitle}
                    type="button"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                  {isObjectiveOpen ? (
                    <div className="ui-panel absolute left-1/2 top-[calc(100%+10px)] z-30 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-[16px] p-3.5 text-left text-[var(--text-primary)]">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{objectivePopover.objectiveTitle}</p>
                      <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Objective</p>
                        <p className="mt-1 text-sm text-[var(--text-primary)]">{objectivePopover.objectiveLabel}</p>
                      </div>
                      <div className="mt-3 rounded-[12px] border border-white/8 bg-white/4 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Mission Brief</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{objectivePopover.objectiveBody}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>

          <div className="pointer-events-auto relative z-20 flex items-center justify-end gap-2 md:justify-self-end">
            <div data-onboarding="run-button">
              <RunModeSplitButton
                canStartRun={canStartRun}
                isRunning={isAutoRunning}
                labels={{ pause: t.pause, runOptions: t.runOptions }}
                onRunWithMode={onRunWithMode}
                onToggleRun={onToggleRun}
                options={[
                  { label: t.play, mode: "normal" },
                  { label: t.fastPlay, mode: "fast" },
                  { label: t.povMode, mode: "pov" },
                  { label: t.skipToEnd, mode: "instant" },
                ]}
                selectedRunMode={selectedRunMode}
              />
            </div>
          </div>
        </div>

        <GameStatusSnackbar
          className="absolute right-4 top-[calc(100%+20px)] z-10 w-[min(24rem,calc(100vw-2rem))] xl:right-[380px]"
          feedback={runFeedback ?? null}
        />
      </div>

      {hasOpenedLevelMap ? (
        <LevelMapBackdrop {...levelMapProps} />
      ) : null}
      {!helpPopover && hasOpenedWalkthrough ? (
        <Suspense fallback={null}>
          <GameWalkthroughDialog onClose={() => setIsWalkthroughOpen(false)} open={isWalkthroughOpen} />
        </Suspense>
      ) : null}
      {monetization?.isPurchasePromptOpen ? (
        <PurchaseDialog monetization={monetization} t={t} />
      ) : null}

      <div className="flex-1" />
    </div>
  );
}

function PurchaseDialog({ monetization, t }: { monetization: MonetizationConfig; t: ReturnType<typeof useI18n>["t"] }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"intro" | "checkout">("intro");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        monetization.onClosePurchasePrompt();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [monetization]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsBusy(true);

    try {
      if (mode === "sign-in") {
        await monetization.onSignIn(email, password);
      } else {
        await monetization.onSignUp(email, password);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Authentication failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function unlock() {
    setError(null);
    setIsBusy(true);

    try {
      await monetization.onUnlockFullGame();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Checkout failed.");
      setIsBusy(false);
    }
  }

  function continueToCheckout() {
    setError(null);
    setStage("checkout");
  }

  return createPortal(
    <LevelMapOverlayBackdrop
      contentClassName="relative flex h-full items-center justify-center px-4"
      isOpen
      onClick={monetization.onClosePurchasePrompt}
      overlayClassName="z-[100]"
    >
      <div
        className="ui-gloss-panel relative flex w-full max-w-[54rem] flex-col overflow-hidden rounded-[24px] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="ui-button absolute right-4 top-4 z-20 h-8 w-8 justify-center rounded-full px-0 hover:bg-white/5 hover:text-white"
          onClick={monetization.onClosePurchasePrompt}
          type="button"
        >
          ✕
        </button>

        <div className="absolute inset-0 overflow-hidden">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={withBasePath("/splash.webp")}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,19,0.76)_0%,rgba(4,9,19,0.68)_44%,rgba(4,9,19,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(90,255,108,0.18)_0%,transparent_42%)]" />
        </div>

        {stage === "intro" ? (
          <div className="relative z-10 mx-auto flex w-full max-w-[38rem] flex-col items-center px-6 py-10 text-center md:px-10 md:py-12">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">
              Next world
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.1rem,5vw,4.2rem)] font-semibold leading-[0.95] text-white">
              {monetization.previewNextWorldName}
            </h2>
            <p className="mt-4 max-w-[24rem] text-[16px] font-semibold leading-7 text-[var(--text-secondary)]">
              {t.worldSubtitle("world-03-height")}
            </p>

            <PremiumProgressBlock
              className="mt-8 w-full max-w-[430px]"
              completed={monetization.previewProgressCompleted}
              nextLabel={`Next: ${monetization.previewNextWorldName}`}
              progressLabel={t.premiumPreviewProgress(monetization.previewProgressCompleted, monetization.previewProgressTotal)}
              total={monetization.previewProgressTotal}
            />

            <p className="mt-7 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#ffe08a]">
              You are not done yet.
            </p>
            <div className="mt-7 flex w-full max-w-[360px] flex-col gap-3">
              <button
                className="ui-button-accent h-12 w-full justify-center rounded-[16px] text-[13px] font-black uppercase tracking-[0.12em] shadow-[0_0_34px_rgba(89,217,87,0.32)]"
                onClick={continueToCheckout}
                type="button"
              >
                Play Next Level
              </button>
              <button
                className="ui-button h-10 w-full justify-center rounded-[14px] border-white/10 bg-white/[0.025] text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]"
                onClick={continueToCheckout}
                type="button"
              >
                Unlock Full Game
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid w-full gap-0 md:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="max-w-[28rem]">
                <button
                  className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] transition hover:text-white"
                  onClick={() => setStage("intro")}
                  type="button"
                >
                  Back
                </button>
                <h2 className="font-display text-4xl font-semibold leading-tight text-white">
                  Continue the campaign
                </h2>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {monetization.message ?? "Unlock the next systems and keep your progress across devices."}
                </p>

                <div className="mt-8 grid gap-3">
                  {[
                    "Harder systems and multi-path puzzles.",
                    "Processes, recursion, switches, and full progression.",
                    "Progress kept across devices.",
                  ].map((benefit) => (
                    <div className="flex items-start gap-3 rounded-[14px] border border-white/8 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]" key={benefit}>
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
                  <button
                    className="ui-button-accent h-12 w-full justify-center rounded-[14px] text-[13px] font-black uppercase tracking-[0.1em]"
                    disabled={isBusy || monetization.hasFullGame || !monetization.userEmail}
                    onClick={() => void unlock()}
                    type="button"
                  >
                    {monetization.hasFullGame ? "Full game unlocked" : "Unlock Full Game"}
                  </button>
                  <button
                    className="ui-button h-10 w-full justify-center rounded-[12px] text-[13px] font-medium"
                    disabled={isBusy || !monetization.userEmail}
                    onClick={() => void monetization.onRefreshEntitlements()}
                    type="button"
                  >
                    Restore purchase
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 bg-black/26 p-8 md:border-l md:border-t-0 md:p-10">
              <div className="mx-auto max-w-[22rem]">
                <h3 className="font-display text-2xl font-semibold text-white">
                  {monetization.userEmail ? "Ready to unlock" : mode === "sign-in" ? "Sign in to save progress" : "Create an account"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {monetization.userEmail
                    ? "Your unlock and progress will stay with this account."
                    : "Use an account so your unlock and progress are not tied to this browser."}
                </p>

                {!monetization.isAuthConfigured ? (
                  <div className="mt-6 rounded-[12px] border border-amber-300/30 bg-amber-300/10 px-4 py-4 text-sm text-amber-50">
                    Supabase is not configured yet. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to enable sign in.
                  </div>
                ) : monetization.userEmail ? (
                  <div className="mt-6 rounded-[12px] border border-emerald-300/30 bg-emerald-300/10 px-4 py-4 text-center text-sm text-emerald-50">
                    Signed in as <br /><span className="font-semibold text-emerald-100">{monetization.userEmail}</span>.
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={submitAuth}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-secondary)]">Email</label>
                      <input
                        className="ui-input w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-secondary)]">Password</label>
                      <input
                        className="ui-input w-full rounded-[10px] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        type="password"
                        value={password}
                      />
                    </div>
                    <button className="ui-button h-10 w-full justify-center text-sm font-semibold" disabled={isBusy} type="submit">
                      {mode === "sign-in" ? "Sign in" : "Create account"}
                    </button>
                    <p className="text-center text-sm text-[var(--text-secondary)]">
                      {mode === "sign-in" ? "Need an account? " : "Already have one? "}
                      <button
                        className="font-medium text-white transition-colors hover:text-[var(--accent)]"
                        disabled={isBusy}
                        onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                        type="button"
                      >
                        {mode === "sign-in" ? "Create one" : "Sign in"}
                      </button>
                    </p>
                  </form>
                )}

                {error ? (
                  <div className="mt-4 rounded-[12px] border border-rose-300/35 bg-rose-300/10 px-4 py-3 text-sm text-rose-50 shadow-sm">{error}</div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </LevelMapOverlayBackdrop>,
    document.body,
  );
}
