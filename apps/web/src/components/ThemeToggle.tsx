import { Moon, Sun } from "lucide-react";

import { useI18n } from "../i18n/I18nProvider";

type ThemeMode = "dark" | "light";

export function ThemeToggle({
  onToggle,
  theme,
}: {
  onToggle: () => void;
  theme: ThemeMode;
}) {
  const { t } = useI18n();
  const isDark = theme === "dark";
  const nextThemeLabel = isDark ? t.lightMode : t.darkMode;

  return (
    <button
      aria-label={`${t.theme}: ${nextThemeLabel}`}
      aria-checked={isDark}
      className="relative flex h-10 w-20 cursor-pointer items-center rounded-full border border-[var(--panel-border)] bg-[linear-gradient(180deg,var(--panel-bg-strong)_0%,var(--panel-bg)_100%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.12)] transition-[background-color,border-color,box-shadow] duration-300 hover:border-[var(--panel-border-strong)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_var(--accent-soft)]"
      onClick={onToggle}
      role="switch"
      title={`${t.theme}: ${nextThemeLabel}`}
      type="button"
    >
      <div
        className={[
          "absolute h-8 w-8 rounded-full border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,var(--accent)_0%,var(--accent-strong)_100%)] transition-all duration-300 ease-in-out",
          isDark
            ? "translate-x-10 shadow-[0_0_18px_var(--accent-shadow)]"
            : "translate-x-0 shadow-[0_0_14px_var(--accent-shadow)]",
        ].join(" ")}
      />

      <div className="z-10 flex w-full items-center justify-around">
        <Sun
          className={`transition-all duration-300 ${!isDark ? "scale-110 text-[var(--accent-foreground)]" : "text-[var(--text-muted)]"}`}
          size={18}
          strokeWidth={1.5}
        />
        <Moon
          className={`transition-all duration-300 ${isDark ? "scale-110 text-[var(--accent-foreground)]" : "text-[var(--text-muted)]"}`}
          size={18}
          strokeWidth={1.5}
        />
      </div>
    </button>
  );
}
