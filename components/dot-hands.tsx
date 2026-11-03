"use client";

import { useEffect, useRef } from "react";

// Лист 2×2 с чёрно-белыми фото рук; канвас превращает его яркость в точечный LED-растр.
const SHEET =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85";

// [x, y, w, h] в долях листа. Поза A: указывающие руки, поза B: раскрытые.
const SRC = {
  LA: [0, 0.06, 0.47, 0.4],
  RA: [0.53, 0.06, 0.47, 0.4],
  LB: [0, 0.55, 0.47, 0.4],
  RB: [0.53, 0.55, 0.47, 0.4],
} as const;
type Key = keyof typeof SRC;

const LOOP = 20;
const LEVELS = [0, 0.26, 0.52, 0.78, 1];
const DOT = "#1f1d1d";
// Прозрачность точек: обычные, на подходе к тексту и прямо под текстом.
const ALPHAS = [1, 0.4, 0.14];

const fract = (x: number) => x - Math.floor(x);
const hash = (a: number, b: number) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const mixAt = (t: number, on: number, off: number, dur: number) => smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));

/**
 * Фон первого экрана: две руки тянутся друг к другу, нарисованные строками точек.
 * Руки дрейфуют, а каждая по очереди рассыпается в другую позу и обратно (цикл 20 с).
 * Под элементами с data-quiet точки становятся полупрозрачными, чтобы не мешать тексту.
 * При prefers-reduced-motion рисуется один неподвижный кадр.
 */
