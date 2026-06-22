import { useEffect, useRef, useState } from "react";
import { GAME_HEIGHT, GAME_WIDTH, createState, duck, jump, update } from "@/game/engine";
import { render } from "@/game/render";
import { BIOMES, biomeForScore, blendBiomes } from "@/game/biomes";

const BEST_KEY = "dino-best-score";
const ASPECT = GAME_WIDTH / GAME_HEIGHT;

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(createState(0));
  const [, setTick] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [boxSize, setBoxSize] = useState<{ w: number; h: number }>({ w: GAME_WIDTH, h: GAME_HEIGHT });

  // Responsive sizing: fit canvas into available viewport while preserving aspect ratio.
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 768;
      setIsMobile(mobile);

      if (fullscreen) {
        // Fill the entire viewport, preserve aspect ratio.
        let w = vw;
        let h = w / ASPECT;
        if (h > vh) {
          h = vh;
          w = h * ASPECT;
        }
        setBoxSize({ w, h });
      } else if (mobile) {
        const availW = vw;
        const availH = vh - 140;
        let w = availW;
        let h = w / ASPECT;
        if (h > availH) {
          h = availH;
          w = h * ASPECT;
        }
        setBoxSize({ w, h });
      } else {
        const availW = Math.min(vw - 64, 1200);
        const availH = vh - 260;
        let w = Math.min(availW, GAME_WIDTH * 1.4);
        let h = w / ASPECT;
        if (h > availH) {
          h = availH;
          w = h * ASPECT;
        }
        setBoxSize({ w, h });
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [fullscreen]);

  // Sync with native browser fullscreen state (handles ESC / system gestures).
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!fullscreen) {
        await wrapRef.current?.requestFullscreen?.();
        setFullscreen(true);
      } else {
        if (document.fullscreenElement) await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      // Fallback: CSS-only fullscreen if the API is unavailable.
      setFullscreen((v) => !v);
    }
  };

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

    // Touch controls: tap = jump, swipe down = duck (Subway-Surfers style).
    let touchStartY = 0;
    let touchStartT = 0;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchStartY = e.touches[0].clientY;
      touchStartT = Date.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const dy = (e.changedTouches[0]?.clientY ?? touchStartY) - touchStartY;
      const dt = Date.now() - touchStartT;
      if (dy > 40 && dt < 500) {
        // swipe down → duck briefly
        duck(stateRef.current, true);
        setTimeout(() => duck(stateRef.current, false), 450);
      } else {
        triggerJump();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const wrap = wrapRef.current!;
    wrap.addEventListener("touchstart", onTouchStart, { passive: false });
    wrap.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div
        ref={wrapRef}
        className={
          fullscreen
            ? "relative overflow-hidden bg-background touch-none select-none flex items-center justify-center w-screen h-[100dvh]"
            : "relative rounded-lg overflow-hidden border border-border shadow-lg bg-background touch-none select-none"
        }
        style={fullscreen ? undefined : { width: boxSize.w, height: boxSize.h }}
      >
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block"
          style={{ imageRendering: "pixelated", width: boxSize.w, height: boxSize.h }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFullscreen();
          }}
          aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
          className="absolute top-2 right-2 z-10 rounded-md bg-black/50 text-white text-xs px-3 py-1.5 backdrop-blur hover:bg-black/70"
        >
          {fullscreen ? "✕ Quitter" : "⛶ Plein écran"}
        </button>
      </div>

      {isMobile && !fullscreen && (
        <p className="text-sm text-center text-muted-foreground px-4">
          👆 Tape pour sauter · ⬇️ Glisse vers le bas pour t'accroupir
        </p>
      )}
    </div>
  );
}
