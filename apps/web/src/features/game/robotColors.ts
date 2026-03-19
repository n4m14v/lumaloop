export const ROBOT_COLOR_IDS = ["bronze", "gold", "silver", "aqua", "mint", "coral", "violet", "berry"] as const;

export type RobotColorId = (typeof ROBOT_COLOR_IDS)[number];

export type RobotPalette = {
  antenna: string;
  antennaTip: string;
  finish: "matte" | "metallic";
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
    finish: "metallic",
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
    finish: "metallic",
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
    finish: "metallic",
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
  aqua: {
    antenna: "#5ea6b3",
    antennaTip: "#d6fbff",
    finish: "matte",
    gltfAccent: "#d8fbff",
    gltfPrimary: "#57c8d6",
    joint: "#76b8c4",
    shellDark: "#2d97a5",
    shellEmissive: "#5bc0cf",
    shellLight: "#ebfeff",
    shellMid: "#74d9e5",
    swatch: "#63d2df",
    trim: "#2b6671",
    visor: "#102429",
  },
  mint: {
    antenna: "#74a986",
    antennaTip: "#e2fde9",
    finish: "matte",
    gltfAccent: "#ecfff3",
    gltfPrimary: "#86d5ab",
    joint: "#90baa0",
    shellDark: "#5ea37e",
    shellEmissive: "#88c89f",
    shellLight: "#f3fff7",
    shellMid: "#a8e1be",
    swatch: "#8ed7ad",
    trim: "#4e7a61",
    visor: "#13221b",
  },
  coral: {
    antenna: "#c48270",
    antennaTip: "#ffe1d4",
    finish: "matte",
    gltfAccent: "#fff0ea",
    gltfPrimary: "#f08f72",
    joint: "#d79d8d",
    shellDark: "#d3684e",
    shellEmissive: "#eb876d",
    shellLight: "#fff7f3",
    shellMid: "#f7a48d",
    swatch: "#ef8a6f",
    trim: "#91584c",
    visor: "#251410",
  },
  violet: {
    antenna: "#8e85c5",
    antennaTip: "#ece6ff",
    finish: "matte",
    gltfAccent: "#f4efff",
    gltfPrimary: "#9f8ff0",
    joint: "#a899cf",
    shellDark: "#7363d7",
    shellEmissive: "#9384ea",
    shellLight: "#fbf9ff",
    shellMid: "#b8acf7",
    swatch: "#9e90f0",
    trim: "#5b4f90",
    visor: "#171428",
  },
  berry: {
    antenna: "#b06f99",
    antennaTip: "#ffdff1",
    finish: "matte",
    gltfAccent: "#fff0f7",
    gltfPrimary: "#d56ba7",
    joint: "#c38ab0",
    shellDark: "#b54886",
    shellEmissive: "#d066a1",
    shellLight: "#fff7fb",
    shellMid: "#e593c0",
    swatch: "#d86ca9",
    trim: "#7b4767",
    visor: "#23131c",
  },
};