export function DotHands() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const host = canvas.parentElement!;
    const ctx = canvas.getContext("2d")!;
    const fA = document.createElement("canvas");
    const fB = document.createElement("canvas");
    const gA = fA.getContext("2d", { willReadFrequently: true })!;
    const gB = fB.getContext("2d", { willReadFrequently: true })!;
    const tiles = {} as Record<Key, HTMLCanvasElement>;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, step = 0, rowStep = 0, cols = 0, rows = 0, R = 0;
    let seeds = new Float32Array(0);
    let quiet: { l: number; t: number; r: number; b: number }[] = [];
    let ready = false, visible = true, raf = 0;
    const t0 = performance.now();

    function resize() {
      const box = host.getBoundingClientRect();
      W = box.width;
      H = box.height;
      const dpr = Math.min(2, devicePixelRatio);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      step = Math.max(5, W / 205);
      rowStep = step * 2.05;
      cols = Math.ceil(W / step);
      rows = Math.ceil(H / rowStep);
      R = step * 0.46;
      fA.width = fB.width = cols;
      fA.height = fB.height = rows;

      // В основном случайный порядок, с уклоном по строкам: распад идёт полосами.
      seeds = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) seeds[j * cols + i] = 0.55 * hash(i, j) + 0.45 * hash(j * 3.1, 7.7);

      measureQuiet();
    }

    // Тихие зоны по реальным строкам текста, а не по всему блоку: у коротких строк остаётся место для рук.
    function measureQuiet() {
      const box = host.getBoundingClientRect();
      quiet = [...host.querySelectorAll("[data-quiet]")].flatMap((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return [...range.getClientRects()].map((b) => ({
          l: b.left - box.left,
          t: b.top - box.top,
          r: b.right - box.left,
          b: b.bottom - box.top,
        }));
      });
      if (ready && !raf) render(reduce ? 0 : (performance.now() - t0) / 1000);
    }

    function quietFade(x: number, y: number) {
      let f = 1;
      for (const q of quiet) {
        const d = Math.hypot(Math.max(q.l - x, 0, x - q.r), Math.max(q.t - y, 0, y - q.b));
        f = Math.min(f, smooth(0, 40, d));
      }
      return f;
    }

    function drawHand(g: CanvasRenderingContext2D, key: Key, left: boolean, t: number) {
      const a = (2 * Math.PI * t) / LOOP;
      const ph = left ? 0 : Math.PI;
      const portrait = H > W;
      const hw = W * (portrait ? 0.66 : 0.53);
      const hh = (hw * (0.4 * 1520)) / (0.47 * 2688);
      // Полоса между кнопками и абзацем внизу первого экрана.
      const cy = H * (portrait ? 0.56 : 0.6);
      const reach = (0.035 * Math.sin(a + ph) + 0.012 * Math.sin(2 * a + 1.3 + ph)) * W;
      const scale = 1 + 0.07 * Math.sin(a + 0.9 + ph);
      const rot = (left ? 1 : -1) * 0.045 * Math.sin(a + 2.1 + ph);
      const x = left ? reach - W * 0.045 : W - hw + W * 0.045 - reach;
      const px = left ? 0 : W;

      g.setTransform(cols / W, 0, 0, rows / H, 0, 0);
      g.translate(px, cy);
      g.rotate(rot);
      g.scale(scale, scale);
      g.translate(-px, -cy);
      g.drawImage(tiles[key], x, cy - hh / 2, hw, hh);
    }

    function field(g: CanvasRenderingContext2D, l: Key, r: Key, t: number) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.fillStyle = "#fff";
      g.fillRect(0, 0, cols, rows);
      drawHand(g, l, true, t);
      drawHand(g, r, false, t);
      return g.getImageData(0, 0, cols, rows).data;
    }

    function render(time: number) {
      if (!cols || !rows) return; // картинка может загрузиться раньше первого замера размеров
      const t = ((time % LOOP) + LOOP) % LOOP;
      const dA = field(gA, "LA", "RA", t);
      const dB = field(gB, "LB", "RB", t);
      const tick = Math.floor(t * 7);
      const mL = mixAt(t, 6.2, 14.6, 1.6);
      const mR = mixAt(t, 2.4, 10.4, 1.6);

      ctx.clearRect(0, 0, W, H);
      const paths = ALPHAS.map(() => new Path2D());
      for (let j = 0; j < rows; j++) {
        // Редкие строки на миг съезжают вбок, как сбитый LED-экран.
        const shift = hash(j, tick) > 0.965 ? Math.round((hash(tick, j) - 0.5) * 8) : 0;
        const y = (j + 0.5) * rowStep;
        for (let i = 0; i < cols; i++) {
          const x = (i + 0.5) * step;
          // Кончики пальцев гаснут у центра и не касаются друг друга.
          const fade = smooth(0.035, 0.11, Math.abs((i + 0.5) / cols - 0.5));
          if (fade === 0) continue;

          const seed = seeds[j * cols + i];
          const m = i < cols / 2 ? mL : mR;
          const src = seed < m ? dB : dA;
          const si = Math.min(cols - 1, Math.max(0, i - shift));
          let v = clamp01((1 - src[(j * cols + si) * 4] / 255 - 0.16) / 0.42);
          if (v === 0) continue;

          // Фронт смены позы мерцает и редеет, пока проходит по руке.
          if (m > 0.001 && m < 0.999) {
            const d = Math.abs(seed - m);
            if (d < 0.12) {
              v *= d / 0.12;
              if (hash(i + tick, j) <= 0.4) v *= 0.3;
            }
          }
          v *= (0.86 + 0.14 * Math.sin(t * 3.2 + seed * 40)) * fade;

          let level = 0;
          for (let k = LEVELS.length - 1; k > 0; k--)
            if (v >= LEVELS[k] - 0.13) {
              level = LEVELS[k];
              break;
            }
          if (level === 0) continue;
          const r = R * (level === LEVELS[1] ? 0.38 : level);
          const q = quietFade(x, y);
          const path = paths[q > 0.66 ? 0 : q > 0.33 ? 1 : 2];
          path.moveTo(x + r, y);
          path.arc(x, y, r, 0, 2 * Math.PI);
        }
      }
      ctx.fillStyle = DOT;
      paths.forEach((path, k) => {
        ctx.globalAlpha = ALPHAS[k];
        ctx.fill(path);
      });
      ctx.globalAlpha = 1;
    }

    function frame(now: number) {
      render((now - t0) / 1000);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (!ready) return;
      if (reduce) render(0);
      else if (visible && !raf) raf = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // иначе getImageData запрещён для чужого домена
    img.onload = () => {
      for (const key of Object.keys(SRC) as Key[]) {
        const [x, y, w, h] = SRC[key];
        const tile = document.createElement("canvas");
        tile.width = 420;
        tile.height = Math.round((420 * h * img.height) / (w * img.width));
        const tg = tile.getContext("2d")!;
        tg.imageSmoothingQuality = "high";
        tg.drawImage(img, x * img.width, y * img.height, w * img.width, h * img.height, 0, 0, tile.width, tile.height);
        tiles[key] = tile;
      }
      ready = true;
      start();
    };
    img.src = SHEET;

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    // Текст въезжает анимацией: пока он сдвинут, зоны замеряются неточно, поэтому перемеряем по её окончании.
    host.addEventListener("animationend", measureQuiet);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);

    return () => {
      img.onload = null;
      stop();
      ro.disconnect();
      host.removeEventListener("animationend", measureQuiet);
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 block size-full" />;
}
