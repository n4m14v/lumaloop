import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { getMessages, isRtlLocale, type Locale } from "./translations";

const STORAGE_KEY = "lumaloop.locale";

type I18nContextValue = {
  isRtl: boolean;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getMessages>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectPreferredLocale(): Locale {
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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => detectPreferredLocale());

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

  return (
    <I18nContext.Provider
      value={{
        isRtl: isRtlLocale(locale),
        locale,
        setLocale,
        t: getMessages(locale),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}
