/**
 * DAKSH.EXE interaction layer. Vanilla, no deps.
 * Re-runs on every Astro page load and cleans up after itself.
 */

import { initMultiverse, flipAll, sfx, setSound, loadSoundPref, soundEnabled, UNIVERSES } from "./multiverse";

type Cleanup = () => void;
let cleanups: Cleanup[] = [];

const finePointer = () =>
	window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function timer(fn: () => void, ms: number) {
	const id = window.setTimeout(fn, ms);
	cleanups.push(() => clearTimeout(id));
	return id;
}

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
const clamp = (v: number, min: number, max: number) =>
	Math.min(max, Math.max(min, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const store = {
	get(k: string) {
		try {
			return localStorage.getItem(k);
		} catch {
			return null;
		}
	},
	set(k: string, v: string) {
		try {
			localStorage.setItem(k, v);
		} catch {}
	},
};

/* ------------------------------------------------------------------ achievements */

const ACHIEVEMENTS: Record<
	string,
	{ title: string; desc: string; icon: string }
> = {
	boot: { title: "Insert coin", desc: "Booted DAKSH.EXE", icon: "🕹️" },
	scroll: { title: "Explorer", desc: "Scrolled past the fold", icon: "🧭" },
	deep: { title: "Completionist", desc: "Reached the bottom", icon: "🏁" },
	projects: { title: "Level select", desc: "Opened the projects", icon: "🎮" },
	konami: { title: "ULTRA MODE", desc: "Found the code", icon: "🕷️" },
	avatar: { title: "Poke poke", desc: "Clicked the avatar 5×", icon: "👆" },
	copy: { title: "Copied that", desc: "Email on clipboard", icon: "📋" },
	stack: { title: "Tier snob", desc: "Judged the tech stack", icon: "🏆" },
	issue: { title: "Reader", desc: "Opened an issue", icon: "📖" },
};
Object.assign(ACHIEVEMENTS, {
	love: { title: "Player 2 joined", desc: "Said the magic word", icon: "💘" },
	spider: { title: "Bitten", desc: "Caught the spider", icon: "🕷️" },
	p1: { title: "Identity crisis", desc: "Poked the player tag", icon: "🎭" },
	attract: { title: "AFK", desc: "Left the cabinet idle", icon: "💤" },
	multiverse: { title: "Dimension hopper", desc: "Flipped 10 universes", icon: "🌀" },
	cheat: { title: "Cheater", desc: "Opened the cheat menu", icon: "📟" },
	sound: { title: "Turn it up", desc: "Enabled sound", icon: "🔊" },
	late: { title: "Night owl", desc: "Visited after midnight", icon: "🦉" },
});

const HINTS: Record<string, string> = {
	konami: "↑↑↓↓←→←→BA",
	love: "type a four-letter word",
	spider: "something drops from the ceiling",
	avatar: "the face is clickable",
	attract: "walk away",
	multiverse: "hover the photos",
	p1: "who's playing?",
	late: "come back after midnight",
	deep: "keep scrolling",
	cheat: "?",
};

let got: Set<string> | null = null;
function unlock(key: string) {
	const a = ACHIEVEMENTS[key];
	if (!a) return;
	if (!got) {
		try {
			got = new Set(JSON.parse(store.get("ach") ?? "[]"));
		} catch {
			got = new Set();
		}
	}
	if (got.has(key)) return;
	got.add(key);
	store.set("ach", JSON.stringify([...got]));
	toast(`${a.icon} ${a.title}`, a.desc);
	glitchBurst();
	sfx.achievement();
	renderCheat();
}

function unlocked(): Set<string> {
	if (!got) {
		try {
			got = new Set(JSON.parse(store.get("ach") ?? "[]"));
		} catch {
			got = new Set();
		}
	}
	return got;
}

function toast(title: string, desc: string) {
	const stack = document.querySelector("[data-toasts]");
	if (!stack) return;
	const el = document.createElement("div");
	el.className = "toast";
	el.innerHTML = `<span class="font-pixel text-[9px] text-pink">ACHIEVEMENT</span><span></span><b class="font-display text-xl tracking-wide col-start-1 col-span-2 leading-none">${title}</b><span class="font-mono text-[11px] col-span-2 opacity-80">${desc}</span>`;
	stack.appendChild(el);
	setTimeout(() => el.remove(), 4200);
}

/* Random slice-glitch on the whole main region, used for feedback moments */
function glitchBurst() {
	if (reducedMotion()) return;
	const main = document.getElementById("main-content");
	if (!main) return;
	main.classList.remove("glitch-slice");
	void main.offsetWidth;
	main.classList.add("glitch-slice");
	setTimeout(() => main.classList.remove("glitch-slice"), 520);
}

/* ------------------------------------------------------------------ boot screen */

function initBoot() {
	const boot = document.querySelector<HTMLElement>("[data-boot]");
	if (!boot) return;
	let seen = false;
	try {
		seen = sessionStorage.getItem("booted") === "1";
	} catch {}
	if (seen || reducedMotion()) {
		boot.classList.add("is-done");
		boot.remove();
		return;
	}
	const bar = boot.querySelector<HTMLElement>("[data-boot-bar]")!;
	const log = boot.querySelector<HTMLElement>("[data-boot-log]")!;
	const lines = [
		"mounting /earth-616",
		"loading fonts: bangers, press-start-2p",
		"calibrating halftone plates (C, M, Y, K)",
		"spawning player 1: daksh",
		"hooking konami listener",
		"ready.",
	];
	let i = 0;
	let done = false;
	const finish = (e?: Event) => {
		if (done) return;
		done = true;
		// A real gesture: start with sound on unless they muted before (Esc skips silently)
		const k = (e as KeyboardEvent | undefined)?.key;
		if (e && k !== "Escape" && store.get("snd") === null) {
			setSound(true);
			document.querySelector("[data-sound]")?.classList.add("is-on");
			const l = document.querySelector("[data-sound-label]");
			if (l) l.textContent = "SND ON";
		}
		try {
			sessionStorage.setItem("booted", "1");
		} catch {}
		bar.style.width = "100%";
		boot.classList.add("is-done");
		setTimeout(() => boot.remove(), 300);
		unlock("boot");
	};
	const step = () => {
		if (done) return;
		log.textContent = `> ${lines[i]}`;
		bar.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
		i++;
		if (i < lines.length) setTimeout(step, rand(90, 260));
		else setTimeout(finish, 260);
	};
	step();
	on(window, "keydown", finish, { once: true });
	on(boot, "click", finish, { once: true });
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
	const targets = document.querySelectorAll(
		"[data-reveal], [data-reveal-stagger]",
	);
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

/* ------------------------------------------------------------------ scroll: progress, xp, level, parallax */

function initScroll() {
	const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
	const xp = document.querySelector<HTMLElement>("[data-xp]");
	const lvl = document.querySelector<HTMLElement>("[data-level]");
	const parallax = document.querySelectorAll<HTMLElement>("[data-parallax]");
	let ticking = false;
	let level = 1;
	const update = () => {
		ticking = false;
		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		const p = max > 0 ? window.scrollY / max : 0;
		if (bar) bar.style.transform = `scaleX(${p})`;
		if (xp) {
			const stage = p * 4; // 4 levels per page
			xp.style.setProperty("--xp", String(stage % 1));
			const l = Math.min(5, 1 + Math.floor(stage));
			if (l !== level) {
				level = l;
				if (lvl) lvl.textContent = String(l);
				if (l > 1) {
					glitchBurst();
					sfx.levelup();
				}
			}
		}
		if (window.scrollY > 400) unlock("scroll");
		if (p > 0.97 && max > 800) unlock("deep");
		parallax.forEach((el) => {
			const speed = Number(el.dataset.parallax) || 0.2;
			const r = el.getBoundingClientRect();
			const mid = r.top + r.height / 2 - window.innerHeight / 2;
			el.style.setProperty("--py", `${-mid * speed}px`);
			el.style.transform = `translateY(var(--py))`;
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

/* ------------------------------------------------------------------ cursor: crosshair + chromatic ghosts */

function initCursor() {
	const root = document.querySelector<HTMLElement>("[data-cursor]");
	if (!root || !finePointer() || reducedMotion()) return;
	const x = root.querySelector<HTMLElement>(".cursor-x")!;
	const gc = root.querySelector<HTMLElement>(".cursor-ghost.c")!;
	const gm = root.querySelector<HTMLElement>(".cursor-ghost.m")!;
	const label = root.querySelector<HTMLElement>(".cursor-label")!;
	document.documentElement.classList.add("has-cursor");
	cleanups.push(() => document.documentElement.classList.remove("has-cursor"));

	let mx = -100,
		my = -100,
		cx = -100,
		cy = -100,
		mmx = -100,
		mmy = -100;
	on(
		window,
		"pointermove",
		(e: PointerEvent) => {
			mx = e.clientX;
			my = e.clientY;
			root.classList.add("is-active");
		},
		{ passive: true },
	);
	on(document.documentElement, "mouseleave", () =>
		root.classList.remove("is-active"),
	);
	on(document, "pointerdown", () => root.classList.add("is-down"));
	on(document, "pointerup", () => root.classList.remove("is-down"));
	on(document, "pointerover", (e: PointerEvent) => {
		const t = e.target as Element | null;
		const interactive = t?.closest(
			"a, button, [data-cursor-label], summary, input, textarea",
		);
		const labelled = t?.closest<HTMLElement>("[data-cursor-label]");
		const text = labelled?.dataset.cursorLabel ?? "";
		root.classList.toggle("is-link", !!interactive);
		root.classList.toggle("is-label", !!text);
		label.textContent = text;
	});
	raf(() => {
		cx = lerp(cx, mx, 0.35);
		cy = lerp(cy, my, 0.35);
		mmx = lerp(mmx, mx, 0.18);
		mmy = lerp(mmy, my, 0.18);
		x.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
		gc.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
		gm.style.transform = `translate3d(${mmx}px, ${mmy}px, 0)`;
	});
}

/* ------------------------------------------------------------------ magnetic + tilt */

function initMagnetic() {
	if (!finePointer() || reducedMotion()) return;
	document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
		const strength = Number(el.dataset.magnetic) || 0.3;
		on(el, "pointermove", (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const x = e.clientX - (r.left + r.width / 2);
			const y = e.clientY - (r.top + r.height / 2);
			el.classList.add("is-magnet");
			el.style.transform = `translate(${x * strength}px, ${
				y * strength
			}px) rotate(${x * 0.02}deg)`;
		});
		on(el, "pointerleave", () => {
			el.classList.remove("is-magnet");
			el.style.transform = "";
		});
	});
}

function initTilt() {
	if (!finePointer() || reducedMotion()) return;
	document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
		const max = Number(el.dataset.tilt) || 6;
		on(el, "pointermove", (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width - 0.5;
			const py = (e.clientY - r.top) / r.height - 0.5;
			el.classList.add("is-tilting");
			el.style.transform = `perspective(900px) rotateX(${
				-py * max
			}deg) rotateY(${px * max}deg) translateY(-4px)`;
		});
		on(el, "pointerleave", () => {
			el.classList.remove("is-tilting");
			el.style.transform = "";
		});
	});
}

/* ------------------------------------------------------------------ text scramble */

const GLYPHS = "▓▒░<>/\\|#%&@$*!?0123456789";

function scrambleTo(
	el: HTMLElement,
	text: string,
	duration = 500,
): Promise<void> {
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
		// Only scramble the last text node so leading index spans stay intact
		const node = Array.from(el.childNodes)
			.reverse()
			.find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
		if (!node) return;
		const target = document.createElement("span");
		target.textContent = node.textContent;
		node.replaceWith(target);
		const original = target.textContent ?? "";
		let busy = false;
		on(el, "pointerenter", async () => {
			if (busy) return;
			busy = true;
			await scrambleTo(target, original, 400);
			busy = false;
		});
	});
}

function initRotator() {
	const el = document.querySelector<HTMLElement>("[data-rotator]");
	if (!el || reducedMotion()) return;
	const words = (el.dataset.words ?? "").split("|").filter(Boolean);
	if (words.length < 2) return;
	let i = 0;
	const id = window.setInterval(() => {
		i = (i + 1) % words.length;
		void scrambleTo(el, words[i], 600);
	}, 2600);
	cleanups.push(() => clearInterval(id));
}

/* Random glitch bursts on [data-glitch-auto] elements */
function initAutoGlitch() {
	if (reducedMotion()) return;
	const els = document.querySelectorAll<HTMLElement>("[data-glitch-auto]");
	if (!els.length) return;
	const fire = () => {
		const el = els[Math.floor(Math.random() * els.length)];
		el.classList.add("is-glitching");
		timer(() => el.classList.remove("is-glitching"), rand(180, 520));
		timer(fire, rand(1800, 5200));
	};
	timer(fire, 1400);
}

/* ------------------------------------------------------------------ hero: halftone dot field that reacts to the pointer */

function initField() {
	const canvas = document.querySelector<HTMLCanvasElement>("[data-field]");
	if (!canvas || reducedMotion()) return;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	type Pt = { x: number; y: number; r: number; hue: number };
	let pts: Pt[] = [];
	let w = 0,
		h = 0,
		dpr = 1;
	let mx = -9999,
		my = -9999;
	let visible = true;
	let t0 = performance.now();

	const resize = () => {
		dpr = Math.min(window.devicePixelRatio || 1, 2);
		w = canvas.clientWidth;
		h = canvas.clientHeight;
		canvas.width = w * dpr;
		canvas.height = h * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const gap = w < 640 ? 18 : 22;
		pts = [];
		for (let y = gap / 2; y < h; y += gap) {
			for (let x = gap / 2; x < w; x += gap) {
				pts.push({ x, y, r: 1, hue: 0 });
			}
		}
	};
	resize();
	on(window, "resize", resize);

	const host = canvas.parentElement ?? canvas;
	on(
		host,
		"pointermove",
		(e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			mx = e.clientX - r.left;
			my = e.clientY - r.top;
		},
		{ passive: true },
	);
	on(host, "pointerleave", () => {
		mx = -9999;
		my = -9999;
	});

	const io = new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
	});
	io.observe(canvas);
	cleanups.push(() => io.disconnect());

	const COLORS = ["#ff2e97", "#1de9ff", "#ffe93b"];
	const RADIUS = 220;
	raf((now) => {
		if (!visible) return;
		const t = (now - t0) / 1000;
		ctx.clearRect(0, 0, w, h);
		for (const p of pts) {
			const dx = p.x - mx;
			const dy = p.y - my;
			const d = Math.hypot(dx, dy);
			const force = Math.max(0, 1 - d / RADIUS);
			// halftone wave: dot size ripples diagonally
			const wave =
				(Math.sin(p.x * 0.02 + t * 1.2) + Math.cos(p.y * 0.025 - t * 0.9)) *
				0.5;
			const target = 1.2 + wave * 1.1 + force * 7;
			p.r = lerp(p.r, target, 0.2);
			if (force > 0.02) {
				ctx.fillStyle = COLORS[Math.floor((d / 40 + t * 4) % 3)];
				ctx.globalAlpha = 0.5 + force * 0.5;
			} else {
				ctx.fillStyle = "#ffffff";
				ctx.globalAlpha = 0.14 + wave * 0.08;
			}
			ctx.beginPath();
			ctx.arc(p.x, p.y, Math.max(0.3, p.r), 0, Math.PI * 2);
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
	rows.forEach((r) => {
		const i = new Image();
		i.src = r.dataset.preview ?? "";
	});

	let mx = 0,
		my = 0,
		x = 0,
		y = 0,
		px = 0,
		active = false;
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
	on(
		list,
		"pointermove",
		(e: PointerEvent) => {
			mx = e.clientX;
			my = e.clientY;
		},
		{ passive: true },
	);
	raf(() => {
		if (!active && Math.abs(x - mx) < 0.5) return;
		px = x;
		x = lerp(x, mx, 0.14);
		y = lerp(y, my, 0.14);
		const vx = clamp((x - px) * 0.8, -16, 16);
		float.style.transform = `translate3d(${x + 32}px, ${
			y - float.offsetHeight / 2
		}px, 0) rotate(${vx}deg)`;
	});
}

/* ------------------------------------------------------------------ drag to scroll */

function initDragScroll() {
	document.querySelectorAll<HTMLElement>("[data-drag-scroll]").forEach((el) => {
		let down = false,
			startX = 0,
			startLeft = 0,
			lastX = 0,
			vel = 0,
			moved = false,
			momentum = 0;
		on(el, "pointerdown", (e: PointerEvent) => {
			if (e.pointerType === "touch") return;
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
		on(
			el,
			"click",
			(e: MouseEvent) => {
				if (moved) {
					e.preventDefault();
					e.stopPropagation();
				}
			},
			true,
		);
	});
}

/* ------------------------------------------------------------------ dialogs, typewriter, copy, time, misc */

function initDialogs() {
	on(document, "click", (e: MouseEvent) => {
		const t = e.target as Element | null;
		const open = t?.closest<HTMLElement>("[data-open-dialog]");
		if (open) {
			const d = document.getElementById(open.dataset.openDialog ?? "");
			if (d instanceof HTMLDialogElement) {
				d.showModal();
				const tw = d.querySelector<HTMLElement>("[data-typewriter]");
				if (tw) typewrite(tw);
			}
			return;
		}
		const close = t?.closest("[data-close-dialog]");
		if (close) {
			const d = close.closest("dialog");
			if (d instanceof HTMLDialogElement) d.close();
		}
	});
	document
		.querySelectorAll<HTMLDialogElement>("dialog[data-dialog]")
		.forEach((d) => {
			on(d, "click", (e: MouseEvent) => {
				if (e.target === d) d.close();
			});
		});
}

let twToken = 0;
function typewrite(el: HTMLElement) {
	const text = el.dataset.typewriter ?? el.textContent ?? "";
	el.dataset.typewriter = text;
	if (reducedMotion()) {
		el.textContent = text;
		return;
	}
	const token = ++twToken;
	el.textContent = "";
	el.classList.remove("caret");
	let i = 0;
	const step = () => {
		if (token !== twToken) return;
		i += 2;
		if (i % 6 === 0) sfx.tick();
		el.textContent = text.slice(0, i);
		if (i < text.length) setTimeout(step, 12);
		else el.classList.add("caret");
	};
	step();
}

function initCopy() {
	document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
		const label = btn.querySelector<HTMLElement>("[data-copy-label]");
		const idle = label?.textContent ?? "";
		on(btn, "click", async () => {
			try {
				await navigator.clipboard.writeText(btn.dataset.copy ?? "");
				if (label) label.textContent = "Copied!";
				sfx.coin();
				unlock("copy");
			} catch {
				if (label) label.textContent = "Nope";
			}
			setTimeout(() => {
				if (label) label.textContent = idle;
			}, 1600);
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

function initCountdown() {
	const el = document.querySelector<HTMLElement>("[data-countdown]");
	if (!el || reducedMotion()) return;
	let n = 9;
	const id = window.setInterval(() => {
		n = n <= 0 ? 9 : n - 1;
		el.textContent = String(n);
	}, 1000);
	cleanups.push(() => clearInterval(id));
}

function initAvatarPoke() {
	const el = document.querySelector<HTMLElement>("[data-avatar]");
	if (!el) return;
	let n = 0;
	on(el, "click", () => {
		n++;
		el.classList.remove("glitch-slice");
		void el.offsetWidth;
		el.classList.add("glitch-slice");
		if (n >= 5) unlock("avatar");
	});
}

function initSectionAchievements() {
	const map: Record<string, string> = { projects: "projects" };
	const els = Object.keys(map)
		.map((id) => document.getElementById(id))
		.filter(Boolean) as HTMLElement[];
	if (!els.length || !("IntersectionObserver" in window)) return;
	const io = new IntersectionObserver(
		(entries) => {
			for (const en of entries)
				if (en.isIntersecting) {
					unlock(map[en.target.id]);
					io.unobserve(en.target);
				}
		},
		{ threshold: 0.3 },
	);
	els.forEach((el) => io.observe(el));
	cleanups.push(() => io.disconnect());
	const page = document.body.dataset.page;
	if (page === "stack") unlock("stack");
	if (page === "issue") unlock("issue");
}

/* ------------------------------------------------------------------ konami → ULTRA mode */

const KONAMI = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];
let konamiBound = false;
function initKonami() {
	if (konamiBound) return;
	konamiBound = true;
	let idx = 0;
	window.addEventListener("keydown", (e) => {
		const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		idx = k === KONAMI[idx] ? idx + 1 : k === KONAMI[0] ? 1 : 0;
		if (idx === KONAMI.length) {
			idx = 0;
			const ultra = document.documentElement.classList.toggle("ultra");
			sfx.warp();
			flipAll();
			if (ultra) unlock("konami");
			else glitchBurst();
		}
	});
	if (store.get("ultra") === "1")
		document.documentElement.classList.add("ultra");
}

/* ------------------------------------------------------------------ sound toggle + UI sfx */

function initSound() {
  const btn = document.querySelector<HTMLElement>("[data-sound]");
  const label = document.querySelector<HTMLElement>("[data-sound-label]");
  const render = () => {
    const on = soundEnabled();
    btn?.classList.toggle("is-on", on);
    btn?.setAttribute("aria-pressed", String(on));
    if (label) label.textContent = on ? "SND ON" : "SND OFF";
  };
  loadSoundPref();
  render();
  if (btn) on(btn, "click", () => {
    setSound(!soundEnabled());
    render();
    if (soundEnabled()) { sfx.coin(); unlock("sound"); }
  });
  // UI blips: hover on interactive things, coin on primary buttons
  on(document, "pointerover", (e: PointerEvent) => {
    const t = e.target as Element | null;
    if (!finePointer()) return;
    if (t?.closest("[data-vibe='water']")) { sfx.bubble(); return; }
    if (t?.closest("a, button, summary")) sfx.hover();
  });
  on(document, "click", (e: MouseEvent) => {
    const t = e.target as Element | null;
    if (t?.closest(".btn-pink, .btn-cyan, .btn-yellow, .btn-ghost")) sfx.coin();
    else if (t?.closest("a, button, summary")) sfx.blip();
  });
}

/* ------------------------------------------------------------------ cheat menu (?) */

function renderCheat() {
  const list = document.querySelector<HTMLElement>("[data-cheat-list]");
  const count = document.querySelector<HTMLElement>("[data-cheat-count]");
  if (!list) return;
  const have = unlocked();
  const keys = Object.keys(ACHIEVEMENTS);
  if (count) count.textContent = `${have.size} / ${keys.length} unlocked`;
  list.innerHTML = keys.map((k) => {
    const a = ACHIEVEMENTS[k];
    const ok = have.has(k);
    return `<li class="${ok ? "" : "is-locked"}"><span class="text-xl">${ok ? a.icon : "🔒"}</span><span><b class="font-display text-lg tracking-wide">${ok ? a.title : "???"}</b><br><span class="text-xs opacity-70">${ok ? a.desc : HINTS[k] ?? "keep playing"}</span></span><span class="hud ${ok ? "text-lime" : "text-muted"}">${ok ? "GOT" : "LOCKED"}</span></li>`;
  }).join("");
  const scores = document.querySelector<HTMLElement>("[data-attract-scores]");
  if (scores) {
    scores.innerHTML = keys.filter((k) => have.has(k)).slice(0, 6).map((k, i) => `<li>${String(i + 1).padStart(2, "0")}. ${ACHIEVEMENTS[k].title.toUpperCase().padEnd(18, ".")} ${String(1000 - i * 120).padStart(5, "0")}</li>`).join("") || "<li>-- NO SCORES YET --</li>";
  }
}

let cheatBound = false;
function initCheat() {
  renderCheat();
  if (cheatBound) return;
  cheatBound = true;
  window.addEventListener("keydown", (e) => {
    if (e.key !== "?" || (e.target as HTMLElement)?.matches("input, textarea")) return;
    const d = document.querySelector<HTMLDialogElement>("[data-cheat]");
    if (!d) return;
    if (d.open) d.close();
    else { d.showModal(); sfx.toggle(); unlock("cheat"); }
  });
}

/* ------------------------------------------------------------------ "love" → Player 2 */

let loveBound = false;
function unlockP2(scroll = true) {
  const first = !document.documentElement.classList.contains("p2-unlocked");
  document.documentElement.classList.add("p2-unlocked");
  store.set("p2", "1");
  const label = document.querySelector<HTMLElement>("[data-p1-label]");
  if (label) label.textContent = "P1+P2";
  if (first) {
    sfx.love();
    heartRain();
    unlock("love");
    toast("💘 PLAYER 2 HAS JOINED", "co-op campaign unlocked");
  }
  const sec = document.getElementById("player2");
  if (sec && scroll) setTimeout(() => sec.scrollIntoView({ behavior: "smooth", block: "start" }), first ? 900 : 0);
  else if (!sec && scroll) location.href = "/#player2";
}

function heartRain() {
  const host = document.querySelector<HTMLElement>("[data-heart-rain]");
  if (!host || reducedMotion()) return;
  const glyphs = ["💗", "💖", "💘", "♥", "💞", "🩷"];
  for (let i = 0; i < 36; i++) {
    const el = document.createElement("span");
    el.textContent = glyphs[i % glyphs.length];
    el.style.left = `${rand(0, 100)}%`;
    el.style.setProperty("--s", `${rand(14, 38)}px`);
    el.style.setProperty("--dur", `${rand(2.2, 4.5)}s`);
    el.style.setProperty("--d", `${rand(0, 1.2)}s`);
    host.appendChild(el);
    setTimeout(() => el.remove(), 6000);
  }
}

function initLove() {
  if (store.get("p2") === "1") unlockP2(false);
  document.querySelectorAll<HTMLElement>("[data-love-trigger]").forEach((el) => on(el, "click", () => unlockP2()));
  if (loveBound) return;
  loveBound = true;
  let buf = "";
  window.addEventListener("keydown", (e) => {
    if (e.key.length !== 1 || (e.target as HTMLElement)?.matches("input, textarea")) return;
    buf = (buf + e.key.toLowerCase()).slice(-8);
    if (buf.endsWith("love")) { buf = ""; unlockP2(); }
  });
}

/* ------------------------------------------------------------------ spider on a thread */

function initSpider() {
  const spider = document.querySelector<HTMLElement>("[data-spider]");
  const btn = spider?.querySelector<HTMLElement>("[data-spider-btn]");
  if (!spider || !btn || reducedMotion()) return;
  const drop = () => {
    spider.style.left = `${rand(20, 85)}%`;
    spider.classList.add("is-down");
    sfx.spider();
    timer(() => spider.classList.remove("is-down"), rand(5000, 9000));
    timer(drop, rand(25000, 60000));
  };
  timer(drop, rand(9000, 20000));
  on(btn, "click", () => {
    spider.classList.remove("is-down");
    sfx.bite();
    unlock("spider");
    document.documentElement.classList.add("ultra");
    timer(() => document.documentElement.classList.remove("ultra"), 2500);
  });
}

/* ------------------------------------------------------------------ attract mode after idle */

let attractBound = false;
function initAttract() {
  const el = document.querySelector<HTMLElement>("[data-attract]");
  if (!el || reducedMotion()) return;
  let t = 0;
  const IDLE = 60_000;
  const arm = () => { clearTimeout(t); t = window.setTimeout(show, IDLE); };
  const show = () => {
    if (document.hidden || document.querySelector("dialog[open]")) { arm(); return; }
    renderCheat();
    el.classList.add("is-on");
    sfx.insert();
    unlock("attract");
  };
  const hide = () => { if (el.classList.contains("is-on")) { el.classList.remove("is-on"); sfx.coin(); } arm(); };
  cleanups.push(() => clearTimeout(t));
  if (!attractBound) {
    attractBound = true;
    ["pointermove", "keydown", "pointerdown", "touchstart", "scroll"].forEach((ev) => window.addEventListener(ev, hide, { passive: true }));
  }
  arm();
}

/* ------------------------------------------------------------------ P1 tag, late night, odometers, console */

let flips = 0;
function countFlip() {
  flips++;
  if (flips === 10) unlock("multiverse");
}

function initMisc() {
  document.querySelectorAll<HTMLElement>("[data-mv]").forEach((el) => {
    const host = el.closest<HTMLElement>(".group") ?? el;
    on(host, "pointerenter", countFlip);
  });
  const tag = document.querySelector<HTMLElement>("[data-p1-tag]");
  const label = document.querySelector<HTMLElement>("[data-p1-label]");
  if (tag && label) {
    let n = 0;
    const names = ["P1", "P2?", "NPC", "BOSS", "P1"];
    on(tag, "click", (e: MouseEvent) => {
      if (location.pathname !== "/") return;
      e.preventDefault();
      n++;
      label.textContent = names[n % names.length];
      sfx.blip();
      if (n === 3) unlock("p1");
    });
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    document.documentElement.classList.add("is-late");
    if (!unlocked().has("late")) timer(() => { unlock("late"); sfx.sleepy(); }, 4000);
  }

  document.querySelectorAll<HTMLElement>("[data-odometer]").forEach((el) => {
    const target = Number(el.dataset.odometer) || 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        const t = clamp((now - t0) / 2200, 0, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString();
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.observe(el);
    cleanups.push(() => io.disconnect());
  });

  document.querySelectorAll<HTMLElement>("[data-vibe='water']").forEach((el) => {
    on(el, "pointerenter", () => sfx.bubble());
  });
}

let consoled = false;
function initConsole() {
  if (consoled) return;
  consoled = true;
  const css = "background:#07040d;color:#ff2e97;font-family:monospace;font-size:14px;padding:8px 12px;border:3px solid #ffe93b";
  console.log("%cDAKSH.EXE v2.616 — you found the console.", css);
  console.log("%cpsst: ↑↑↓↓←→←→BA · press ? · type love · catch the spider · " + UNIVERSES.length + " universes loaded", "color:#1de9ff;font-family:monospace");
}

/* ------------------------------------------------------------------ boot */

function init() {
	cleanups.forEach((fn) => fn());
	cleanups = [];

	initBoot();
	initMenu();
	initReveal();
	initScroll();
	initCursor();
	initMagnetic();
	initTilt();
	initScrambleHover();
	initRotator();
	initAutoGlitch();
	initField();
	initProjectPreview();
	initDragScroll();
	initDialogs();
	initCopy();
	initLocalTime();
	initCountdown();
	initAvatarPoke();
	initSectionAchievements();
	initKonami();
	initSound();
	initMultiverse(on, timer);
	initCheat();
	initLove();
	initSpider();
	initAttract();
	initMisc();
	initConsole();
}

document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-swap", () => {
	// Keep ultra mode across page swaps
	const ultra = document.documentElement.classList.contains("ultra");
	store.set("ultra", ultra ? "1" : "0");
});
