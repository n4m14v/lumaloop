import type { CSSProperties } from "react";

type LightCloudConfig = {
  left: string;
  opacity: number;
  scale: number;
  top: string;
};

const LIGHT_CLOUDS: LightCloudConfig[] = [
  { left: "-6%", opacity: 0.9, scale: 1.16, top: "4%" },
  { left: "24%", opacity: 0.82, scale: 0.98, top: "12%" },
  { left: "62%", opacity: 0.86, scale: 1.08, top: "48%" },
] as const;

const LIGHT_CLOUD_FILTER_SEEDS = {
  main: 218,
  shade: 541,
  soft: 92,
} as const;

export function LightThemeClouds() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute h-0 w-0" focusable="false">
        <defs>
          <filter id="light-cloud-filter-soft" x="-90%" y="-120%" width="280%" height="340%">
            <feTurbulence
              baseFrequency="0.012"
              numOctaves="4"
              result="noise"
              seed={LIGHT_CLOUD_FILTER_SEEDS.soft}
              type="fractalNoise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="110" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="light-cloud-filter-main" x="-90%" y="-120%" width="280%" height="340%">
            <feTurbulence
              baseFrequency="0.011"
              numOctaves="4"
              result="noise"
              seed={LIGHT_CLOUD_FILTER_SEEDS.main}
              type="fractalNoise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="145" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="light-cloud-filter-shade" x="-90%" y="-120%" width="280%" height="340%">
            <feTurbulence
              baseFrequency="0.013"
              numOctaves="3"
              result="noise"
              seed={LIGHT_CLOUD_FILTER_SEEDS.shade}
              type="fractalNoise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="92" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {LIGHT_CLOUDS.map((cloud, index) => (
        <div
          className="light-cloud"
          key={`cloud-${index}`}
          style={
            {
              "--cloud-scale": cloud.scale,
              left: cloud.left,
              opacity: cloud.opacity,
              top: cloud.top,
            } as CSSProperties
          }
        >
          <div className="light-cloud-layer light-cloud-layer-soft">
            <div className="light-cloud-source" />
          </div>
          <div className="light-cloud-layer light-cloud-layer-main">
            <div className="light-cloud-source" />
          </div>
          <div className="light-cloud-layer light-cloud-layer-shade">
            <div className="light-cloud-source" />
          </div>
        </div>
      ))}
    </div>
  );
}
