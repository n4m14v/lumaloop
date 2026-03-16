import { useRef, useState, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider";
import { LOCALE_OPTIONS } from "../i18n/translations";

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label={t.language}
        className="ui-button h-8 w-8 justify-center px-0"
        onClick={() => setOpen((v) => !v)}
        title={t.language}
        type="button"
      >
        <Languages className="h-4 w-4" />
      </button>

      {open && (
        <div className="ui-panel absolute left-0 top-[calc(100%+10px)] z-30 w-48 rounded-[16px] p-2 text-[var(--text-primary)]">
          <div className="space-y-1">
            {LOCALE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={[
                  "flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[13px] transition",
                  option.value === locale
                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5",
                ].join(" ")}
                onClick={() => {
                  setLocale(option.value);
                  setOpen(false);
                }}
                type="button"
              >
                <span>{option.label}</span>
                {option.value === locale && <Check className="h-4 w-4 text-[var(--accent)]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
