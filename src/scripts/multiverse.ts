/**
 * Multiverse engine: image art-style flips + synthesized 8-bit sound.
 * Imported by interactions.ts. No dependencies.
 */

export const UNIVERSES: { key: string; label: string }[] = [
  { key: "616", label: "Earth-616" },
  { key: "comic", label: "Earth-1610 · comic" },
  { key: "noir", label: "Earth-90214 · noir" },
  { key: "neon", label: "Earth-2099 · neon" },
  { key: "pixel", label: "Earth-8bit" },
  { key: "poster", label: "Earth-138 · punk" },
  { key: "thermal", label: "Earth-thermal" },
  { key: "print", label: "Earth-misprint" },
  { key: "sketch", label: "Earth-pencil" },
  { key: "vhs", label: "Earth-1985 · VHS" },
];

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ------------------------------------------------------------------ sound */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);
  return ctx;
}

export function soundEnabled() {
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  try { localStorage.setItem("snd", on ? "1" : "0"); } catch {}
  if (on) {
    const c = ensureCtx();
    if (c && c.state === "suspended") void c.resume();
  }
}

export function loadSoundPref() {
  try { enabled = localStorage.getItem("snd") === "1"; } catch { enabled = false; }
  return enabled;
}

type Wave = OscillatorType;
function tone(freq: number, dur: number, opts: { type?: Wave; at?: number; vol?: number; slide?: number } = {}) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "square";
  o.frequency.setValueAtTime(freq, t0);
  if (opts.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + opts.slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(opts.vol ?? 0.5, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(dur: number, opts: { at?: number; vol?: number; hp?: number } = {}) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + (opts.at ?? 0);
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = opts.hp ?? 800;
  const g = c.createGain();
  g.gain.setValueAtTime(opts.vol ?? 0.3, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  blip: () => tone(880, 0.04, { type: "square", vol: 0.25 }),
  hover: () => tone(1320, 0.03, { type: "triangle", vol: 0.15 }),
  coin: () => { tone(988, 0.08); tone(1319, 0.3, { at: 0.08 }); },
  levelup: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, { at: i * 0.09 })),
  achievement: () => [784, 988, 1175, 1568, 1175, 1568].forEach((f, i) => tone(f, 0.1, { at: i * 0.07, type: "square" })),
  glitch: () => { noise(0.12, { vol: 0.25, hp: 1500 }); tone(120, 0.1, { type: "sawtooth", vol: 0.3, slide: -80 }); },
  toggle: () => tone(660, 0.05, { type: "triangle" }),
  bubble: () => tone(rand(500, 900), 0.12, { type: "sine", vol: 0.3, slide: 500 }),
  tick: () => tone(2400, 0.012, { type: "square", vol: 0.08 }),
  warp: () => { for (let i = 0; i < 6; i++) tone(200 + i * 160, 0.06, { at: i * 0.04, type: "sawtooth", vol: 0.25 }); noise(0.2, { at: 0.2, vol: 0.2 }); },
  love: () => [659, 784, 988, 1319, 988, 1319, 1568].forEach((f, i) => tone(f, 0.16, { at: i * 0.12, type: "triangle", vol: 0.4 })),
  spider: () => { tone(1800, 0.05, { type: "sine" }); tone(2200, 0.05, { at: 0.06, type: "sine" }); },
  bite: () => { tone(90, 0.25, { type: "sawtooth", vol: 0.4, slide: -60 }); noise(0.15, { vol: 0.3, hp: 300 }); },
  insert: () => { tone(440, 0.1); tone(554, 0.1, { at: 0.1 }); tone(659, 0.1, { at: 0.2 }); tone(880, 0.4, { at: 0.3 }); },
  sleepy: () => [440, 392, 349, 330].forEach((f, i) => tone(f, 0.25, { at: i * 0.22, type: "sine", vol: 0.3 })),
};

/* ------------------------------------------------------------------ multiverse images */

type MV = {
  root: HTMLElement;
  base: HTMLImageElement;
  slices: HTMLElement[];
  tag: HTMLElement | null;
  variants: string[];
  universe: string;
  busy: boolean;
};

