/* ============================================================
   ASCII animations for the "main terminal" (the shell you reach
   by typing `exit` in claude). Each entry is one shell command.

   Animated:  { fps, duration?, init(cols, rows, args) -> state,
                frame(state, n, t) -> html | null (null = finished) }
   Static:    { static(args, cols) -> html }

   To add one: add an entry below and it shows up in `help` automatically.
   ============================================================ */
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // a char grid that renders to html, merging runs of the same color class
  function grid(cols, rows) {
    const ch = Array.from({ length: rows }, () => Array(cols).fill(" "));
    const cl = Array.from({ length: rows }, () => Array(cols).fill(""));
    return {
      cols, rows,
      set(x, y, c, cls = "") {
        x = Math.round(x); y = Math.round(y);
        if (x < 0 || y < 0 || x >= cols || y >= rows) return;
        ch[y][x] = c; cl[y][x] = cls;
      },
      text(x, y, s, cls = "") { [...s].forEach((c, i) => { if (c !== " ") this.set(x + i, y, c, cls); }); },
      html() {
        return ch.map((row, y) => {
          let out = "", run = "", cur = null;
          const flush = () => { if (run) out += cur ? `<span class="${cur}">${esc(run)}</span>` : esc(run); run = ""; };
          row.forEach((c, x) => { const k = cl[y][x]; if (k !== cur) { flush(); cur = k; } run += c; });
          flush();
          return out.replace(/\s+$/, "");
        }).join("\n");
      },
    };
  }

  /* ---------- donut — the classic spinning torus ---------- */
  const donut = {
    fps: 24, duration: 20,
    init: (cols) => ({ W: Math.min(cols, 72), H: 22, A: 0, B: 0 }),
    frame(s) {
      const { W, H } = s, b = Array(W * H).fill(" "), z = Array(W * H).fill(0);
      const sA = Math.sin(s.A), cA = Math.cos(s.A), sB = Math.sin(s.B), cB = Math.cos(s.B);
      for (let j = 0; j < 6.28; j += 0.07) {
        const ct = Math.cos(j), st = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const sp = Math.sin(i), cp = Math.cos(i), h = ct + 2;
          const D = 1 / (sp * h * sA + st * cA + 5), t = sp * h * cA - st * sA;
          const x = Math.floor(W / 2 + W * 0.42 * D * (cp * h * cB - t * sB));
          const y = Math.floor(H / 2 + 1 + H * 0.7 * D * (cp * h * sB + t * cB));
          const o = x + W * y;
          const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
          if (y >= 0 && y < H && x >= 0 && x < W && D > z[o]) { z[o] = D; b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0]; }
        }
      }
      s.A += 0.07; s.B += 0.03;
      let out = "";
      for (let y = 0; y < H; y++) out += b.slice(y * W, y * W + W).join("").replace(/\s+$/, "") + "\n";
      return `<span class="a-acc">${esc(out)}</span>`;
    },
  };

  /* ---------- matrix — falling green rain ---------- */
  const MATRIX_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
  const matrix = {
    fps: 18, duration: 20,
    init(cols, rows) {
      const H = Math.min(rows, 22);
      return {
        W: cols, H,
        drops: Array.from({ length: cols }, () => ({ y: rnd(-H, 0), v: rnd(0.3, 1), len: Math.floor(rnd(5, 16)) })),
        chars: Array.from({ length: H }, () => Array.from({ length: cols }, () => pick(MATRIX_CHARS))),
      };
    },
    frame(s) {
      const g = grid(s.W, s.H);
      s.drops.forEach((d, x) => {
        d.y += d.v;
        if (d.y - d.len > s.H) Object.assign(d, { y: rnd(-8, 0), v: rnd(0.3, 1), len: Math.floor(rnd(5, 16)) });
        for (let k = 0; k < d.len; k++) {
          const y = Math.floor(d.y) - k;
          if (y < 0 || y >= s.H) continue;
          if (Math.random() < 0.04) s.chars[y][x] = pick(MATRIX_CHARS);
          g.set(x, y, s.chars[y][x], k === 0 ? "a-mh" : k < 4 ? "a-m1" : k < 9 ? "a-m2" : "a-m3");
        }
      });
      return g.html();
    },
  };

  /* ---------- fire — doom-style fire, dies down at the end ---------- */
  const FIRE = " .:-=+*#%@";
  const fire = {
    fps: 24, duration: 14,
    init: (cols) => ({ W: Math.min(cols, 90), H: 18, px: null }),
    frame(s, n, t) {
      const { W, H } = s;
      if (!s.px) { s.px = Array(W * H).fill(0); for (let x = 0; x < W; x++) s.px[(H - 1) * W + x] = 36; }
      if (t > this.duration - 3) for (let x = 0; x < W; x++) s.px[(H - 1) * W + x] = Math.max(0, s.px[(H - 1) * W + x] - 3);
      for (let x = 0; x < W; x++) {
        for (let y = 1; y < H; y++) {
          const src = y * W + x, r = Math.floor(Math.random() * 3);
          const dst = src - r + 1 - W;
          // cool by ~2 per row so the flames die out before the top
          if (dst >= 0) s.px[dst] = Math.max(0, s.px[src] - Math.floor(Math.random() * 5));
        }
      }
      const g = grid(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const v = s.px[y * W + x];
        if (!v) continue;
        const c = FIRE[Math.min(FIRE.length - 1, Math.floor((v / 36) * FIRE.length))];
        g.set(x, y, c, v > 30 ? "a-f4" : v > 22 ? "a-f3" : v > 12 ? "a-f2" : "a-f1");
      }
      return g.html();
    },
  };

  /* ---------- sl — a little train rolls by (for when you mistype ls) ---------- */
  const TRAIN = [
    "                                                          ",
    "   _____  ||____   ______________   ______________        ",
    "  |  _  | []    | |  jasmine.sh  | |   resume.md  |       ",
    "  | |_| |       |_|              |_|              |       ",
    "  |_____|_______|-|______________|-|______________|       ",
    "  _(O)__(O)__(O)____(O)____(O)______(O)____(O)____        ",
  ];
  const SMOKE = ["(  )", "( @ )", "(   )", "( )", "@"];
  const sl = {
    fps: 28,
    init: (cols) => ({ W: Math.max(cols, 40), x: Math.max(cols, 40) }),
    frame(s, n) {
      const g = grid(s.W, 10);
      const x = s.x--;
      if (x < -TRAIN[0].length) return null;
      // smoke drifts up and back from the chimney
      for (let k = 0; k < 4; k++) {
        const age = (n + k * 4) % 16;
        g.text(x + 4 + Math.floor(age / 2), 3 - Math.floor(age / 5), SMOKE[(k + Math.floor(n / 4)) % SMOKE.length], "a-dim");
      }
      TRAIN.forEach((line, i) => {
        const l = i === 5 && n % 4 < 2 ? line.replace(/\(O\)/g, "(o)") : line;
        g.text(x, 4 + i, l, i === 2 ? "a-acc" : "");
      });
      return g.html();
    },
  };

  /* ---------- aquarium — fish, bubbles, seaweed ---------- */
  const FISH_R = ["><>", "><((('>", ">=>", "><(((°>"];
  const FISH_L = ["<><", "<')))><", "<=<", "<°)))><"];
  const aquarium = {
    fps: 12, duration: 25,
    init(cols, rows) {
      const W = cols, H = Math.min(rows, 18);
      const fish = Array.from({ length: Math.max(4, Math.floor(W / 12)) }, () => {
        const dir = Math.random() < 0.5 ? 1 : -1, k = Math.floor(Math.random() * FISH_R.length);
        return { x: rnd(0, W), y: Math.floor(rnd(1, H - 4)), dir, v: rnd(0.2, 0.7), k, cls: pick(["a-f3", "a-acc", "a-blue", "a-pink"]) };
      });
      const weeds = Array.from({ length: Math.floor(W / 9) }, () => ({ x: Math.floor(rnd(1, W - 1)), h: Math.floor(rnd(2, 6)) }));
      return { W, H, fish, weeds, bubbles: [] };
    },
    frame(s, n) {
      const { W, H } = s, g = grid(W, H);
      for (let x = 0; x < W; x++) g.set(x, 0, "~", "a-blue");
      for (let x = 0; x < W; x++) g.set(x, H - 1, (x + 1) % 3 ? "." : ":", "a-f2");
      s.weeds.forEach((w) => { for (let k = 0; k < w.h; k++) g.set(w.x + ((k + Math.floor(n / 6)) % 2), H - 2 - k, (k + Math.floor(n / 6)) % 2 ? ")" : "(", "a-m2"); });
      if (Math.random() < 0.25) s.bubbles.push({ x: Math.floor(rnd(0, W)), y: H - 2 });
      s.bubbles = s.bubbles.filter((b) => { b.y -= 0.35; return b.y > 0.5; });
      s.bubbles.forEach((b) => g.set(b.x, b.y, b.y < H / 3 ? "O" : b.y < (2 * H) / 3 ? "o" : ".", "a-dim"));
      s.fish.forEach((f) => {
        f.x += f.dir * f.v;
        const sprite = (f.dir > 0 ? FISH_R : FISH_L)[f.k];
        if (f.dir > 0 && f.x > W) f.x = -sprite.length;
        if (f.dir < 0 && f.x < -sprite.length) f.x = W;
        g.text(Math.round(f.x), f.y, sprite, f.cls);
      });
      return g.html();
    },
  };

  /* ---------- keyboard — a board types a message, key by key ---------- */
  const ROWS = ["1234567890", "QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM,."];
  const MESSAGES = ["clack clack clack", "lubed, filmed, and tuned.", "hello, i'm jasmine.", "thocc", "tactile > linear? discuss."];
  const keyboard = {
    fps: 20,
    init: (cols, rows, args) => ({ msg: args.length ? args.join(" ") : pick(MESSAGES), i: 0, hold: 0, wait: 0 }),
    frame(s) {
      if (s.i >= s.msg.length) { if (++s.wait > 30) return null; }
      else if (++s.hold >= 3) { s.hold = 0; s.i++; }
      const typed = s.msg.slice(0, s.i);
      const cur = s.i < s.msg.length ? s.msg[s.i].toUpperCase() : null;
      const lines = [`<span class="a-dim">❯</span> ${esc(typed)}<span class="a-caret"> </span>`, ""];
      ROWS.forEach((row, r) => {
        const pad = " ".repeat(r * 2);
        const keys = [...row].map((k) => (k === cur && s.hold < 2 ? `<span class="a-key-on">[ ${esc(k)} ]</span>` : `[ ${esc(k)} ]`));
        lines.push(pad + keys.join(""));
      });
      const space = cur === " " && s.hold < 2;
      lines.push("        " + (space ? `<span class="a-key-on">[                         ]</span>` : "[                         ]"));
      return lines.join("\n");
    },
  };

  /* ---------- static fun ---------- */
  const FORTUNES = [
    "There are 10 kinds of people: those who read binary and those who don't.",
    "It works on my machine. Ship the machine.",
    "A clean commit history is a love letter to future you.",
    "Today is a good day to lube some switches.",
    "Weeks of coding can save you hours of planning.",
    "The cloud is just someone else's computer. The keyboard is yours.",
    "Never trust a hackathon project that compiles on the first try.",
  ];

  const cowsay = {
    static(args) {
      const msg = args.length ? args.join(" ") : pick(FORTUNES);
      // wrap to 38 columns
      const words = msg.split(/\s+/), lines = [];
      let cur = "";
      words.forEach((w) => { if ((cur + " " + w).trim().length > 38) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); });
      lines.push(cur);
      const w = Math.max(...lines.map((l) => l.length));
      const body = lines.length === 1 ? [`< ${lines[0]} >`]
        : lines.map((l, i) => `${i === 0 ? "/" : i === lines.length - 1 ? "\\" : "|"} ${l.padEnd(w)} ${i === 0 ? "\\" : i === lines.length - 1 ? "/" : "|"}`);
      return esc([" " + "_".repeat(w + 2), ...body, " " + "-".repeat(w + 2),
        "        \\   ^__^",
        "         \\  (oo)\\_______",
        "            (__)\\       )\\/\\",
        "                ||----w |",
        "                ||     ||"].join("\n"));
    },
  };

  const fortune = { static: () => esc(pick(FORTUNES)) };

  const neofetch = {
    static() {
      const logo = [
        "     ________ ",
        "    /       /|",
        "   /  J Y  / |",
        "  /_______/  |",
        "  |       |  |",
        "  |  esc  |  /",
        "  |       | / ",
        "  |_______|/  ",
        "              ",
      ];
      const info = [
        `<span class="a-acc">jasmine</span>@<span class="a-acc">macbook</span>`,
        "---------------",
        ["OS", "jasmineOS v2 (terminal edition)"],
        ["Host", "Georgia Tech · CS '28"],
        ["Kernel", "cybersecurity + systems"],
        ["Uptime", "one keyboard build at a time"],
        ["Packages", "5 roles (ServiceNow, Microsoft, Ford, ...)"],
        ["Shell", "claude → zsh"],
        ["Languages", "TypeScript, Python, Java, Kotlin, C"],
        ["Hobbies", "keyboards, sketching, blender, bouldering"],
        "",
        ["", ["#e0786e", "#d97757", "#d9c27f", "#8fbf7f", "#7fa8d9", "#b79ad9", "#e9e6df"].map((c) => `<span style="color:${c}">███</span>`).join("")],
      ].map((x) => (Array.isArray(x) ? (x[0] ? `<span class="a-acc">${x[0]}</span>: ${x[1]}` : x[1]) : x));
      return Array.from({ length: Math.max(logo.length, info.length) }, (_, i) =>
        `<span class="a-acc">${esc(logo[i] || " ".repeat(14))}</span>   ${info[i] || ""}`).join("\n");
    },
  };

  window.ANIMATIONS = { donut, matrix, fire, sl, aquarium, keyboard, cowsay, fortune, neofetch };
})();
