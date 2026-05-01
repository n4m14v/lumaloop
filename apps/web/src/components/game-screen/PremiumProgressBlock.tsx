export function PremiumProgressBlock({
  className = "",
  completed,
  nextLabel = "Next: multi-step systems",
  progressLabel,
  total,
  unlockLabel = "You unlocked: switches control the path",
}: {
  className?: string;
  completed: number;
  nextLabel?: string;
  progressLabel?: string | undefined;
  total: number;
  unlockLabel?: string;
}) {
  const progressPercent = total > 0 ? Math.min(100, Math.max(0, Math.round((completed / total) * 100))) : 0;

  return (
    <div
      className={[
        "rounded-[22px] border border-white/10 bg-[#07111c]/62 px-5 py-5 text-center",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        className,
      ].join(" ")}
    >
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100">
        {progressLabel}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-[var(--text-muted)]">
        You're {progressPercent}% into the system.
      </p>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#58e85b,#c8ff74)] shadow-[0_0_20px_rgba(88,232,91,0.46)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mt-5 rounded-[16px] border border-emerald-300/18 bg-emerald-300/8 px-4 py-3">
        <p className="text-[12px] font-black uppercase tracking-[0.14em] text-emerald-100">
          {unlockLabel}
        </p>
        <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#ffe08a]">
          {nextLabel}
        </p>
      </div>
    </div>
  );
}
