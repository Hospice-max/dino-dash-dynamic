import { Biome } from "./biomes";

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 260;
export const GROUND_Y = 220;
export const DINO_X = 60;
export const DINO_W = 44;
export const DINO_H = 48;
export const DINO_DUCK_H = 28;

export type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "ground" | "bird";
  birdFrame?: number;
};

export type GameState = {
  running: boolean;
  over: boolean;
  score: number;
  best: number;
  speed: number;
  dinoY: number;
  dinoVY: number;
  ducking: boolean;
  jumping: boolean;
  obstacles: Obstacle[];
  spawnTimer: number;
  bgOffset: number;
  bgOffset2: number;
  groundOffset: number;
  time: number;
  level: number;
};

export function createState(best = 0): GameState {
  return {
    running: false,
    over: false,
    score: 0,
    best,
    speed: 6,
    dinoY: 0,
    dinoVY: 0,
    ducking: false,
    jumping: false,
    obstacles: [],
    spawnTimer: 60,
    bgOffset: 0,
    bgOffset2: 0,
    groundOffset: 0,
    time: 0,
    level: 0,
  };
}

export function jump(s: GameState) {
  if (s.over) return;
  if (s.dinoY === 0 && !s.jumping) {
    s.dinoVY = -13.5;
    s.jumping = true;
  }
}
export function duck(s: GameState, down: boolean) {
  if (s.over) return;
  s.ducking = down && s.dinoY === 0;
}

export function update(s: GameState, biome: Biome) {
  if (!s.running || s.over) return;
  s.time += 1;

  // physics
  const gravity = 0.7 * biome.gravityScale;
  s.dinoVY += gravity;
  s.dinoY += s.dinoVY;
  if (s.dinoY > 0) {
    s.dinoY = 0;
    s.dinoVY = 0;
    s.jumping = false;
  }
  // fast-fall when ducking mid-air
  if (s.ducking && s.dinoY < 0) s.dinoVY += 0.8;

  // speed scaling
  s.speed = 6 + Math.min(8, s.score / 120);

  // scroll
  s.bgOffset = (s.bgOffset + s.speed * 0.2) % 10000;
  s.bgOffset2 = (s.bgOffset2 + s.speed * 0.5) % 10000;
  s.groundOffset = (s.groundOffset + s.speed) % 40;

  // obstacles
  s.spawnTimer -= 1;
  if (s.spawnTimer <= 0) {
    const r = Math.random();
    if (r < 0.7) {
      // ground
      const w = 18 + Math.random() * 22;
      const h = 32 + Math.random() * 24;
      s.obstacles.push({
        x: GAME_WIDTH + 20,
        y: GROUND_Y - h,
        w,
        h,
        kind: "ground",
      });
    } else {
      // bird at varying heights
      const heights = [GROUND_Y - 70, GROUND_Y - 40, GROUND_Y - 100];
      const y = heights[Math.floor(Math.random() * heights.length)];
      s.obstacles.push({
        x: GAME_WIDTH + 20,
        y,
        w: 36,
        h: 24,
        kind: "bird",
        birdFrame: 0,
      });
    }
    const base = 70 - Math.min(40, s.score / 30);
    s.spawnTimer = base + Math.random() * 60;
  }

  for (const o of s.obstacles) {
    o.x -= s.speed;
    if (o.kind === "bird") o.birdFrame = Math.floor(s.time / 6) % 2;
  }
  s.obstacles = s.obstacles.filter((o) => o.x + o.w > -10);

  // collisions
  const dy = GROUND_Y + s.dinoY;
  const dh = s.ducking ? DINO_DUCK_H : DINO_H;
  const dx = DINO_X;
  const dw = s.ducking ? DINO_W + 10 : DINO_W;
  const dyTop = dy - dh;
  for (const o of s.obstacles) {
    if (dx + dw - 6 > o.x + 4 && dx + 6 < o.x + o.w - 4 && dyTop + 6 < o.y + o.h - 4 && dy - 4 > o.y + 4) {
      s.over = true;
      s.running = false;
      if (s.score > s.best) s.best = s.score;
    }
  }

  // score
  s.score += 0.25 + s.speed * 0.02;
  s.level = Math.floor(s.score / 200);
}