const items: MV[] = [];

function setUniverse(mv: MV, key: string) {
  UNIVERSES.forEach((u) => mv.root.classList.remove(`u-${u.key}`));
  mv.root.classList.add(`u-${key}`);
  mv.universe = key;
  if (mv.tag) mv.tag.textContent = UNIVERSES.find((u) => u.key === key)?.label ?? key;
  if (mv.variants.length) {
    // Real generated variants: index 0 is Earth-616 (the original)
    const idx = UNIVERSES.findIndex((u) => u.key === key);
    const src = mv.variants[idx % mv.variants.length] ?? mv.variants[0];
    if (mv.base.src !== src) mv.base.src = src;
  }
}

export function flip(mv: MV, target?: string, quiet = false) {
  if (mv.busy || reducedMotion()) return;
  mv.busy = true;
  const to = target ?? pick(UNIVERSES.filter((u) => u.key !== mv.universe)).key;
  if (!quiet) sfx.glitch();
  mv.root.classList.add("is-flipping");
  const start = performance.now();
  const dur = rand(280, 480);
  const step = (now: number) => {
    const t = (now - start) / dur;
    if (t >= 1) {
      mv.slices.forEach((s) => { s.style.clipPath = ""; s.style.transform = ""; });
      mv.root.classList.remove("is-flipping");
      setUniverse(mv, to);
      mv.busy = false;
      return;
    }
    mv.slices.forEach((s) => {
      const a = rand(0, 85);
      const b = Math.min(100, a + rand(4, 22));
      s.style.clipPath = `inset(${a}% 0 ${100 - b}% 0)`;
      s.style.transform = `translateX(${rand(-14, 14)}px)`;
      // slices show random other universes while flipping
      if (Math.random() < 0.35) {
        UNIVERSES.forEach((u) => s.classList.remove(`u-${u.key}`));
        s.classList.add(`u-${pick(UNIVERSES).key}`);
      }
    });
    // base momentarily jumps universes too
    if (Math.random() < 0.3) {
      UNIVERSES.forEach((u) => mv.root.classList.remove(`u-${u.key}`));
      mv.root.classList.add(`u-${pick(UNIVERSES).key}`);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initMultiverse(on: (t: EventTarget, type: string, fn: (e: any) => void, opts?: any) => void, timer: (fn: () => void, ms: number) => number) {
  items.length = 0;
  document.querySelectorAll<HTMLElement>("[data-mv]").forEach((root) => {
    const base = root.querySelector<HTMLImageElement>("[data-mv-base]");
    if (!base) return;
    const mv: MV = {
      root,
      base,
      slices: Array.from(root.querySelectorAll<HTMLElement>("[data-mv-slice]")),
      tag: root.querySelector<HTMLElement>("[data-mv-tag]"),
      variants: (root.dataset.variants ?? "").split("|").filter(Boolean),
      universe: root.dataset.universe ?? "616",
      busy: false,
    };
    if (mv.variants.length) mv.variants.unshift(base.src);
    items.push(mv);
    const host = root.closest<HTMLElement>(".group") ?? root;
    on(host, "pointerenter", () => flip(mv));
    on(root, "click", (e: MouseEvent) => {
      // click flips too (touch devices have no hover); don't hijack links
      if ((e.target as Element).closest("a")) return;
      flip(mv);
    });
  });

  // Ambient: every few seconds, one on-screen image flickers dimensions
  if (reducedMotion()) return;
  const ambient = () => {
    const visible = items.filter((m) => m.root.dataset.ambient && !m.busy).filter((m) => {
      const r = m.root.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    });
    if (visible.length) flip(pick(visible), undefined, true);
    timer(ambient, rand(2600, 6000));
  };
  timer(ambient, 2200);
}

export function flipAll(target?: string) {
  items.forEach((m, i) => setTimeout(() => flip(m, target, i > 0), i * 60));
}

export function multiverseCount() {
  return items.length;
}
