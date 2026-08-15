import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface PixelGridProps {
  pixelColorRgb?: string;
  pixelSize?: number;
  pixelSpacing?: number;
  pixelDeathFade?: number;
  pixelBornFade?: number;
  pixelMaxLife?: number;
  pixelMinLife?: number;
  pixelMaxOffLife?: number;
  pixelMinOffLife?: number;
  className?: string;
}

interface Pixel {
  x: number;
  y: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  offLife: number;
  lit: boolean;
  deathFade: number;
  bornFade: number;
  reset: () => void;
}

/**
 * Fixed, full-viewport ambient background — a dormant data-grid quietly
 * alive behind the whole page. Ported from a canvas-per-window React
 * prototype to this project's token system (accent violet only) and made
 * prefers-reduced-motion aware (freezes to a static dim grid instead of
 * animating).
 */
export function PixelGrid({
  pixelColorRgb = "139,127,255",
  pixelSize = 4,
  pixelSpacing = 7,
  pixelDeathFade = 14,
  pixelBornFade = 60,
  pixelMaxLife = 820,
  pixelMinLife = 260,
  pixelMaxOffLife = 1300,
  pixelMinOffLife = 340,
  className,
}: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let resizeTimer = 0;

    const randomAlpha = () => {
      const r = Math.random() * 100;
      if (r > 96) return 0.8;
      if (r > 88) return 0.38;
      return 0.1;
    };

    const makePixel = (x: number, y: number): Pixel => {
      const alpha = randomAlpha();
      const pixel: Pixel = {
        x: x * (pixelSize + pixelSpacing),
        y: y * (pixelSize + pixelSpacing),
        alpha: 0,
        maxAlpha: alpha,
        life: Math.floor(Math.random() * (pixelMaxLife - pixelMinLife)) + pixelMinLife,
        offLife: Math.floor(Math.random() * (pixelMaxOffLife - pixelMinOffLife)) + pixelMinOffLife,
        lit: alpha !== 0.1,
        deathFade: pixelDeathFade,
        bornFade: pixelBornFade,
        reset: () => {},
      };
      pixel.reset = () => {
        const na = randomAlpha();
        pixel.alpha = 0;
        pixel.maxAlpha = na;
        pixel.life = Math.floor(Math.random() * (pixelMaxLife - pixelMinLife)) + pixelMinLife;
        pixel.offLife =
          Math.floor(Math.random() * (pixelMaxOffLife - pixelMinOffLife)) + pixelMinOffLife;
        pixel.lit = na !== 0.1;
        pixel.deathFade = pixelDeathFade;
        pixel.bornFade = pixelBornFade;
      };
      return pixel;
    };

    const build = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      const cols = Math.ceil(w / (pixelSize + pixelSpacing));
      const rows = Math.ceil(h / (pixelSize + pixelSpacing));
      const pixels: Pixel[] = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) pixels.push(makePixel(x, y));
      }
      pixelsRef.current = pixels;
    };

    const step = (p: Pixel) => {
      p.alpha = Math.min(Math.max(p.alpha, 0.1), p.maxAlpha);
      ctx.fillStyle = `rgba(${pixelColorRgb},${p.alpha.toFixed(3)})`;
      ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
      if (p.lit) {
        if (p.bornFade <= 0) {
          if (p.life <= 0) {
            if (p.deathFade <= 0) p.reset();
            else {
              p.alpha = (p.deathFade / pixelDeathFade) * p.maxAlpha;
              p.deathFade--;
            }
          } else p.life--;
        } else {
          p.alpha = p.maxAlpha - p.bornFade / pixelBornFade;
          p.bornFade--;
        }
      } else {
        if (p.offLife <= 0) p.lit = true;
        p.offLife--;
      }
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pixelsRef.current) {
        const a = p.maxAlpha * 0.5;
        ctx.fillStyle = `rgba(${pixelColorRgb},${a.toFixed(3)})`;
        ctx.fillRect(p.x, p.y, pixelSize, pixelSize);
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pixelsRef.current) step(p);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      build();
      cancelAnimationFrame(raf);
      if (reduceMotion) paintStatic();
      else loop();
    };

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(start, 150);
    };

    start();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(raf);
    };
  }, [
    pixelColorRgb,
    pixelSize,
    pixelSpacing,
    pixelDeathFade,
    pixelBornFade,
    pixelMaxLife,
    pixelMinLife,
    pixelMaxOffLife,
    pixelMinOffLife,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 z-0 block h-screen w-screen", className)}
    />
  );
}
