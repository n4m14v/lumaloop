export function BrandLogo({
  className,
  strokeWidth = 1,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <span
      className={[
        "font-display uppercase leading-[100%] text-transparent [text-shadow:0_0_14px_rgba(0,242,255,0.1),0_0_28px_rgba(0,242,255,0.14)]",
        className ?? "",
      ].join(" ")}
      style={{ WebkitTextStroke: `${strokeWidth}px #00f2ff` }}
    >
      LUMALOOP
    </span>
  );
}
