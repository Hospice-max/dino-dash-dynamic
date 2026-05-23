import { useEffect, useRef, useState } from "react";
import { GAME_HEIGHT, GAME_WIDTH, createState, duck, jump, update } from "@/game/engine";
import { render } from "@/game/render";
import { BIOMES, biomeForScore, blendBiomes } from "@/game/biomes";

const BEST_KEY = "dino-best-score";

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(createState(0));
  const [, setTick] = useState(0);

  useEffect(() => {
    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    stateRef.current.best = best;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let transitionT = 1;
    let lastIdx = 0;

    const loop = () => {
      const s = stateRef.current;
      const { index, biome } = biomeForScore(s.score);
      if (index !== lastIdx) {
        transitionT = 0;
        lastIdx = index;
      }
      transitionT = Math.min(1, transitionT + 1 / 120);
      const prev = BIOMES[Math.max(0, index - 1)];
      const current = blendBiomes(prev, biome, transitionT);

      update(s, current);
      render(ctx, s, current);

      if (s.over) {
        localStorage.setItem(BEST_KEY, String(Math.floor(s.best)));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        const s = stateRef.current;
        if (s.over) {
          const best = s.best;
          stateRef.current = createState(best);
          stateRef.current.running = true;
          setTick((t) => t + 1);
          return;
        }
        if (!s.running) {
          s.running = true;
          setTick((t) => t + 1);
        }
        jump(s);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        duck(stateRef.current, true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") duck(stateRef.current, false);
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (s.over) {
        stateRef.current = createState(s.best);
        stateRef.current.running = true;
        return;
      }
      if (!s.running) s.running = true;
      jump(s);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("touchstart", onTouch, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-auto rounded-lg border border-border shadow-lg bg-background"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
