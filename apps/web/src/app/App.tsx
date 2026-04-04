import { Suspense, lazy, useEffect, useState } from "react";
import { I18nProvider, detectPreferredLocale } from "../i18n/I18nProvider";
import { loadLocaleData, type Locale, type LocaleData } from "../i18n/translations";

const loadGameScreen = async () => {
  const module = await import("../screens/GameScreen");
  return { default: module.GameScreen };
};

const GameScreen = lazy(loadGameScreen);

function GameScreenLoadingShell() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#040b12] px-4 text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(31,229,239,0.12),transparent_28%),radial-gradient(circle_at_84%_24%,rgba(255,156,84,0.08),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(108,147,255,0.08),transparent_26%)]" />
      <div className="relative flex w-full max-w-[22rem] flex-col items-center rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-[12px]">
        <div className="h-12 w-12 rounded-full border border-[var(--accent)] border-t-transparent animate-spin shadow-[0_0_20px_var(--accent-shadow)]" />
        <h1 className="mt-5 font-display text-[clamp(1.2rem,1.8vw,1.5rem)] font-semibold tracking-[0.08em]">
          LUMALOOP
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Loading the puzzle grid...
        </p>
      </div>
    </main>
  );
}

export function App() {
  const [bootstrap, setBootstrap] = useState<{ locale: Locale; localeData: LocaleData } | null>(null);

  useEffect(() => {
    let isActive = true;
    const initialLocale = detectPreferredLocale();

    void Promise.all([loadLocaleData(initialLocale), loadGameScreen()]).then(([localeData]) => {
      if (!isActive) {
        return;
      }

      setBootstrap({ locale: initialLocale, localeData });
    });

    return () => {
      isActive = false;
    };
  }, []);

  if (!bootstrap) {
    return <GameScreenLoadingShell />;
  }

  return (
    <I18nProvider initialLocale={bootstrap.locale} initialLocaleData={bootstrap.localeData}>
      <Suspense fallback={<GameScreenLoadingShell />}>
        <GameScreen />
      </Suspense>
    </I18nProvider>
  );
}
