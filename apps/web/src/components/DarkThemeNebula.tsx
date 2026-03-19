import type { CSSProperties } from "react";

const NEBULA_STYLE = {
  "--nebula-accent": "rgba(170, 141, 45, 0.22)",
  "--nebula-core": "rgba(255, 230, 238, 0.3)",
  "--nebula-highlight": "rgba(56, 116, 255, 0.47)",
  "--nebula-primary": "rgba(202, 109, 83, 0.73)",
  "--nebula-secondary": "rgba(88, 106, 255, 0.2)",
  left: "30%",
  opacity: 0.82,
  top: "20%",
} as CSSProperties;

export function DarkThemeNebula() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="dark-nebula" style={NEBULA_STYLE}>
        <div className="dark-nebula-dust" />
      </div>
    </div>
  );
}
