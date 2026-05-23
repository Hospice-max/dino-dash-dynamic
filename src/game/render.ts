import { Biome } from "./biomes";
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y, DINO_X, DINO_W, DINO_H, DINO_DUCK_H, GameState } from "./engine";

export function render(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  sky.addColorStop(0, b.skyTop);
  sky.addColorStop(1, b.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawAmbient(ctx, s, b);
  drawBackground(ctx, s, b);
  drawGround(ctx, s, b);
  drawObstacles(ctx, s, b);
  drawDino(ctx, s, b);
  drawHUD(ctx, s, b);

  if (s.over) drawGameOver(ctx);
  else if (!s.running) drawStart(ctx);
}

function drawAmbient(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  switch (b.ambient) {
    case "sun":
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 100, 60, 28, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "clouds":
      drawCloud(ctx, ((-s.bgOffset * 0.3) % (GAME_WIDTH + 200)) + 100, 50, "#ffffff");
      drawCloud(ctx, ((-s.bgOffset * 0.3 + 400) % (GAME_WIDTH + 200)) + 50, 80, "#ffffff");
      break;
    case "snow":
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const x = (i * 73 + s.time * 1.2) % GAME_WIDTH;
        const y = (i * 37 + s.time * 2) % GROUND_Y;
        ctx.fillRect(x, y, 2, 2);
      }
      break;
    case "sunset":
      ctx.fillStyle = "#ffe7b0";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 2, 130, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH / 2, 130, 90, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "stars":
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 60; i++) {
        const x = (i * 137) % GAME_WIDTH;
        const y = (i * 53) % (GROUND_Y - 20);
        const tw = (Math.sin(s.time * 0.05 + i) + 1) * 0.5;
        ctx.globalAlpha = 0.4 + tw * 0.6;
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
      // moon
      ctx.fillStyle = "#f0ead6";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 80, 55, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.skyTop;
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 72, 50, 18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "space":
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 100; i++) {
        const x = (i * 91 + s.bgOffset * 0.1) % GAME_WIDTH;
        const y = (i * 47) % (GROUND_Y - 10);
        ctx.fillRect(x, y, 1, 1);
      }
      // shooting star
      const ssX = (s.time * 3) % (GAME_WIDTH + 200);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ssX, 40);
      ctx.lineTo(ssX - 40, 60);
      ctx.stroke();
      // planet
      ctx.fillStyle = "#7a9cc6";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 90, 70, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 98, 62, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "bubbles":
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < 25; i++) {
        const x = (i * 71 + s.time * 0.5) % GAME_WIDTH;
        const y = (GROUND_Y - ((i * 53 + s.time * 1.5) % GROUND_Y));
        ctx.beginPath();
        ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      // sun rays through water
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      for (let i = 0; i < 6; i++) ctx.fillRect(i * 120 + 20, 0, 40, GROUND_Y);
      break;
    case "ember":
      ctx.fillStyle = "#ffb24a";
      for (let i = 0; i < 30; i++) {
        const x = (i * 89 + s.time * 0.8) % GAME_WIDTH;
        const y = GROUND_Y - ((i * 41 + s.time * 2.5) % GROUND_Y);
        ctx.globalAlpha = 0.4 + ((i % 5) * 0.1);
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
      // red sun
      ctx.fillStyle = "#ff3a1a";
      ctx.beginPath();
      ctx.arc(GAME_WIDTH - 90, 60, 24, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "aurora":
      for (let i = 0; i < 4; i++) {
        const grad = ctx.createLinearGradient(0, 0, GAME_WIDTH, 0);
        const hue = (s.time * 0.3 + i * 60) % 360;
        grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0)`);
        grad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, 0.25)`);
        grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 20 + i * 20, GAME_WIDTH, 30);
      }
      // crystals shimmer
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 30; i++) {
        const x = (i * 97) % GAME_WIDTH;
        const y = (i * 41) % (GROUND_Y - 30);
        ctx.globalAlpha = (Math.sin(s.time * 0.08 + i) + 1) * 0.4;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
      break;
    case "spores":
      ctx.fillStyle = "#e0ff9a";
      for (let i = 0; i < 35; i++) {
        const x = (i * 67 + s.time * 0.4) % GAME_WIDTH;
        const y = (i * 31 + s.time * 0.8) % GROUND_Y;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.arc(x + 16, y + 4, 16, 0, Math.PI * 2);
  ctx.arc(x + 32, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  // far layer
  ctx.fillStyle = b.bgFar;
  for (let i = 0; i < 6; i++) {
    const x = (i * 220 - (s.bgOffset % 220)) - 50;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 110, GROUND_Y - 80);
    ctx.lineTo(x + 220, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }
  // near layer
  ctx.fillStyle = b.bgNear;
  for (let i = 0; i < 8; i++) {
    const x = (i * 160 - (s.bgOffset2 % 160)) - 40;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 80, GROUND_Y - 45);
    ctx.lineTo(x + 160, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGround(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  ctx.fillStyle = b.ground;
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
  ctx.strokeStyle = b.groundLine;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(GAME_WIDTH, GROUND_Y);
  ctx.stroke();
  // pebbles/dashes
  ctx.fillStyle = b.groundLine;
  for (let i = 0; i < GAME_WIDTH / 40 + 2; i++) {
    const x = i * 40 - s.groundOffset;
    ctx.fillRect(x, GROUND_Y + 8, 12, 2);
    ctx.fillRect(x + 20, GROUND_Y + 18, 6, 2);
  }
}

function drawObstacles(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  for (const o of s.obstacles) {
    if (o.kind === "bird") {
      drawBird(ctx, o.x, o.y, o.w, o.h, o.birdFrame ?? 0, b);
    } else {
      drawGroundObstacle(ctx, o.x, o.y, o.w, o.h, b);
    }
  }
}

function drawGroundObstacle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, b: Biome) {
  ctx.fillStyle = b.obstacle;
  switch (b.obstacleType) {
    case "cactus": {
      ctx.fillRect(x + w / 2 - 4, y, 8, h);
      ctx.fillRect(x, y + h * 0.3, 6, h * 0.4);
      ctx.fillRect(x + w - 6, y + h * 0.2, 6, h * 0.4);
      break;
    }
    case "tree": {
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(x + w / 2 - 3, y + h * 0.5, 6, h * 0.5);
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.35, w * 0.7, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "pine": {
      ctx.fillStyle = "#5a3a1a";
      ctx.fillRect(x + w / 2 - 2, y + h * 0.8, 4, h * 0.2);
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x, y + h * 0.85);
      ctx.lineTo(x + w, y + h * 0.85);
      ctx.closePath();
      ctx.fill();
      // snow tip
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2 - 4, y + 8);
      ctx.lineTo(x + w / 2 + 4, y + 8);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "duneCactus": {
      ctx.fillStyle = b.obstacle;
      ctx.fillRect(x + w / 2 - 3, y, 6, h);
      ctx.fillRect(x, y + h * 0.4, 4, h * 0.3);
      ctx.fillRect(x + w - 4, y + h * 0.25, 4, h * 0.35);
      break;
    }
    case "silhouette": {
      ctx.fillStyle = b.obstacle;
      ctx.fillRect(x + w / 2 - 4, y, 8, h);
      ctx.fillRect(x, y + h * 0.35, 6, h * 0.35);
      ctx.fillRect(x + w - 6, y + h * 0.25, 6, h * 0.4);
      break;
    }
    case "crater": {
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h - 4, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h - 6, w / 2 - 4, h / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "coral": {
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.lineTo(x + w / 2, y + h * 0.2);
      ctx.lineTo(x + w * 0.2, y);
      ctx.moveTo(x + w / 2, y + h * 0.5);
      ctx.lineTo(x + w * 0.8, y + h * 0.1);
      ctx.lineWidth = 4;
      ctx.strokeStyle = b.obstacle;
      ctx.stroke();
      ctx.fillRect(x + w / 2 - 3, y + h * 0.2, 6, h * 0.8);
      break;
    }
    case "lava": {
      ctx.fillStyle = "#3a1a10";
      ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.moveTo(x, y + h * 0.7);
      ctx.lineTo(x + w * 0.25, y + h * 0.3);
      ctx.lineTo(x + w * 0.5, y + h * 0.5);
      ctx.lineTo(x + w * 0.75, y + h * 0.2);
      ctx.lineTo(x + w, y + h * 0.6);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "crystal": {
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h * 0.4);
      ctx.lineTo(x + w * 0.7, y + h);
      ctx.lineTo(x + w * 0.3, y + h);
      ctx.lineTo(x, y + h * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w * 0.6, y + h * 0.5);
      ctx.lineTo(x + w * 0.45, y + h);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "mushroom": {
      ctx.fillStyle = "#f0e8c0";
      ctx.fillRect(x + w / 2 - 3, y + h * 0.4, 6, h * 0.6);
      ctx.fillStyle = b.obstacle;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h * 0.35, w * 0.6, h * 0.35, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(x + w * 0.4, y + h * 0.25, 2, 0, Math.PI * 2);
      ctx.arc(x + w * 0.65, y + h * 0.3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, frame: number, b: Biome) {
  ctx.fillStyle = b.bird;
  // body
  ctx.fillRect(x + 8, y + 8, w - 16, 8);
  // head
  ctx.fillRect(x + w - 12, y + 4, 6, 6);
  // beak
  ctx.fillRect(x + w - 6, y + 6, 4, 2);
  // wings
  if (frame === 0) {
    ctx.fillRect(x + 6, y, w - 14, 6);
  } else {
    ctx.fillRect(x + 6, y + 14, w - 14, 6);
  }
}

function drawDino(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  const x = DINO_X;
  const y = GROUND_Y + s.dinoY;
  ctx.fillStyle = b.dino;
  if (s.ducking) {
    const h = DINO_DUCK_H;
    const w = DINO_W + 10;
    ctx.fillRect(x, y - h, w, h);
    // head
    ctx.fillRect(x + w - 14, y - h - 6, 18, 14);
    // eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w - 4, y - h - 2, 3, 3);
  } else {
    const h = DINO_H;
    const w = DINO_W;
    // body
    ctx.fillRect(x + 4, y - h + 16, w - 8, h - 20);
    // tail
    ctx.fillRect(x, y - h + 22, 8, 6);
    // head
    ctx.fillRect(x + w - 18, y - h, 22, 22);
    // legs (animated)
    const legFrame = Math.floor(s.time / 6) % 2;
    if (s.dinoY === 0) {
      if (legFrame === 0) {
        ctx.fillRect(x + 10, y - 6, 6, 6);
        ctx.fillRect(x + 22, y - 2, 8, 2);
      } else {
        ctx.fillRect(x + 10, y - 2, 8, 2);
        ctx.fillRect(x + 22, y - 6, 6, 6);
      }
    } else {
      ctx.fillRect(x + 12, y - 6, 6, 6);
      ctx.fillRect(x + 22, y - 6, 6, 6);
    }
    // eye
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + w - 6, y - h + 6, 3, 3);
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, s: GameState, b: Biome) {
  ctx.fillStyle = b.groundLine;
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`HI ${String(Math.floor(s.best)).padStart(5, "0")}  ${String(Math.floor(s.score)).padStart(5, "0")}`, GAME_WIDTH - 16, 28);
  ctx.textAlign = "left";
  ctx.fillText(`Niveau ${s.level + 1} — ${b.name}`, 16, 28);
}

function drawStart(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 24px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Appuie sur ESPACE pour jouer", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 6);
  ctx.font = "14px monospace";
  ctx.fillText("↑ / Espace : sauter   ↓ : s'accroupir", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
}
function drawGameOver(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);
  ctx.font = "14px monospace";
  ctx.fillText("Espace pour rejouer", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 18);
}
