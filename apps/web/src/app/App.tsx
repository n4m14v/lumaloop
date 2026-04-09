import { Suspense, lazy, useCallback, useEffect, useState } from "react";

import { I18nProvider, detectPreferredLocale, useI18n } from "../i18n/I18nProvider";
import { loadLocaleData, type Locale, type LocaleData } from "../i18n/translations";
import { GameScreenLoadingShell } from "./GameScreenLoadingShell";
import { GameSplashScreen } from "./GameSplashScreen";

const MIN_LOADER_VISIBLE_MS = 1500;
const POST_SCENE_READY_DELAY_MS = 500;
const LOADER_FADE_OUT_MS = 500;
const SPLASH_FADE_OUT_MS = 420;

type AppRoute = "/" | "/play";

const loadGameScreen = async () => {
  const module = await import("../screens/GameScreen");
  return { default: module.GameScreen };
};

const GameScreen = lazy(loadGameScreen);

function normalizeRoute(pathname: string): AppRoute {
  if (pathname === "/play") {
    return "/play";
  }

  return "/";
}

function PlayRoute({
  hideLoader = false,
  onReady,
}: {
  hideLoader?: boolean;
  onReady?: (() => void) | undefined;
}) {
  const { t } = useI18n();
  const [isBootstrapReady, setIsBootstrapReady] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(true);
  const [shouldRenderLoader, setShouldRenderLoader] = useState(true);
  const [hasReportedReady, setHasReportedReady] = useState(false);

  useEffect(() => {
    let isActive = true;
    const startedAt = performance.now();
    let bootstrapTimeoutId: number | null = null;

    void loadGameScreen().then(() => {
      if (!isActive) {
        return;
      }

      const elapsedMs = performance.now() - startedAt;
      const remainingDelayMs = Math.max(0, MIN_LOADER_VISIBLE_MS - elapsedMs);

      bootstrapTimeoutId = window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        setIsBootstrapReady(true);
      }, remainingDelayMs);
    });

    return () => {
      isActive = false;

      if (bootstrapTimeoutId !== null) {
        window.clearTimeout(bootstrapTimeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isBootstrapReady || !isSceneReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, POST_SCENE_READY_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isBootstrapReady, isSceneReady]);

  useEffect(() => {
    if (!hideLoader || !isBootstrapReady || !isSceneReady || hasReportedReady) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasReportedReady(true);
      onReady?.();
    }, POST_SCENE_READY_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasReportedReady, hideLoader, isBootstrapReady, isSceneReady, onReady]);

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

  if (!isBootstrapReady) {
    if (hideLoader) {
      return null;
    }

    return <GameScreenLoadingShell subtitle={t.loaderSubtitle} />;
  }

  return (
    <>
      {!hideLoader && shouldRenderLoader ? (
        <GameScreenLoadingShell
          isVisible={isLoaderVisible}
          subtitle={t.loaderSubtitle}
        />
      ) : null}
      <Suspense fallback={hideLoader ? null : <GameScreenLoadingShell subtitle={t.loaderSubtitle} />}>
        <GameScreen onSceneReady={() => setIsSceneReady(true)} />
      </Suspense>
    </>
  );
}

function RoutedApp({
  navigate,
  route,
}: {
  navigate: (nextRoute: AppRoute) => void;
  route: AppRoute;
}) {
  const [isSplashVisible, setIsSplashVisible] = useState(route === "/");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (route === "/") {
      setIsSplashVisible(true);
      setIsStarting(false);
    }
  }, [route]);

  useEffect(() => {
    if (!isStarting || isSplashVisible) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsStarting(false);
    }, SPLASH_FADE_OUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isSplashVisible, isStarting]);

  const handleStart = useCallback(() => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);
    void loadGameScreen();
    navigate("/play");
  }, [isStarting, navigate]);

  if (route === "/") {
    return <GameSplashScreen isLoading={isStarting} isVisible={isSplashVisible} onStart={handleStart} />;
  }

  return (
    <>
      <PlayRoute
        hideLoader={isStarting}
        onReady={isStarting ? () => setIsSplashVisible(false) : undefined}
      />
      {isStarting || isSplashVisible ? (
        <GameSplashScreen
          isLoading={isStarting}
          isVisible={isSplashVisible}
          onStart={handleStart}
        />
      ) : null}
    </>
  );
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window === "undefined" ? "/" : normalizeRoute(window.location.pathname),
  );
  const [localeBootstrap, setLocaleBootstrap] = useState<{ locale: Locale; localeData: LocaleData } | null>(null);

  useEffect(() => {
    function handlePopState() {
      setRoute(normalizeRoute(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const initialLocale = detectPreferredLocale();

    void loadLocaleData(initialLocale).then((localeData) => {
      if (!isActive) {
        return;
      }

      setLocaleBootstrap({ locale: initialLocale, localeData });
    });

    return () => {
      isActive = false;
    };
  }, []);

  const navigate = useCallback((nextRoute: AppRoute) => {
    const normalizedRoute = normalizeRoute(nextRoute);

    if (normalizedRoute === route) {
      return;
    }

    window.history.pushState(null, "", normalizedRoute);
    setRoute(normalizedRoute);
  }, [route]);

  if (!localeBootstrap) {
    return <GameScreenLoadingShell />;
  }

  return (
    <I18nProvider initialLocale={localeBootstrap.locale} initialLocaleData={localeBootstrap.localeData}>
      <RoutedApp navigate={navigate} route={route} />
    </I18nProvider>
  );
}
