import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { LevelDefinition } from "@lumaloop/engine";

import {
  isRtlLocale,
  loadLocaleData,
  localizeLevel as applyLevelLocalization,
  type Locale,
  type LocaleData,
  type Messages,
} from "./translations";

const STORAGE_KEY = "lumaloop.locale";

type I18nContextValue = {
  isRtl: boolean;
  localizeLevel: (level: LevelDefinition) => LevelDefinition;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function detectPreferredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  try {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    if (savedLocale === "en" || savedLocale === "ru" || savedLocale === "he") {
      return savedLocale;
    }
  } catch {
    // Ignore storage access issues and fall back to browser settings.
  }

  const browserLocales = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const browserLocale of browserLocales) {
    if (browserLocale.startsWith("ru")) {
      return "ru";
    }

    if (browserLocale.startsWith("he") || browserLocale.startsWith("iw")) {
      return "he";
    }
  }

  return "en";
}

export function I18nProvider({
  children,
  initialLocale,
  initialLocaleData,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialLocaleData: LocaleData;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [localeData, setLocaleData] = useState(initialLocaleData);
  const latestRequestIdRef = useRef(0);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    void loadLocaleData(nextLocale).then((nextLocaleData) => {
      if (latestRequestIdRef.current !== requestId) {
        return;
      }

      setLocaleData(nextLocaleData);
      setLocaleState(nextLocale);
    });
  }, [locale]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = isRtlLocale(locale) ? "rtl" : "ltr";

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage access issues and keep locale in memory.
    }
  }, [locale]);

  const contextValue = useMemo<I18nContextValue>(() => {
    return {
      isRtl: isRtlLocale(locale),
      localizeLevel: (level) => applyLevelLocalization(level, localeData.levelCopy),
      locale,
      setLocale,
      t: localeData.messages,
    };
  }, [locale, localeData, setLocale]);

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
