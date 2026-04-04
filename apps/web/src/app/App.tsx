import { Suspense, lazy, useEffect, useState } from "react";
import { I18nProvider, detectPreferredLocale } from "../i18n/I18nProvider";
import { loadLocaleData, type Locale, type LocaleData } from "../i18n/translations";
import { GameScreenLoadingShell } from "./GameScreenLoadingShell";

const loadGameScreen = async () => {
  const module = await import("../screens/GameScreen");
  return { default: module.GameScreen };
};

const GameScreen = lazy(loadGameScreen);
const MIN_LOADER_VISIBLE_MS = 1500;
const POST_SCENE_READY_DELAY_MS = 500;
const LOADER_FADE_OUT_MS = 500;

export function App() {
  const [bootstrap, setBootstrap] = useState<{ locale: Locale; localeData: LocaleData } | null>(null);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [shouldRenderLoader, setShouldRenderLoader] = useState(true);

  useEffect(() => {
    let isActive = true;
    const initialLocale = detectPreferredLocale();
    const startedAt = performance.now();
    let settleTimeoutId: number | null = null;

    void Promise.all([loadLocaleData(initialLocale), loadGameScreen()]).then(([localeData]) => {
      if (!isActive) {
        return;
      }

      const elapsedMs = performance.now() - startedAt;
      const remainingDelayMs = Math.max(0, MIN_LOADER_VISIBLE_MS - elapsedMs);

      settleTimeoutId = window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        setBootstrap({ locale: initialLocale, localeData });
      }, remainingDelayMs);
    });

    return () => {
      isActive = false;
      if (settleTimeoutId !== null) {
        window.clearTimeout(settleTimeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!bootstrap || !isSceneReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, POST_SCENE_READY_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bootstrap, isSceneReady]);

  useEffect(() => {
    if (isLoaderVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldRenderLoader(false);
    }, LOADER_FADE_OUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoaderVisible]);

  if (!bootstrap) {
    return <GameScreenLoadingShell />;
  }

  return (
    <I18nProvider initialLocale={bootstrap.locale} initialLocaleData={bootstrap.localeData}>
      {shouldRenderLoader ? <GameScreenLoadingShell isVisible={isLoaderVisible} /> : null}
      <Suspense fallback={<GameScreenLoadingShell />}>
        <GameScreen onSceneReady={() => setIsSceneReady(true)} />
      </Suspense>
    </I18nProvider>
  );
}
