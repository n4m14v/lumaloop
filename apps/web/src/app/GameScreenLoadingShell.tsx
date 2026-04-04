import { BrandLogo } from "../components/BrandLogo";

export function GameScreenLoadingShell({
  isVisible = true,
  subtitle = "Loading the puzzle grid...",
}: {
  isVisible?: boolean;
  subtitle?: string;
}) {
  return (
    <main
      className={[
        "fixed inset-0 z-[90] isolate flex min-h-screen items-center justify-center overflow-hidden bg-[rgba(3,7,13,0.7)] px-4 text-[var(--text-primary)] transition-[opacity,backdrop-filter] duration-500 ease-out",
        isVisible ? "opacity-100 backdrop-blur-[18px]" : "pointer-events-none opacity-0 backdrop-blur-[8px]",
      ].join(" ")}
    >
      <style>{`
        .loader {
          position: relative;
          width: 48px;
          height: 48px;
          background: var(--accent);
          transform: rotateX(65deg) rotate(45deg);
          color: #fff;
          animation: layers1 1s linear infinite alternate;
          box-shadow: 0 0 20px rgba(31,229,239,0.3);
        }
        .loader:after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.7);
          animation: layerTr 1s linear infinite alternate;
        }

        @keyframes layers1 {
          0% { box-shadow: 0px 0px 0 0px; }
          90%, 100% { box-shadow: 20px 20px 0 -4px var(--accent); }
        }
        @keyframes layerTr {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-25px, -25px) scale(1); }
        }
      `}</style>

      {/* LevelMap-Style Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(31,229,239,0.12),transparent_28%),radial-gradient(circle_at_84%_24%,rgba(255,156,84,0.08),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(108,147,255,0.08),transparent_26%)]" />

      <div className="relative flex w-full max-w-[22rem] flex-col items-center rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-8 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-[12px]">
        {/* Subtle reflective border edge */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px] border border-white/6" />

        <div className="relative mb-14 flex h-20 w-full items-center justify-center">
          <div className="loader" />
        </div>

        <h1>
          <BrandLogo className="text-[clamp(1.2rem,1.8vw,1.5rem)] font-semibold tracking-[0.12em]" strokeWidth={0.9} />
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          {subtitle}
        </p>
      </div>
    </main>
  );
}
