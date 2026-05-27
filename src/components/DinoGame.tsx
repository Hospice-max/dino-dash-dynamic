import { useEffect, useRef, useState } from "react";
import { GAME_HEIGHT, GAME_WIDTH, createState, duck, jump, update } from "@/game/engine";
import { render } from "@/game/render";
import { BIOMES, biomeForScore, blendBiomes } from "@/game/biomes";

const BEST_KEY = "dino-best-score";

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(createState(0));
  const [, setTick] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [boxSize, setBoxSize] = useState<{ w: number; h: number }>({ w: GAME_WIDTH, h: GAME_HEIGHT });

  // Detect portrait mobile (client-only to avoid SSR hydration mismatch)
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const portrait = w < 768 && h > w;
      setIsPortrait(portrait);

      if (portrait) {
        // Canvas is rendered in landscape (900x260) but rotated 90° via CSS.
        // After rotation: visual width = GAME_HEIGHT, visual height = GAME_WIDTH.
        const availW = w - 16;
        const availH = h - 160; // leave room for header + hint
        const scale = Math.min(availW / GAME_HEIGHT, availH / GAME_WIDTH);
        setBoxSize({ w: GAME_HEIGHT * scale, h: GAME_WIDTH * scale });
      } else {
        setBoxSize({ w: GAME_WIDTH, h: GAME_HEIGHT });
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, []);

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

    const triggerJump = () => {
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
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        triggerJump();
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
      triggerJump();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const wrap = wrapRef.current!;
    wrap.addEventListener("touchstart", onTouch, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      wrap.removeEventListener("touchstart", onTouch);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className="relative rounded-lg overflow-hidden border border-border shadow-lg bg-background touch-none select-none"
        style={{ width: boxSize.w, height: boxSize.h }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block"
          style={
            isPortrait
              ? {
                  imageRendering: "pixelated",
                  width: GAME_WIDTH,
                  height: GAME_HEIGHT,
                  transform: `rotate(90deg) scale(${boxSize.h / GAME_WIDTH})`,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: boxSize.w,
                }
              : {
                  imageRendering: "pixelated",
                  width: "100%",
                  height: "100%",
                }
          }
        />
      </div>

      {isPortrait && (
        <p className="md:hidden text-sm text-center text-muted-foreground px-4">
          👆 Touche l'écran pour faire sauter le dino
        </p>
      )}
    </div>
  );
}
