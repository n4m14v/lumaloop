export const ROBOT_COLOR_IDS = ["classic", "mint", "coral", "amber"] as const;

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
  amber: {
    antenna: "#8f7b54",
    antennaTip: "#ffd05c",
    gltfAccent: "#ffe2a8",
    gltfPrimary: "#f0ab31",
    joint: "#a68453",
    shellDark: "#c38328",
    shellEmissive: "#c78a31",
    shellLight: "#fff3df",
    shellMid: "#efc87d",
    swatch: "#efb44e",
    trim: "#6b5330",
    visor: "#1a1511",
  },
  classic: {
    antenna: "#8aa0b5",
    antennaTip: "#ffd05c",
    gltfAccent: "#ffe0a6",
    gltfPrimary: "#f0a229",
    joint: "#8da1b8",
    shellDark: "#9fb1c5",
    shellEmissive: "#7a93a9",
    shellLight: "#f8faff",
    shellMid: "#dbe6f0",
    swatch: "#d9e8f7",
    trim: "#5b6d82",
    visor: "#0a1a2a",
  },
  coral: {
    antenna: "#9b7a7b",
    antennaTip: "#ff8d70",
    gltfAccent: "#ffd3c3",
    gltfPrimary: "#ef7f59",
    joint: "#c19192",
    shellDark: "#e3927d",
    shellEmissive: "#cb7a66",
    shellLight: "#fff3ef",
    shellMid: "#ffd2c7",
    swatch: "#ff9c80",
    trim: "#7b595c",
    visor: "#261416",
  },
  mint: {
    antenna: "#77a896",
    antennaTip: "#7bf0c3",
    gltfAccent: "#defaec",
    gltfPrimary: "#4ecf95",
    joint: "#78ae9d",
    shellDark: "#8fcdb6",
    shellEmissive: "#6db09a",
    shellLight: "#eefef7",
    shellMid: "#c8f3de",
    swatch: "#8ae2bd",
    trim: "#55776a",
    visor: "#10201a",
  },
};
