import { withBasePath } from "./basePath";

import { useEffect } from "react";

import { useI18n } from "../i18n/I18nProvider";
import { BrandLogo } from "../components/BrandLogo";
import { LanguageSelect } from "../components/LanguageSelect";

export function GameSplashScreen({
  isLoading = false,
  isVisible,
  onStart,
}: {
  isLoading?: boolean;
  isVisible: boolean;
  onStart: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onStart();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onStart]);

  return (
    <main
      className={[
        "fixed inset-0 z-[95] isolate overflow-hidden transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <style>{`
        .splash-cta-shell {
          position: relative;
        }

        .splash-cta-shell::before,
        .splash-cta-shell::after {
          content: "";
          position: absolute;
          inset: -4px;
          border: 2px solid rgba(0, 242, 255, 0.72);
          border-radius: 28px;
          opacity: 0;
          pointer-events: none;
        }

        .splash-cta-shell[data-loading="true"]::before,
        .splash-cta-shell[data-loading="true"]::after {
          animation: splash-cta-pulse 2s ease-out infinite;
        }

        .splash-cta-shell[data-loading="true"]::after {
          animation-delay: 1s;
        }

        @keyframes splash-cta-pulse {
          0% {
            transform: scale(1);
            opacity: 0.68;
          }

          100% {
            transform: scale(1.16);
            opacity: 0;
          }
        }
      `}</style>
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        src={withBasePath("/splash.webp")}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,19,0.58)_0%,rgba(4,9,19,0.3)_20%,rgba(4,9,19,0.22)_50%,rgba(4,9,19,0.68)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(98,177,255,0.2),transparent_16%),radial-gradient(circle_at_58%_42%,rgba(255,146,108,0.14),transparent_22%),radial-gradient(circle_at_50%_74%,rgba(31,229,239,0.08),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_18%,transparent_78%,rgba(255,255,255,0.02))]" />

      <div className="absolute left-4 top-3 z-10 flex items-center gap-2 md:left-6 md:top-4" dir="ltr">
        <LanguageSelect />
      </div>

      <div className="relative flex min-h-screen flex-col items-center px-6 pb-12 pt-[10vh] text-center">
        <div
          className={[
            "max-w-[54rem] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          ].join(" ")}
        >
          <h1>
            <BrandLogo className="text-[clamp(3rem,9vw,7rem)] font-semibold tracking-[0.08em]" strokeWidth={1.5} />
          </h1>
          <p className="mx-auto mt-2 max-w-[36rem] text-[clamp(0.88rem,1.5vw,1.22rem)] font-medium uppercase tracking-[0.14em] text-[rgba(231,239,248,0.9)] [text-shadow:0_0_24px_rgba(0,0,0,0.3)]">
            {t.splashTagline}
          </p>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <div
            className={[
              "splash-cta-shell rounded-[30px] border border-[rgba(79,217,244,0.18)] p-[10px]",
              isLoading
                ? "opacity-90 shadow-[0_0_0_1px_rgba(0,242,255,0.08),0_0_18px_rgba(0,242,255,0.13),0_0_44px_rgba(0,242,255,0.11)]"
                : "shadow-[0_0_0_1px_rgba(0,242,255,0.06),0_0_18px_rgba(0,242,255,0.12),0_0_42px_rgba(0,242,255,0.1)]",
            ].join(" ")}
            data-loading={isLoading ? "true" : "false"}
          >
            <button
              className={[
                "group relative inline-flex min-h-[3.85rem] min-w-[min(18.75rem,72vw)] items-center justify-center overflow-hidden rounded-[20px] border px-8 py-3",
                isLoading
                  ? "border-[rgba(154,244,255,0.48)] bg-[linear-gradient(180deg,#73e7fb_0%,#4ec9e5_44%,#42bad7_100%)] text-[rgba(23,53,68,0.9)]"
                  : "border-[rgba(154,244,255,0.6)] bg-[linear-gradient(180deg,#7feeff_0%,#57d8f1_44%,#49c8e7_100%)] text-[#173544]",
                isLoading
                  ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.06),0_0_14px_rgba(0,242,255,0.14)]"
                  : "shadow-[inset_0_1px_0_rgba(255,255,255,0.34),inset_0_-1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.08),0_0_20px_rgba(0,242,255,0.18)]",
                isLoading
                  ? "transition-[filter,box-shadow] duration-300 ease-out"
                  : "transition-[transform,box-shadow,filter] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.36),inset_0_-1px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.1),0_0_26px_rgba(0,242,255,0.22)] active:translate-y-0 active:scale-[0.985]",
              ].join(" ")}
              aria-disabled={isLoading}
              onClick={onStart}
              type="button"
            >
              <span className="pointer-events-none absolute inset-[2px] rounded-[19px] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)_32%,transparent_46%)]" />
              <span className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-[rgba(232,252,255,0.42)] blur-[0.4px]" />
              <span className="relative block h-[1.4em] min-w-[18ch] overflow-x-visible overflow-y-hidden px-2.5">
                <span
                  className={[
                    "absolute inset-0 flex items-center justify-center whitespace-nowrap font-display text-[clamp(1.05rem,1.55vw,1.45rem)] font-semibold uppercase tracking-[0.11em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isLoading ? "-translate-y-[130%] opacity-0 blur-[2px]" : "translate-y-0 opacity-100 blur-0",
                  ].join(" ")}
                >
                  {t.splashStart}
                </span>
                <span
                  className={[
                    "absolute inset-0 flex items-center justify-center whitespace-nowrap font-display text-[clamp(0.95rem,1.4vw,1.25rem)] font-semibold uppercase tracking-[0.08em] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isLoading ? "translate-y-0 opacity-100 blur-0" : "translate-y-[130%] opacity-0 blur-[2px]",
                  ].join(" ")}
                >
                  {t.splashLoading}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
