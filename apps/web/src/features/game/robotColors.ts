export const ROBOT_COLOR_IDS = ["bronze", "gold", "silver"] as const;

export type RobotColorId = (typeof ROBOT_COLOR_IDS)[number];

export type RobotPalette = {
  antenna: string;
  antennaTip: string;
  gltfAccent: string;
  gltfPrimary: string;
  joint: string;
  shellDark: string;
  shellEmissive: string;
  shellLight: string;
  shellMid: string;
  swatch: string;
  trim: string;
  visor: string;
};

export const ROBOT_PALETTES: Record<RobotColorId, RobotPalette> = {
  bronze: {
    antenna: "#8a6b52",
    antennaTip: "#ffbc7a",
    gltfAccent: "#f3d1b3",
    gltfPrimary: "#b7733f",
    joint: "#91694e",
    shellDark: "#8f562f",
    shellEmissive: "#9f6437",
    shellLight: "#efd8c7",
    shellMid: "#ca9064",
    swatch: "#b77445",
    trim: "#5a3f2c",
    visor: "#170f0c",
  },
  gold: {
    antenna: "#9a7e4f",
    antennaTip: "#ffe17a",
    gltfAccent: "#ffe7ae",
    gltfPrimary: "#d8a63b",
    joint: "#b08e55",
    shellDark: "#af7f1f",
    shellEmissive: "#bd8e2d",
    shellLight: "#fff4d5",
    shellMid: "#efca74",
    swatch: "#ddb14b",
    trim: "#654c20",
    visor: "#17120a",
  },
  silver: {
    antenna: "#8a98a8",
    antennaTip: "#dce6f2",
    gltfAccent: "#f7fbff",
    gltfPrimary: "#c5d0dc",
    joint: "#95a2b1",
    shellDark: "#9da9b7",
    shellEmissive: "#8d99a7",
    shellLight: "#ffffff",
    shellMid: "#dbe3ec",
    swatch: "#ccd6e1",
    trim: "#5f6d7d",
    visor: "#0d1620",
  },
};
