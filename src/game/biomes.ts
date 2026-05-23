export type Biome = {
  name: string;
  skyTop: string;
  skyBottom: string;
  ground: string;
  groundLine: string;
  dino: string;
  obstacle: string;
  bird: string;
  // background mountains/hills colors (far, near)
  bgFar: string;
  bgNear: string;
  // decor sprites
  obstacleType:
    | "cactus"
    | "tree"
    | "pine"
    | "duneCactus"
    | "silhouette"
    | "crater"
    | "coral"
    | "lava"
    | "crystal"
    | "mushroom";
  // background extras
  ambient:
    | "sun"
    | "clouds"
    | "snow"
    | "sunset"
    | "stars"
    | "space"
    | "bubbles"
    | "ember"
    | "aurora"
    | "spores";
  gravityScale: number;
};

export const BIOMES: Biome[] = [
  {
    name: "Désert",
    skyTop: "#f6d99a",
    skyBottom: "#fbeccb",
    ground: "#e6c98a",
    groundLine: "#b9975a",
    dino: "#4a5a3a",
    obstacle: "#3f6b3a",
    bird: "#5a4a3a",
    bgFar: "#e2b97a",
    bgNear: "#cf9b5d",
    obstacleType: "cactus",
    ambient: "sun",
    gravityScale: 1,
  },
  {
    name: "Forêt",
    skyTop: "#bfe4c0",
    skyBottom: "#e6f3e1",
    ground: "#5e7a3c",
    groundLine: "#3e5424",
    dino: "#2e3a22",
    obstacle: "#244a1a",
    bird: "#1f2b14",
    bgFar: "#6a8a55",
    bgNear: "#4d6b3a",
    obstacleType: "tree",
    ambient: "clouds",
    gravityScale: 1,
  },
  {
    name: "Montagne enneigée",
    skyTop: "#cfdcea",
    skyBottom: "#f3f7fb",
    ground: "#eef3f7",
    groundLine: "#b9c5d2",
    dino: "#3a4654",
    obstacle: "#1f3a2a",
    bird: "#2a3340",
    bgFar: "#a7b6c7",
    bgNear: "#7d8fa3",
    obstacleType: "pine",
    ambient: "snow",
    gravityScale: 1,
  },
  {
    name: "Coucher de soleil",
    skyTop: "#ff7e5f",
    skyBottom: "#ffd194",
    ground: "#7a3b3b",
    groundLine: "#3b1f1f",
    dino: "#1f1224",
    obstacle: "#1a0f1f",
    bird: "#1a0f1f",
    bgFar: "#9b3a4e",
    bgNear: "#5a1f33",
    obstacleType: "duneCactus",
    ambient: "sunset",
    gravityScale: 1,
  },
  {
    name: "Nuit étoilée",
    skyTop: "#0b1530",
    skyBottom: "#1b2a55",
    ground: "#0e1830",
    groundLine: "#2a3a60",
    dino: "#cfd6e6",
    obstacle: "#0a0f1c",
    bird: "#0a0f1c",
    bgFar: "#1a2547",
    bgNear: "#0d1530",
    obstacleType: "silhouette",
    ambient: "stars",
    gravityScale: 1,
  },
  {
    name: "Lunaire",
    skyTop: "#020308",
    skyBottom: "#0a0d1c",
    ground: "#2a2a32",
    groundLine: "#4a4a55",
    dino: "#e6e6ee",
    obstacle: "#5a5a66",
    bird: "#cfcfdc",
    bgFar: "#1a1a22",
    bgNear: "#3a3a44",
    obstacleType: "crater",
    ambient: "space",
    gravityScale: 0.7,
  },
  {
    name: "Récif sous-marin",
    skyTop: "#0a4a6e",
    skyBottom: "#3aa0c4",
    ground: "#d9c089",
    groundLine: "#a88a5a",
    dino: "#1f3a4a",
    obstacle: "#d94f7a",
    bird: "#f0b54a",
    bgFar: "#1b6e8c",
    bgNear: "#2a93b0",
    obstacleType: "coral",
    ambient: "bubbles",
    gravityScale: 0.85,
  },
  {
    name: "Volcan",
    skyTop: "#2a0a10",
    skyBottom: "#7a1f1a",
    ground: "#1a0f0a",
    groundLine: "#4a1f10",
    dino: "#f0d09a",
    obstacle: "#ff5a1f",
    bird: "#3a1a14",
    bgFar: "#3a0f12",
    bgNear: "#5a1a18",
    obstacleType: "lava",
    ambient: "ember",
    gravityScale: 1.1,
  },
  {
    name: "Grotte de cristal",
    skyTop: "#1a0a3a",
    skyBottom: "#3a1a6a",
    ground: "#2a1a4a",
    groundLine: "#5a3a8a",
    dino: "#dcd0ff",
    obstacle: "#9ae6ff",
    bird: "#ff9ae6",
    bgFar: "#2a154f",
    bgNear: "#4a2a7a",
    obstacleType: "crystal",
    ambient: "aurora",
    gravityScale: 1,
  },
  {
    name: "Forêt fongique",
    skyTop: "#1a2a1a",
    skyBottom: "#3a5a3a",
    ground: "#2a3a24",
    groundLine: "#5a6a44",
    dino: "#f0e8c0",
    obstacle: "#e84a8a",
    bird: "#9ae64a",
    bgFar: "#2a4a2a",
    bgNear: "#3a6a3a",
    obstacleType: "mushroom",
    ambient: "spores",
    gravityScale: 0.9,
  },
];

const POINTS_PER_BIOME = 150;

export function biomeForScore(score: number) {
  const idx = Math.min(BIOMES.length - 1, Math.floor(score / POINTS_PER_BIOME));
  return { index: idx, biome: BIOMES[idx] };
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
export function lerpColor(a: string, b: string, t: number) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(lerp(ca.r, cb.r, t), lerp(ca.g, cb.g, t), lerp(ca.b, cb.b, t));
}

export function blendBiomes(a: Biome, b: Biome, t: number): Biome {
  return {
    ...b,
    skyTop: lerpColor(a.skyTop, b.skyTop, t),
    skyBottom: lerpColor(a.skyBottom, b.skyBottom, t),
    ground: lerpColor(a.ground, b.ground, t),
    groundLine: lerpColor(a.groundLine, b.groundLine, t),
    dino: lerpColor(a.dino, b.dino, t),
    obstacle: lerpColor(a.obstacle, b.obstacle, t),
    bird: lerpColor(a.bird, b.bird, t),
    bgFar: lerpColor(a.bgFar, b.bgFar, t),
    bgNear: lerpColor(a.bgNear, b.bgNear, t),
    gravityScale: lerp(a.gravityScale, b.gravityScale, t),
  };
}
