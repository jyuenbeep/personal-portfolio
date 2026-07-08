/* ============================================================
   Jasmine Yuen — portfolio interactions
   1. Interactive wiggling grid  2. Halftone keyboard
   3. Content  4. Nav / reveal
   ============================================================ */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     0a. MECHANICAL "THOCK" — tiny synthesized keyboard click
     ---------------------------------------------------------- */
  let actx = null;
  function playClick() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const now = actx.currentTime;
      // filtered noise burst = the "click"
      const dur = 0.05;
      const buf = actx.createBuffer(1, Math.ceil(actx.sampleRate * dur), actx.sampleRate);
      const data = buf.getChannelData(0);
      for (let n = 0; n < data.length; n++) data[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / data.length, 2.4);
      const src = actx.createBufferSource(); src.buffer = buf;
      const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 0.7;
      const g = actx.createGain(); g.gain.value = 0.22;
      src.connect(bp); bp.connect(g); g.connect(actx.destination);
      // low sine body = the "thock"
      const osc = actx.createOscillator(); osc.type = "sine";
      osc.frequency.setValueAtTime(190, now); osc.frequency.exponentialRampToValueAtTime(90, now + 0.05);
      const og = actx.createGain();
      og.gain.setValueAtTime(0.16, now); og.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.connect(og); og.connect(actx.destination);
      src.start(now); osc.start(now); osc.stop(now + 0.06);
    } catch (e) {}
  }

  /* ----------------------------------------------------------
     0b. BOOT INTRO — type a name out on a mechanical keyboard
     Runs once per session; skippable; respects reduced-motion.
     ---------------------------------------------------------- */
  (function boot() {
    const overlay = document.getElementById("boot");
    if (!overlay) return;
    function dismiss() {
      if (overlay.dataset.gone) return;
      overlay.dataset.gone = "1";
      overlay.classList.add("is-done");
      setTimeout(() => overlay.remove(), 650);
    }
    // reduced-motion users skip the animation entirely
    if (reduce) { overlay.remove(); return; }

    const screen = document.getElementById("boot-text");
    const kb = document.getElementById("boot-kb");
    const skip = document.getElementById("boot-skip");
    const keyEls = {};
    const rows = [
      ["q","w","e","r","t","y","u","i","o","p"],
      ["a","s","d","f","g","h","j","k","l"],
      ["z","x","c","v","b","n","m"],
    ];
    rows.forEach((row, r) => {
      const rowEl = document.createElement("div");
      rowEl.className = "boot__row";
      if (r === 1) rowEl.style.marginLeft = "16px";
      if (r === 2) rowEl.style.marginLeft = "40px";
      row.forEach(k => {
        const key = document.createElement("canvas");
        key.className = "kc"; key.dataset.glyph = k;
        keyEls[k] = key; rowEl.appendChild(key);
      });
      kb.appendChild(rowEl);
    });
    const spaceRow = document.createElement("div");
    spaceRow.className = "boot__row";
    const space = document.createElement("canvas");
    space.className = "kc kc--space"; space.dataset.glyph = "";
    keyEls[" "] = space;
    spaceRow.appendChild(space); kb.appendChild(spaceRow);

    // Render one keycap as a seamless halftone patch: light dots everywhere,
    // darker dots where the glyph is — no borders, letter woven into the dots.
    function drawKey(el, pressed) {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = W * dpr; el.height = H * dpr;
      const ctx = el.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const glyph = el.dataset.glyph;
      // glyph mask
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const o = off.getContext("2d");
      o.fillStyle = "#000"; o.textAlign = "center"; o.textBaseline = "middle";
      o.font = "700 " + Math.round(H * 0.72) + "px 'IBM Plex Mono', ui-monospace, monospace";
      if (glyph) o.fillText(glyph, W / 2, H / 2 + 1);
      const data = o.getImageData(0, 0, W, H).data;
      const gap = 4.2;
      for (let y = gap / 2; y < H; y += gap) {
        for (let x = gap / 2; x < W; x += gap) {
          const inGlyph = data[((y | 0) * W + (x | 0)) * 4 + 3] > 128;
          if (inGlyph) { ctx.fillStyle = pressed ? "rgba(59,110,165,0.98)" : "rgba(20,32,58,0.92)"; ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill(); }
          else { ctx.fillStyle = pressed ? "rgba(108,155,201,0.85)" : "rgba(108,155,201,0.42)"; ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill(); }
        }
      }
    }
    function drawAll() { Object.values(keyEls).forEach(el => drawKey(el, false)); }
    requestAnimationFrame(drawAll);

    const text = "jasmine yuen";
    let i = 0, timer = null, finished = false;
    function press(ch) {
      const el = keyEls[ch];
      if (!el) return;
      el.classList.add("is-down");
      drawKey(el, true);
      setTimeout(() => { el.classList.remove("is-down"); drawKey(el, false); }, 140);
    }
    function step() {
      if (i >= text.length) { setTimeout(dismiss, 520); return; }
      const ch = text[i++];
      screen.textContent += ch;
      press(ch);
      timer = setTimeout(step, ch === " " ? 150 : (85 + Math.random() * 70));
    }
    function skipAll() {
      if (finished) { dismiss(); return; }
      finished = true;
      clearTimeout(timer);
      screen.textContent = text;
      dismiss();
    }
    overlay.addEventListener("click", skipAll);
    window.addEventListener("keydown", function onKey() {
      window.removeEventListener("keydown", onKey);
      skipAll();
    });
    setTimeout(step, 400);
  })();

  /* ----------------------------------------------------------
     1. WIGGLING GRID BACKGROUND
     A mesh of points. The cursor repels nearby points; springs
     pull them home. Lines drawn through the mesh bend = wiggle.
     ---------------------------------------------------------- */
  (function grid() {
    const cv = document.getElementById("grid");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const GAP = 42;          // spacing between mesh points
    const RADIUS = 130;      // cursor influence radius
    const FORCE = 34;        // push strength
    let dpr, cols, rows, pts, W, H;
    const mouse = { x: -9999, y: -9999, on: false };

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / GAP) + 2;
      rows = Math.ceil(H / GAP) + 2;
      pts = [];
      for (let r = 0; r < rows; r++) {
        pts[r] = [];
        for (let c = 0; c < cols; c++) {
          pts[r][c] = { bx: c * GAP, by: r * GAP, x: c * GAP, y: r * GAP, vx: 0, vy: 0 };
        }
      }
    }

    function step() {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = pts[r][c];
          if (mouse.on) {
            const dx = p.bx - mouse.x, dy = p.by - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < RADIUS * RADIUS) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / RADIUS) * FORCE;
              p.vx += (dx / d) * f * 0.14;
              p.vy += (dy / d) * f * 0.14;
            }
          }
          // spring home
          p.vx += (p.bx - p.x) * 0.08;
          p.vy += (p.by - p.y) * 0.08;
          p.vx *= 0.82; p.vy *= 0.82;
          p.x += p.vx; p.y += p.vy;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      // horizontal lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = pts[r][c];
          c === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(29,58,110,0.06)";
        ctx.stroke();
      }
      // vertical lines
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = pts[r][c];
          r === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(29,58,110,0.06)";
        ctx.stroke();
      }
      // highlight displaced nodes near cursor
      if (mouse.on) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const p = pts[r][c];
            const off = Math.abs(p.x - p.bx) + Math.abs(p.y - p.by);
            if (off > 1.5) {
              const a = Math.min(off / 30, 0.6);
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = "rgba(59,110,165," + a + ")";
              ctx.fill();
            }
          }
        }
      }
    }

    function loop() { step(); draw(); requestAnimationFrame(loop); }

    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; });
    window.addEventListener("mouseleave", () => { mouse.on = false; });
    window.addEventListener("touchmove", (e) => {
      const t = e.touches[0]; if (t) { mouse.x = t.clientX; mouse.y = t.clientY; mouse.on = true; }
    }, { passive: true });
    window.addEventListener("touchend", () => { mouse.on = false; });
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(build, 150); });

    build();
    if (reduce) { draw(); } else { loop(); }
  })();

  /* ----------------------------------------------------------
     2. HALFTONE KEYBOARD — spells "code"
     Four keycaps rendered as a halftone dot grid: bright accent
     dots form the letters C·O·D·E, navy dots trace each keycap's
     border, and fainter dots fill the key surfaces. Reads as
     keyboard keys AND spells the word.
     ---------------------------------------------------------- */
  (function halftone() {
    const cv = document.getElementById("keyboard");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const KW = 720, KH = 300;               // logical illustration size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = KW * dpr; cv.height = KH * dpr;
    cv.style.aspectRatio = KW + " / " + KH;
    ctx.scale(dpr, dpr);

    const S = 12;                           // dot spacing
    const CAP_R = 18;
    // four keycaps, centered — sized large so the letters stay legible
    const cw = 150, ch = 190, gap = 22;
    const total = 4 * cw + 3 * gap, sx = (KW - total) / 2, cy = (KH - ch) / 2;
    const caps = ["C", "O", "D", "E"].map((letter, i) => ({
      x: sx + i * (cw + gap), y: cy, w: cw, h: ch, letter,
    }));

    function capPath(o, x, y, w, h, r) {
      o.beginPath();
      o.moveTo(x + r, y);
      o.arcTo(x + w, y, x + w, y + h, r);
      o.arcTo(x + w, y + h, x, y + h, r);
      o.arcTo(x, y + h, x, y, r);
      o.arcTo(x, y, x + w, y, r);
      o.closePath();
    }
    function maskFrom(drawFn) {
      const off = document.createElement("canvas");
      off.width = KW; off.height = KH;
      const o = off.getContext("2d");
      o.clearRect(0, 0, KW, KH);
      drawFn(o);
      return o.getImageData(0, 0, KW, KH).data;
    }
    let capData, borderData, letterData;
    function buildMasks() {
      capData = maskFrom((o) => {
        o.fillStyle = "#000";
        caps.forEach((k) => { capPath(o, k.x, k.y, k.w, k.h, CAP_R); o.fill(); });
      });
      borderData = maskFrom((o) => {
        o.strokeStyle = "#000"; o.lineWidth = 6;
        caps.forEach((k) => { capPath(o, k.x, k.y, k.w, k.h, CAP_R); o.stroke(); });
      });
      letterData = maskFrom((o) => {
        o.fillStyle = "#000"; o.textAlign = "center"; o.textBaseline = "middle";
        o.font = "700 120px 'IBM Plex Mono', ui-monospace, monospace";
        caps.forEach((k) => { o.fillText(k.letter, k.x + k.w / 2, k.y + k.h / 2 + 4); });
      });
    }
    function ink(data, px, py) {
      if (!data) return false;
      const x = px | 0, y = py | 0;
      if (x < 0 || y < 0 || x >= KW || y >= KH) return false;
      return data[(y * KW + x) * 4 + 3] > 128;
    }
    function render(tick) {
      ctx.clearRect(0, 0, KW, KH);
      for (let py = S / 2; py < KH; py += S) {
        for (let px = S / 2; px < KW; px += S) {
          if (ink(letterData, px, py)) {
            const wave = Math.sin((px * 0.045) + (py * 0.05) + tick) * 0.5 + 0.5;
            ctx.fillStyle = "rgba(59,110,165,0.98)";
            ctx.beginPath(); ctx.arc(px, py, 3.4 + wave * 1.4, 0, Math.PI * 2); ctx.fill();
          } else if (ink(borderData, px, py)) {
            ctx.fillStyle = "rgba(29,58,110,0.55)";
            ctx.beginPath(); ctx.arc(px, py, 2.1, 0, Math.PI * 2); ctx.fill();
          } else if (ink(capData, px, py)) {
            ctx.fillStyle = "rgba(29,58,110,0.14)";
            ctx.beginPath(); ctx.arc(px, py, 1.3, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillStyle = "rgba(29,58,110,0.10)";
            ctx.beginPath(); ctx.arc(px, py, 1.1, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }

    let raf, t = 0;
    function start() {
      buildMasks();
      if (reduce) { render(0); }
      else { (function anim() { t += 0.03; render(t); raf = requestAnimationFrame(anim); })(); }
    }
    // render once with a fallback font, then rebuild once the web font loads
    buildMasks(); render(0);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();
  })();

  /* ----------------------------------------------------------
     2b. PLAYABLE HERO KEYCAPS — c·o·d·e depress + thock on press
     ---------------------------------------------------------- */
  // Hero "code" keycaps — halftone dot caps that lift, then click down on hover
  (function heroKeys() {
    const wrap = document.getElementById("code-keys");
    if (!wrap) return;
    const keys = [].slice.call(wrap.querySelectorAll(".code-key"));
    // prime the audio context on the first real gesture (hover can't start it)
    ["pointerdown", "keydown"].forEach(ev => window.addEventListener(ev, function prime() {
      try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) {}
      window.removeEventListener(ev, prime);
    }, { once: true }));

    // fill a rounded-rect on an offscreen ctx and return its alpha data
    function rrMask(W, H, x, y, w, h, r) {
      const o = document.createElement("canvas"); o.width = W; o.height = H;
      const c = o.getContext("2d");
      c.fillStyle = "#000";
      c.beginPath(); c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fill();
      return c.getImageData(0, 0, W, H).data;
    }
    // One halftone keycap labelled with a word. Risen = a raised cap with a
    // shaded bottom edge + soft drop shadow. Pressed = flat, no edge, no shadow.
    function draw(canvas, word, pressed) {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const padX = Math.round(W * 0.05);
      const capW = W - 2 * padX;
      const capTop = pressed ? Math.round(H * 0.12) : Math.round(H * 0.05);
      const capBot = pressed ? Math.round(H * 0.95) : Math.round(H * 0.80);
      const capH = capBot - capTop;
      const edge = pressed ? 0 : Math.round(capH * 0.22);   // bottom-edge thickness
      const faceBottom = capBot - edge;
      const r = Math.round(Math.min(capW, capH) * 0.18);

      const base = rrMask(W, H, padX, capTop, capW, capH, r);
      // fit the word to the face
      const faceH = faceBottom - capTop;
      const fitH = faceH * 0.5, fitW = (capW * 0.78) / (word.length * 0.62);
      const fs = Math.max(10, Math.round(Math.min(fitH, fitW)));
      const og = document.createElement("canvas"); og.width = W; og.height = H;
      const gctx = og.getContext("2d");
      gctx.fillStyle = "#000"; gctx.textAlign = "center"; gctx.textBaseline = "middle";
      gctx.font = "700 " + fs + "px 'IBM Plex Mono', ui-monospace, monospace";
      gctx.fillText(word, W / 2, (capTop + faceBottom) / 2 + 1);
      const gd = gctx.getImageData(0, 0, W, H).data;

      const gap = 5, shBot = H - 2;
      for (let y = gap / 2; y < H; y += gap) {
        for (let x = gap / 2; x < W; x += gap) {
          const idx = ((y | 0) * W + (x | 0)) * 4 + 3;
          if (base[idx] > 128) {
            if (y <= faceBottom) {                          // top face
              if (gd[idx] > 128) { ctx.fillStyle = pressed ? "rgba(59,110,165,0.98)" : "rgba(20,32,58,0.92)"; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
              else { ctx.fillStyle = pressed ? "rgba(108,155,201,0.72)" : "rgba(108,155,201,0.4)"; ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill(); }
            } else {                                        // bottom edge — darker toward the base = thickness
              const t = edge ? (y - faceBottom) / edge : 0;
              ctx.fillStyle = "rgba(20,32,58," + (0.32 + 0.4 * t) + ")";
              ctx.beginPath(); ctx.arc(x, y, 1.4 + 0.6 * t, 0, Math.PI * 2); ctx.fill();
            }
          } else if (!pressed && y > capBot && y < shBot && x > padX + 6 && x < W - padX + 8) {
            // soft halftone drop shadow beneath the risen cap
            const t = (y - capBot) / (shBot - capBot);
            ctx.fillStyle = "rgba(20,32,58," + (0.14 * (1 - t)) + ")";
            ctx.beginPath(); ctx.arc(x + 3, y, 1.1, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    }
    const drawAll = () => keys.forEach(k => draw(k.querySelector("canvas"), k.dataset.word, k.classList.contains("is-down")));
    requestAnimationFrame(drawAll);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);

    keys.forEach(k => {
      const c = k.querySelector("canvas");
      const glyph = k.dataset.word;
      const down = () => { k.classList.add("is-down"); draw(c, glyph, true); };
      const up = () => { k.classList.remove("is-down"); draw(c, glyph, false); };
      k.addEventListener("pointerenter", () => { playClick(); down(); });
      k.addEventListener("pointerleave", up);
      k.addEventListener("pointerdown", () => { playClick(); down(); });
      k.addEventListener("pointerup", up);
      k.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playClick(); down(); } });
      k.addEventListener("keyup", up);
    });
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(drawAll, 150); });
  })();

  /* ----------------------------------------------------------
     3. CONTENT
     ---------------------------------------------------------- */
  const experience = [
    { date: "SUMMER 2026", dur: "Incoming", role: "Software Engineer Intern", co: "ServiceNow",
      logo: "assets/logos/servicenow.png", mono: "sn",
      desc: "Building an AI abstraction layer over the mobile platform that turns natural-language prompts into app screens via Now Assist — cutting screen-building time by 50%+. Wiring Fluent objects (TypeScript) to platform metadata (XML) through the Fluent SDK, backed by integration tests.",
      tags: ["TypeScript", "XML", "Fluent SDK", "LLMs", "Integration Testing"] },
    { date: "SEP 2025 — JAN 2026", dur: "5 mos", role: "Product Fellow", co: "Microsoft",
      logo: "assets/logos/microsoft.png", mono: "ms",
      desc: "Shipped a Copilot-based agentic AI tool for incident handling. Analyzed escalation data and automated case routing, saving $250K/yr and cutting ticket handling time by 30%.",
      tags: ["Copilot", "Agentic AI", "Data Analysis"] },
    { date: "MAY — AUG 2025", dur: "4 mos", role: "Software Engineer Intern", co: "Ford",
      logo: "assets/logos/ford.png", mono: "fo",
      desc: "Built a production cost calculator in the Ford Cloud Platform with React, TypeScript, and 10+ cloud services, improving resource allocation by 75%. Wrote a GCP anomaly-escalation engine projected to save $2M/yr, and debugged Red Hat Developer Hub.",
      tags: ["React", "TypeScript", "GCP", "REST APIs", "RHDH"] },
    { date: "NOV 2024 — NOW", dur: "Present", role: "Co-Director", co: "HackGT",
      logo: "assets/logos/hackgt.png", mono: "hg",
      desc: "Co-direct one of the top MLH hackathons — 1,000+ participants and $100K+ in sponsorships. Coordinate across 10+ organizations to run the event.",
      tags: ["Leadership", "Events", "Sponsorships"] },
    { date: "OCT 2024 — AUG 2025", dur: "11 mos", role: "Full Stack Web Developer", co: "Hytech Racing",
      logo: "assets/logos/hytech.png", mono: "hr",
      desc: "Built the platform for Georgia Tech's Formula SAE team — a containerized React + TypeScript frontend with Mantine and Vite for the team's telemetry and tooling.",
      tags: ["React", "TypeScript", "Mantine", "Vite", "Docker"] },
  ];

  const projects = [
    { idx: "01", glyph: "◈", name: "Schematic", tag: "Dev tooling", stat: "2026 — now",
      tldr: "Catches breaking API changes before your users do.",
      desc: "A schema-diff engine that takes cron snapshots of API responses, detects breaking changes, and fires severity-ranked alerts. Secured with JWT auth, bcrypt, and parameterized queries.",
      stack: "Node.js · Express · PostgreSQL · Prisma", repo: "https://github.com/jyuenbeep" },
    { idx: "02", glyph: "⬡", name: "SecureHub", tag: "Cybersecurity · 2nd place", stat: "8-person team",
      tldr: "A security-awareness app that turns habits into data.",
      desc: "Led an 8-member team building a cybersecurity awareness app with data visualizations. Took 2nd place. Python analytics with pandas and matplotlib over a Flask + SQLite backend.",
      stack: "Python · Flask · SQLite · Kubernetes", repo: "https://github.com/jyuenbeep" },
    { idx: "03", glyph: "❋", name: "WanderSync", tag: "Android app", stat: "lead dev",
      tldr: "Plan a trip together, in real time.",
      desc: "Lead developer on an Android travel-itinerary app backed by Firebase Realtime Database. Built in Android Studio with Java, shipped through a Git / SonarQube / Agile workflow.",
      stack: "Java · Android · Firebase", repo: "https://github.com/jyuenbeep" },
  ];

  const education = [
    { seal: "GT", logo: "assets/gt-crest.png", school: "Georgia Institute of Technology", deg: "B.S. Computer Science", meta: "Aug 2024 — May 2028 · GPA 3.67",
      desc: "Concentrations in Cybersecurity and System Architecture. Coursework: Data Structures & Algorithms, Databases, Computer Organization, Android Development, and C." },
  ];

  const hobbies = [
    { id: "keyboards", cls: "hobby--kbd", no: "01 / KEYBOARDS", ic: "⌨", title: "Mechanical keyboards",
      desc: "I build and tune mechanical keyboards — lubing switches, dialing in the sound, and designing my own layouts.",
      tag: "BUILDS · SWITCHES · LAYOUTS", layout: "monitor",
      intro: "Every board here I put together by hand — sourcing the case and plate, lubing and filming switches, tuning stabilizers, and picking keycaps until the sound and feel are exactly right.",
      shots: [
        { src: "assets/keyboards/01.jpg", name: "Build 01", file: "build-01.txt",
          spec: ["case     : —", "switches : —", "keycaps  : —", "notes    : —"] },
        { src: "assets/keyboards/02.jpg", name: "Build 02", file: "build-02.txt",
          spec: ["case     : —", "switches : —", "keycaps  : —", "notes    : —"] },
        { src: "assets/keyboards/03.jpg", name: "Build 03", file: "build-03.txt",
          spec: ["case     : —", "switches : —", "keycaps  : —", "notes    : —"] },
        { src: "assets/keyboards/04.jpg", name: "Build 04", file: "build-04.txt",
          spec: ["case     : —", "switches : —", "keycaps  : —", "notes    : —"] },
      ] },
    { id: "art", cls: "hobby--art", no: "02 / ART", ic: "✎", title: "Sketching & Blender",
      desc: "I sketch to think through ideas and model in Blender for fun — the same eye for form shows up in how I design interfaces.",
      tag: "PENCIL · INK · 3D", layout: "mosaic",
      intro: "A mix of pencil, ink, and 3D. I sketch to work out ideas and unwind, and model in Blender when I want to build something in three dimensions.",
      shots: [
        { src: "assets/art/01.jpg", cap: "Untitled" },
        { src: "assets/art/02.jpg", cap: "Untitled" },
        { src: "assets/art/03.jpg", cap: "Untitled" },
        { src: "assets/art/04.jpg", cap: "Untitled" },
        { src: "assets/art/05.jpg", cap: "Untitled" },
        { src: "assets/art/06.jpg", cap: "Untitled" },
      ] },
    { id: "reading", cls: "hobby--read", no: "03 / READING", ic: "❦", title: "Reading",
      desc: "Fiction, essays, and the occasional systems paper — reading is how I wind down and pick up new ideas.",
      tag: "FICTION · ESSAYS · PAPERS",
      intro: "A shelf of favorites — fiction, essays, and the occasional systems paper. Reading is how I wind down and pick up new ideas.",
      shots: [
        { src: "assets/books/01.jpg", cap: "Title — Author" },
        { src: "assets/books/02.jpg", cap: "Title — Author" },
        { src: "assets/books/03.jpg", cap: "Title — Author" },
        { src: "assets/books/04.jpg", cap: "Title — Author" },
        { src: "assets/books/05.jpg", cap: "Title — Author" },
        { src: "assets/books/06.jpg", cap: "Title — Author" },
      ] },
  ];

  const el = (html) => { const d = document.createElement("template"); d.innerHTML = html.trim(); return d.content.firstChild; };

  // Timeline
  const tl = document.getElementById("timeline");
  if (tl) experience.forEach(e => tl.appendChild(el(`
    <li class="tl reveal">
      <div class="tl__date"><b>${e.date}</b><span>${e.dur}</span></div>
      <div class="tl__bar"></div>
      <div class="tl__body">
        <div class="tl__role">
          <span class="tl__logo${e.logo ? " has-logo" : ""}">${e.logo ? `<img src="${e.logo}" alt="${e.co} logo" onerror="this.closest('.tl__logo').classList.remove('has-logo'); this.remove()" />` : ""}<span>${e.mono || ""}</span></span>
          <span class="tl__roletext"><h3>${e.role}</h3><span class="tl__co">${e.co}</span></span>
        </div>
        <p class="tl__desc">${e.desc}</p>
        <div class="tags">${e.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
    </li>`)));

  // Projects
  const pg = document.getElementById("projects-grid");
  if (pg) projects.forEach(p => pg.appendChild(el(`
    <article class="card reveal">
      <div class="card__top"><span class="card__idx">PROJECT ${p.idx}</span><span class="card__stat">${p.stat}</span></div>
      <div class="card__glyph">${p.glyph}</div>
      <h3>${p.name}</h3>
      <div class="card__tag">${p.tag}</div>
      <p class="card__tldr">${p.tldr}</p>
      <p class="card__desc">${p.desc}</p>
      <div class="card__foot">
        <span class="card__stack">${p.stack}</span>
        <a class="card__link" href="${p.repo}" target="_blank" rel="noopener"><span class="card__gh">▸</span> View on GitHub ↗</a>
      </div>
    </article>`)));

  // Education
  const ed = document.getElementById("edu");
  if (ed) education.forEach(e => ed.appendChild(el(`
    <div class="edu__card reveal">
      <div class="edu__seal${e.logo ? " has-logo" : ""}">${e.logo ? `<img src="${e.logo}" alt="${e.school} crest" onerror="this.closest('.edu__seal').classList.remove('has-logo'); this.remove()" />` : ""}<span>${e.seal}</span></div>
      <div>
        <h3>${e.school}</h3>
        <div class="edu__deg">${e.deg}</div>
        <div class="edu__meta">${e.meta}</div>
        <p>${e.desc}</p>
      </div>
    </div>`)));

  // Hobbies — each card opens a deep-linked subpage (#play/<id>)
  const hg = document.getElementById("hobbies-grid");
  if (hg) hobbies.forEach(h => {
    const card = el(`
      <button type="button" class="appicon ${h.cls} reveal" data-play="${h.id}" aria-label="Open ${h.title}">
        <span class="appicon__tile"><span class="appicon__glyph">${h.ic}</span></span>
        <span class="appicon__label">${h.title}</span>
        <span class="appicon__meta">${h.tag.toLowerCase()}</span>
      </button>`);
    // click opens the app — unless the icon was just dragged
    card.addEventListener("click", () => { if (card.dataset.dragged) return; location.hash = "#play/" + h.id; });
    makeDraggable(card);
    hg.appendChild(card);
  });

  // Desktop icons can be picked up and moved around, like on a real Mac
  function makeDraggable(icon) {
    let sx, sy, ox, oy, down = false, moved = false;
    icon.style.touchAction = "none";
    icon.addEventListener("pointerdown", (e) => {
      down = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(icon.style.transform || "");
      ox = m ? parseFloat(m[1]) : 0; oy = m ? parseFloat(m[2]) : 0;
      try { icon.setPointerCapture(e.pointerId); } catch (err) {}
    });
    icon.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; icon.classList.add("is-dragging"); }
      if (moved) icon.style.transform = "translate(" + (ox + dx) + "px," + (oy + dy) + "px)";
    });
    const end = () => {
      if (!down) return;
      down = false;
      icon.classList.remove("is-dragging");
      if (moved) { icon.dataset.dragged = "1"; setTimeout(() => { delete icon.dataset.dragged; }, 0); }
    };
    icon.addEventListener("pointerup", end);
    icon.addEventListener("pointercancel", end);
  }

  // Live clock in the desktop menu bar
  (function menubarClock() {
    const clk = document.getElementById("menubar-clock");
    if (!clk) return;
    const fmt = () => {
      const d = new Date();
      clk.textContent =
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
        "  " +
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };
    fmt(); setInterval(fmt, 30000);
  })();

  /* ----------------------------------------------------------
     3b. PLAY SUBPAGES — image galleries, deep-linked via hash
     ---------------------------------------------------------- */
  const pv = document.getElementById("playview");
  const pvInner = document.getElementById("playview-inner");
  const pvCrumb = document.getElementById("playview-crumb");
  const byId = Object.fromEntries(hobbies.map(h => [h.id, h]));

  // --- default gallery (fixed tiles, cropped) — used for Reading ---
  function shotHTML(s) {
    return `
      <figure class="shot">
        <img src="${s.src}" alt="${s.cap}" loading="lazy"
             onerror="this.closest('.shot').classList.add('shot--empty'); this.remove();" />
        <span class="shot__ph" aria-hidden="true">◲</span>
        <figcaption>${s.cap}</figcaption>
      </figure>`;
  }
  function galleryHTML(h) {
    return `<div class="pv-gallery">${h.shots.map(shotHTML).join("")}</div>`;
  }

  // --- masonry mosaic (varied sizes, uncropped, equal gaps) — used for Art ---
  function mosaicHTML(h) {
    return `<div class="pv-mosaic">${h.shots.map(s => `
      <figure class="tile">
        <img src="${s.src}" alt="${s.cap || "Artwork"}" loading="lazy"
             onerror="this.closest('.tile').classList.add('tile--empty'); this.remove();" />
        <span class="tile__ph" aria-hidden="true">◲</span>
      </figure>`).join("")}</div>`;
  }

  // --- monitors w/ halftone screens + terminal specs — used for Keyboards ---
  function monitorHTML(h) {
    return `<div class="pv-monitors">${h.shots.map((s, i) => `
      <div class="rig">
        <div class="monitor">
          <div class="monitor__bezel">
            <canvas class="bezel-ht" aria-hidden="true"></canvas>
            <div class="monitor__screen">
              <img src="${s.src}" alt="${s.name || "Keyboard"}" loading="lazy"
                   onerror="this.closest('.monitor__screen').classList.add('is-empty'); this.remove();" />
            </div>
          </div>
          <div class="monitor__neck"></div>
          <div class="monitor__foot"></div>
        </div>
        <div class="term">
          <div class="term__bar">
            <span class="term__dots"><i></i><i></i><i></i></span>
            <span class="term__file">${s.file || ("build-" + String(i + 1).padStart(2, "0") + ".txt")}</span>
          </div>
          <div class="term__body">
            <div class="term__line"><span class="term__prompt">$</span> cat ${s.file || "build.txt"}</div>
            ${(s.spec || []).map(line => `<div class="term__line term__out">${line}</div>`).join("")}
          </div>
        </div>
      </div>`).join("")}</div>`;
  }

  // Draw a wave-modulated halftone dot pattern across the monitor bezel/frame.
  function drawBezel(canvas) {
    const rect = canvas.getBoundingClientRect();
    const W = Math.round(rect.width), H = Math.round(rect.height);
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const S = 9, maxR = 2.6;
    for (let y = S / 2; y < H; y += S) {
      for (let x = S / 2; x < W; x += S) {
        const wave = Math.sin(x * 0.06) * Math.cos(y * 0.06) * 0.5 + 0.5;
        const r = 1 + wave * maxR;
        ctx.fillStyle = "rgba(150,185,224," + (0.28 + wave * 0.5) + ")";
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  function renderMonitors() {
    pvInner.querySelectorAll("canvas.bezel-ht").forEach(drawBezel);
  }

  const layoutRenderers = { mosaic: mosaicHTML, monitor: monitorHTML };

  function openPlay(id) {
    const h = byId[id];
    if (!h || !pv || !pvInner) return;
    pvCrumb.textContent = "// play / " + id;
    const bodyHTML = (layoutRenderers[h.layout] || galleryHTML)(h);
    pvInner.innerHTML = `
      <div class="pv-head">
        <div class="pv-ic ${h.cls}">${h.ic}</div>
        <div>
          <div class="kicker"><span class="kicker__sq"></span>// off the clock</div>
          <h2 class="pv-title">${h.title}</h2>
          <p class="pv-intro">${h.intro}</p>
        </div>
      </div>
      ${bodyHTML}`;
    pv.classList.add("is-open");
    pv.setAttribute("aria-hidden", "false");
    document.body.classList.add("play-locked");
    pv.scrollTop = 0;
    if (h.layout === "monitor") requestAnimationFrame(renderMonitors);
  }

  function closePlay() {
    if (!pv) return;
    pv.classList.remove("is-open");
    pv.setAttribute("aria-hidden", "true");
    document.body.classList.remove("play-locked");
  }

  function routePlay() {
    const m = location.hash.match(/^#play\/([\w-]+)$/);
    if (m && byId[m[1]]) openPlay(m[1]);
    else closePlay();
  }

  window.addEventListener("hashchange", routePlay);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pv && pv.classList.contains("is-open")) location.hash = "#hobbies";
  });
  let pvrz;
  window.addEventListener("resize", () => {
    if (!pv || !pv.classList.contains("is-open")) return;
    clearTimeout(pvrz); pvrz = setTimeout(renderMonitors, 180);
  });
  routePlay(); // handle a direct load on #play/<id>

  /* ----------------------------------------------------------
     4. NAV + REVEAL
     ---------------------------------------------------------- */
  const nav = document.getElementById("nav");

  // Scroll progress — segmented terminal-style loading bar + % readout
  const progress = document.createElement("div");
  progress.className = "progress"; progress.setAttribute("aria-hidden", "true");
  const pbar = document.createElement("div");
  pbar.className = "progress__bar";
  progress.appendChild(pbar);
  const pct = document.createElement("div");
  pct.className = "progress__pct"; pct.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);
  document.body.appendChild(pct);

  const onScroll = () => {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 40);
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    pbar.style.width = (ratio * 100) + "%";
    pct.textContent = Math.round(ratio * 100) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById("burger");
  if (burger) burger.addEventListener("click", () => {
    document.querySelector(".nav__links").scrollIntoView();
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });

  // Reveal on scroll — cascade grouped siblings with a staggered delay
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      setTimeout(() => el.classList.add("in"), +(el.dataset.rdelay || 0));
      io.unobserve(el);
    });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach(el => {
    const sibs = [].slice.call(el.parentElement.children).filter(c => c.classList.contains("reveal"));
    const idx = sibs.indexOf(el);
    el.dataset.rdelay = Math.min(idx, 8) * 80;
    io.observe(el);
  });

  // Scramble / decode text on hover (nav links + headings)
  if (!reduce) {
    const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>*!?{}";
    const runScramble = (el) => {
      if (el._scr) return;
      el._scr = true;
      const text = el.dataset.stext;
      const lock = [];
      for (let i = 0; i < text.length; i++) lock[i] = 6 + i * 1.7 + Math.random() * 5;
      let frame = 0;
      (function tick() {
        let out = "", done = true;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (c === " ") { out += " "; continue; }
          if (frame >= lock[i]) out += c;
          else { out += CH[(Math.random() * CH.length) | 0]; done = false; }
        }
        el.textContent = out;
        if (done) { el.textContent = text; el._scr = false; return; }
        frame++; requestAnimationFrame(tick);
      })();
    };
    document.querySelectorAll(".nav__links a, .section__title, .hero__accent, .contact__title").forEach(el => {
      el.dataset.stext = el.textContent.trim();
      el.addEventListener("mouseenter", () => runScramble(el));
    });
  }
})();
