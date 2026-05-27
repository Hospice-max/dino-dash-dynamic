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
    const onCanvasTouch = (e: TouchEvent) => {
      e.preventDefault();
      triggerJump();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("touchstart", onCanvasTouch, { passive: false });

    // expose jump/duck for the mobile buttons via the window-attached refs
    (window as any).__dinoJump = triggerJump;
    (window as any).__dinoDuck = (down: boolean) => duck(stateRef.current, down);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("touchstart", onCanvasTouch);
      delete (window as any).__dinoJump;
      delete (window as any).__dinoDuck;
    };
  }, []);

  const onJumpStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    (window as any).__dinoJump?.();
  };
  const onDuckStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    (window as any).__dinoDuck?.(true);
  };
  const onDuckEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    (window as any).__dinoDuck?.(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-auto rounded-lg border border-border shadow-lg bg-background touch-none select-none"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Mobile controls — visible only on small screens */}
      <div className="grid grid-cols-2 gap-3 md:hidden select-none">
        <button
          type="button"
          aria-label="Sauter"
          onTouchStart={onJumpStart}
          onMouseDown={onJumpStart}
          className="h-20 rounded-xl border border-border bg-primary text-primary-foreground text-xl font-bold shadow-lg active:scale-95 transition touch-none"
        >
          ⤴︎ Sauter
        </button>
        <button
          type="button"
          aria-label="S'accroupir"
          onTouchStart={onDuckStart}
          onTouchEnd={onDuckEnd}
          onTouchCancel={onDuckEnd}
          onMouseDown={onDuckStart}
          onMouseUp={onDuckEnd}
          onMouseLeave={onDuckEnd}
          className="h-20 rounded-xl border border-border bg-secondary text-secondary-foreground text-xl font-bold shadow-lg active:scale-95 transition touch-none"
        >
          ⤵︎ Baisser
        </button>
      </div>
    </div>
  );
}
