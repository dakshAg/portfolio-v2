/**
 * Interaction layer. Vanilla, no dependencies.
 * Runs on every Astro page load (View Transitions aware) and cleans up after itself.
 */

type Cleanup = () => void;
let cleanups: Cleanup[] = [];

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function on<K extends keyof GlobalEventHandlersEventMap>(
  target: EventTarget,
  type: K | string,
  fn: (e: any) => void,
  opts?: AddEventListenerOptions | boolean,
) {
  target.addEventListener(type, fn, opts);
  cleanups.push(() => target.removeEventListener(type, fn, opts));
}

function raf(loop: (t: number) => void) {
  let id = 0;
  const tick = (t: number) => {
    loop(t);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  cleanups.push(() => cancelAnimationFrame(id));
}

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/* ------------------------------------------------------------------ theme */

export function applyTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem("theme");
  } catch {}
  const dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function initTheme() {
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    on(btn, "click", () => {
      const dark = document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch {}
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  });
}

/* ------------------------------------------------------------------ nav */

function initMenu() {
  const toggle = document.querySelector<HTMLElement>("[data-menu-toggle]");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;
  on(toggle, "click", () => {
    const open = !menu.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach((a) =>
    on(a, "click", () => {
      menu.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    }),
  );
}

/* ------------------------------------------------------------------ reveal */

function initReveal() {
  const targets = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
  if (reducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  targets.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

/* ------------------------------------------------------------------ scroll progress + timeline */

function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
  const rails = document.querySelectorAll<HTMLElement>("[data-timeline]");
  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    rails.forEach((rail) => {
      const rect = rail.getBoundingClientRect();
      const p = (window.innerHeight * 0.75 - rect.top) / rect.height;
      rail.style.setProperty("--progress", String(clamp(p, 0, 1)));
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", onScroll);
  update();
}

/* ------------------------------------------------------------------ custom cursor */

function initCursor() {
  const root = document.querySelector<HTMLElement>("[data-cursor]");
  if (!root || !finePointer() || reducedMotion()) return;

  const dot = root.querySelector<HTMLElement>(".cursor-dot")!;
  const ring = root.querySelector<HTMLElement>(".cursor-ring")!;
  const label = root.querySelector<HTMLElement>(".cursor-label")!;
  document.documentElement.classList.add("has-cursor");
  cleanups.push(() => document.documentElement.classList.remove("has-cursor"));

  let mx = -100, my = -100, rx = -100, ry = -100;

  on(window, "pointermove", (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY;
    root.classList.add("is-active");
  }, { passive: true });

  on(document.documentElement, "mouseleave", () => root.classList.remove("is-active"));
  on(document, "pointerdown", () => root.classList.add("is-down"));
  on(document, "pointerup", () => root.classList.remove("is-down"));

  on(document, "pointerover", (e: PointerEvent) => {
    const t = e.target as Element | null;
    const interactive = t?.closest("a, button, [data-cursor-label], summary, input, textarea");
    const labelled = t?.closest<HTMLElement>("[data-cursor-label]");
    const text = labelled?.dataset.cursorLabel ?? "";
    root.classList.toggle("is-link", !!interactive && !text);
    root.classList.toggle("is-label", !!text);
    label.textContent = text;
  });

  raf(() => {
    rx = lerp(rx, mx, 0.2);
    ry = lerp(ry, my, 0.2);
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  });
}

/* ------------------------------------------------------------------ magnetic buttons */

function initMagnetic() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.3;
    on(el, "pointermove", (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.classList.add("is-magnet");
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    on(el, "pointerleave", () => {
      el.classList.remove("is-magnet");
      el.style.transform = "";
    });
  });
}

/* ------------------------------------------------------------------ 3D tilt cards */

function initTilt() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    const max = Number(el.dataset.tilt) || 6;
    on(el, "pointermove", (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.classList.add("is-tilting");
      el.style.transform = `perspective(1000px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-3px)`;
      el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    });
    on(el, "pointerleave", () => {
      el.classList.remove("is-tilting");
      el.style.transform = "";
    });
  });
}

/* ------------------------------------------------------------------ text scramble */

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

function scrambleTo(el: HTMLElement, text: string, duration = 600): Promise<void> {
  return new Promise((resolve) => {
    const from = el.textContent ?? "";
    const len = Math.max(from.length, text.length);
    const start = performance.now();
    const step = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      let out = "";
      for (let i = 0; i < len; i++) {
        const settled = i / len < t * 1.15 - 0.15;
        const ch = text[i] ?? "";
        if (settled || ch === " " || ch === "") out += ch;
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(step);
      else {
        el.textContent = text;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

function initScrambleHover() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const original = el.textContent ?? "";
    let busy = false;
    on(el, "pointerenter", async () => {
      if (busy) return;
      busy = true;
      await scrambleTo(el, original, 450);
      busy = false;
    });
  });
}

/* ------------------------------------------------------------------ hero role rotator (scramble-decode) */

function initRotator() {
  const el = document.querySelector<HTMLElement>("[data-rotator]");
  if (!el) return;
  const words = (el.dataset.words ?? "").split("|").filter(Boolean);
  if (words.length < 2) return;
  let i = 0;
  if (reducedMotion()) return;
  const id = window.setInterval(() => {
    i = (i + 1) % words.length;
    void scrambleTo(el, words[i], 700);
  }, 2800);
  cleanups.push(() => clearInterval(id));
}

/* ------------------------------------------------------------------ hero dot field (canvas) */

function cssHsl(varName: string, alpha: number) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return `hsl(${v} / ${alpha})`;
}

function initField() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-field]");
  if (!canvas || reducedMotion()) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  type Pt = { ox: number; oy: number; x: number; y: number };
  let pts: Pt[] = [];
  let w = 0, h = 0, dpr = 1;
  let mx = -9999, my = -9999;
  let fg = "", ac = "";
  let visible = true;

  const paint = () => {
    fg = cssHsl("--foreground", 0.22);
    ac = cssHsl("--accent", 0.9);
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = w < 640 ? 26 : 30;
    pts = [];
    for (let y = gap / 2; y < h; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        pts.push({ ox: x, oy: y, x, y });
      }
    }
  };

  paint();
  resize();
  on(window, "resize", resize);
  on(document, "themechange", paint);

  const host = canvas.parentElement ?? canvas;
  on(host, "pointermove", (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  }, { passive: true });
  on(host, "pointerleave", () => {
    mx = -9999;
    my = -9999;
  });

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  io.observe(canvas);
  cleanups.push(() => io.disconnect());

  const RADIUS = 170;
  raf(() => {
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      const dx = p.ox - mx;
      const dy = p.oy - my;
      const d = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - d / RADIUS);
      const tx = p.ox + (dx / d) * force * 26;
      const ty = p.oy + (dy / d) * force * 26;
      p.x = lerp(p.x, tx, 0.14);
      p.y = lerp(p.y, ty, 0.14);
      const r = 1 + force * 1.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = force > 0.02 ? ac : fg;
      ctx.globalAlpha = force > 0.02 ? 0.35 + force * 0.65 : 1;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

/* ------------------------------------------------------------------ project hover preview */

function initProjectPreview() {
  const list = document.querySelector<HTMLElement>("[data-preview-list]");
  const float = document.querySelector<HTMLElement>("[data-preview-float]");
  if (!list || !float || !finePointer() || reducedMotion()) return;

  const img = float.querySelector<HTMLImageElement>("img")!;
  const rows = list.querySelectorAll<HTMLElement>("[data-preview]");

  // preload
  rows.forEach((r) => {
    const i = new Image();
    i.src = r.dataset.preview ?? "";
  });

  let mx = 0, my = 0, x = 0, y = 0, px = 0, active = false;

  rows.forEach((row) => {
    on(row, "pointerenter", () => {
      const src = row.dataset.preview ?? "";
      if (img.src !== src) img.src = src;
      active = true;
      float.classList.add("is-active");
      rows.forEach((r) => r.classList.toggle("is-dim", r !== row));
    });
  });
  on(list, "pointerleave", () => {
    active = false;
    float.classList.remove("is-active");
    rows.forEach((r) => r.classList.remove("is-dim"));
  });
  on(list, "pointermove", (e: PointerEvent) => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  raf(() => {
    if (!active && Math.abs(x - mx) < 0.5) return;
    px = x;
    x = lerp(x, mx, 0.12);
    y = lerp(y, my, 0.12);
    const vx = clamp((x - px) * 0.6, -14, 14);
    float.style.transform = `translate3d(${x + 28}px, ${y - float.offsetHeight / 2}px, 0) rotate(${vx}deg)`;
  });
}

/* ------------------------------------------------------------------ drag to scroll */

function initDragScroll() {
  document.querySelectorAll<HTMLElement>("[data-drag-scroll]").forEach((el) => {
    let down = false, startX = 0, startLeft = 0, lastX = 0, vel = 0, moved = false;
    let momentum = 0;

    on(el, "pointerdown", (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // native touch scrolling is better
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      vel = 0;
      cancelAnimationFrame(momentum);
      el.classList.add("is-dragging");
    });
    on(window, "pointermove", (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
      vel = e.clientX - lastX;
      lastX = e.clientX;
    });
    const end = () => {
      if (!down) return;
      down = false;
      el.classList.remove("is-dragging");
      const glide = () => {
        if (Math.abs(vel) < 0.3) return;
        el.scrollLeft -= vel;
        vel *= 0.94;
        momentum = requestAnimationFrame(glide);
      };
      glide();
    };
    on(window, "pointerup", end);
    on(window, "pointercancel", end);
    // Suppress the click that follows a drag
    on(el, "click", (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  });
}

/* ------------------------------------------------------------------ dialogs + copy + local time */

function initDialogs() {
  on(document, "click", (e: MouseEvent) => {
    const t = e.target as Element | null;
    const open = t?.closest<HTMLElement>("[data-open-dialog]");
    if (open) {
      const d = document.getElementById(open.dataset.openDialog ?? "");
      if (d instanceof HTMLDialogElement) d.showModal();
      return;
    }
    const close = t?.closest("[data-close-dialog]");
    if (close) {
      const d = close.closest("dialog");
      if (d instanceof HTMLDialogElement) d.close();
    }
  });
  document.querySelectorAll<HTMLDialogElement>("dialog[data-dialog]").forEach((d) => {
    on(d, "click", (e: MouseEvent) => {
      if (e.target === d) d.close();
    });
  });
}

function initCopy() {
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
    const label = btn.querySelector<HTMLElement>("[data-copy-label]");
    const idle = label?.textContent ?? "";
    on(btn, "click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy ?? "");
        if (label) label.textContent = "Copied ✓";
      } catch {
        if (label) label.textContent = "Copy failed";
      }
      setTimeout(() => {
        if (label) label.textContent = idle;
      }, 1800);
    });
  });
}

function initLocalTime() {
  const el = document.querySelector<HTMLElement>("[data-local-time]");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tick = () => {
    el.textContent = `${fmt.format(new Date())} AEST`;
  };
  tick();
  const id = window.setInterval(tick, 30000);
  cleanups.push(() => clearInterval(id));
}

/* ------------------------------------------------------------------ boot */

function init() {
  cleanups.forEach((fn) => fn());
  cleanups = [];

  initTheme();
  initMenu();
  initReveal();
  initScrollProgress();
  initCursor();
  initMagnetic();
  initTilt();
  initScrambleHover();
  initRotator();
  initField();
  initProjectPreview();
  initDragScroll();
  initDialogs();
  initCopy();
  initLocalTime();
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:after-swap", applyTheme);
