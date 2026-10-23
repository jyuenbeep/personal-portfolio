/* ============================================================
   jasmine's desktop — a fake macOS desktop with one window:
   a claude-style terminal you can ls, cd, cat and ask around in.

   1. CONFIG
   2. CONTENT (virtual filesystem)
   3. WALLPAPER
   4. WINDOW (drag, resize, traffic lights)
   5. TERMINAL (output, markdown, commands, ask)
   6. DESKTOP (greeting, icons)
   7. BOOT
   ============================================================ */
(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. CONFIG
     ---------------------------------------------------------- */
  // Your default wallpaper. Swap the file (or this path) to change it for everyone.
  // Visitors can still set their own via right-click / dock / `wallpaper`.
  const WALLPAPER = "assets/wallpaper.jpg";
  // width taken on the right by the art widget (300) + one column of icons (88) + gaps
  const RIGHT_RAIL = 16 + 300 + 12 + 88;
  // width taken on the left by the staggered company icons
  const LEFT_RAIL = 28 + 76 + 88 + 16;
  const STORE = { wall: "jy.wallpaper", win: "jy.window", hist: "jy.history", icons: "jy.icons" };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ----------------------------------------------------------
     2. CONTENT — every file is markdown; dirs are plain objects
     ---------------------------------------------------------- */
  const experience = [
    { file: "servicenow.md", co: "ServiceNow", role: "Software Engineer Intern", date: "Summer 2026 · incoming",
      logo: "assets/logos/servicenow.png",
      points: [
        "Building an AI abstraction layer over the mobile platform that turns natural-language prompts into app screens via Now Assist — cutting screen-building time by 50%+.",
        "Wiring Fluent objects (TypeScript) to platform metadata (XML) through the Fluent SDK, backed by integration tests.",
      ],
      tags: ["TypeScript", "XML", "Fluent SDK", "LLMs", "Integration Testing"] },
    { file: "microsoft.md", co: "Microsoft", role: "Product Fellow", date: "Sep 2025 — Jan 2026 · 5 mos",
      logo: "assets/logos/microsoft.png",
      points: [
        "Shipped a Copilot-based agentic AI tool for incident handling.",
        "Analyzed escalation data and automated case routing, saving $250K/yr and cutting ticket handling time by 30%.",
      ],
      tags: ["Copilot", "Agentic AI", "Data Analysis"] },
    { file: "ford.md", co: "Ford", role: "Software Engineer Intern", date: "May — Aug 2025 · 4 mos",
      logo: "assets/logos/ford.png",
      points: [
        "Built a production cost calculator in the Ford Cloud Platform with React, TypeScript, and 10+ cloud services, improving resource allocation by 75%.",
        "Wrote a GCP anomaly-escalation engine projected to save $2M/yr.",
        "Debugged Red Hat Developer Hub (RHDH).",
      ],
      tags: ["React", "TypeScript", "GCP", "REST APIs", "RHDH"] },
    { file: "hackgt.md", co: "HackGT", role: "Co-Director", date: "Nov 2024 — now",
      logo: "assets/logos/hackgt.png",
      points: [
        "Co-direct one of the top MLH hackathons — 1,000+ participants and $100K+ in sponsorships.",
        "Coordinate across 10+ organizations to run the event.",
      ],
      tags: ["Leadership", "Events", "Sponsorships"] },
    { file: "hytech-racing.md", co: "Hytech Racing", role: "Full Stack Web Developer", date: "Oct 2024 — Aug 2025 · 11 mos",
      logo: "assets/logos/hytech.png",
      points: [
        "Built the platform for Georgia Tech's Formula SAE team — a containerized React + TypeScript frontend with Mantine and Vite for the team's telemetry and tooling.",
      ],
      tags: ["React", "TypeScript", "Mantine", "Vite", "Docker"] },
  ];

  const projects = [
    { file: "schematic.md", name: "Schematic", tag: "Dev tooling · 2026 — now",
      tldr: "Catches breaking API changes before your users do.",
      desc: "A schema-diff engine that takes cron snapshots of API responses, detects breaking changes, and fires severity-ranked alerts. Secured with JWT auth, bcrypt, and parameterized queries.",
      stack: "Node.js · Express · PostgreSQL · Prisma", repo: "https://github.com/jyuenbeep" },
    { file: "securehub.md", name: "SecureHub", tag: "Cybersecurity · 2nd place · 8-person team",
      tldr: "A security-awareness app that turns habits into data.",
      desc: "Led an 8-member team building a cybersecurity awareness app with data visualizations. Took 2nd place. Python analytics with pandas and matplotlib over a Flask + SQLite backend.",
      stack: "Python · Flask · SQLite · Kubernetes", repo: "https://github.com/jyuenbeep" },
    { file: "wandersync.md", name: "WanderSync", tag: "Android app · lead dev",
      tldr: "Plan a trip together, in real time.",
      desc: "Lead developer on an Android travel-itinerary app backed by Firebase Realtime Database. Built in Android Studio with Java, shipped through a Git / SonarQube / Agile workflow.",
      stack: "Java · Android · Firebase", repo: "https://github.com/jyuenbeep" },
  ];

  const skills = ["Java", "Python", "TypeScript", "React", "Kotlin", "SQL", "Flask", "Node.js", "HTML/CSS",
    "Git", "REST APIs", "GCP", "RHDH", "JUnit", "Blender", "C"];

  const md = {
    about: `# about
I care about the parts of software people never notice — the interface that gets out of the way, and the system underneath that holds up when it matters.

Security and systems pull me in because I like understanding how something works all the way down, then making it feel simple on the surface. Most of my time goes to turning fuzzy, open-ended problems into interfaces and code other people can actually build on — and I'd rather ship something clear and readable than clever.

That same eye for detail is why I build keyboards, sketch, and model in Blender: I like things that are considered, tactile, and a little bit fun. It's also why I co-direct *HackGT* — putting on something a thousand people show up to is its own kind of engineering.

## spec
- **role**    software engineer · student
- **school**  georgia tech · cs '28
- **focus**   cybersecurity · systems
- **stack**   typescript · react · python
- **based**   atlanta, ga
- **status**  open to 2027 internships`,

    contact: `# contact
Open to summer 2027 internships and interesting problems. Email is the best way to reach me.

- **email**     [jasminey023@gmail.com](mailto:jasminey023@gmail.com)
- **github**    [github.com/jyuenbeep](https://github.com/jyuenbeep)
- **linkedin**  [linkedin.com/in/jasmineyiyuen](https://www.linkedin.com/in/jasmineyiyuen/)`,

    skills: `# skills
${skills.map((s) => "`" + s + "`").join("  ")}`,

    education: `# Georgia Institute of Technology
<span class="tagline">B.S. Computer Science · Aug 2024 — May 2028 · GPA 3.67</span>

Concentrations in **Cybersecurity** and **System Architecture**.

## coursework
- Data Structures & Algorithms
- Databases
- Computer Organization
- Android Development
- C`,

    more: `# also into
- hiking
- traveling
- bouldering
- music
- reading — fiction, essays, and the occasional systems paper`,

    secret: `# shh
you found it.

this window is running **claude**, but there's a plain old shell underneath with a few toys in it.

- type \`exit\` to leave claude
- then try \`help\` to see what's in there
- \`claude\` brings you back`,

    keyboards: `# mechanical keyboards
Every board here I put together by hand — sourcing the case and plate, lubing and filming switches, tuning stabilizers, and picking keycaps until the sound and feel are exactly right.

Run \`open builds\` or \`ls\` to see them.`,

    art: `# sketching & blender
A mix of pencil, ink, and 3D. I sketch to work out ideas and unwind, and model in Blender when I want to build something in three dimensions.

Run \`open .\` here to see the gallery.`,
  };

  const expMd = (e) => `# ${e.co}
<img class="md-logo" src="${e.logo}" alt="" onerror="this.remove()">
**${e.role}**
<span class="tagline">${e.date}</span>

${e.points.map((p) => "- " + p).join("\n")}

${e.tags.map((t) => "`" + t + "`").join("  ")}`;

  const projMd = (p) => `# ${p.name}
<span class="tagline">${p.tag}</span>

**${p.tldr}**

${p.desc}

- **stack**  ${p.stack}
- **repo**   [${p.repo.replace("https://", "")}](${p.repo})`;

  const resumeMd = () => `# Jasmine Yuen
<span class="tagline">CS @ Georgia Tech '28 · cybersecurity & systems · jasminey023@gmail.com</span>

## experience
${experience.map((e) => `### ${e.role} — ${e.co}\n<span class="tagline">${e.date}</span>\n${e.points.map((p) => "- " + p).join("\n")}`).join("\n\n")}

## projects
${projects.map((p) => `### ${p.name}\n<span class="tagline">${p.stack}</span>\n- ${p.desc}`).join("\n\n")}

## education
### Georgia Institute of Technology
<span class="tagline">B.S. Computer Science · May 2028 · GPA 3.67</span>

## skills
${skills.join(" · ")}`;

  const file = (content) => ({ type: "file", content });
  const img = (src) => ({ type: "img", src });
  const link = (url) => ({ type: "link", url });
  const dir = (children) => ({ type: "dir", children });
  const fromList = (list, toMd) => dir(Object.fromEntries(list.map((x) => [x.file, file(toMd(x))])));

  const FS = dir({
    "about.md": file(md.about),
    "contact.md": file(md.contact),
    "resume.md": file(resumeMd()),
    "skills.md": file(md.skills),
    "experience": fromList(experience, expMd),
    "projects": fromList(projects, projMd),
    "education": dir({ "georgia-tech.md": file(md.education) }),
    "play": dir({
      "keyboards": dir({
        "README.md": file(md.keyboards),
        "build-01.jpg": img("assets/keyboards/01.jpg"),
        "build-02.jpg": img("assets/keyboards/02.jpg"),
        "build-03.jpg": img("assets/keyboards/03.jpg"),
        "build-04.jpg": img("assets/keyboards/04.jpg"),
      }),
      "art": dir({
        "README.md": file(md.art),
        "01.jpg": img("assets/art/01.jpg"),
        "02.jpg": img("assets/art/02.jpg"),
        "03.jpg": img("assets/art/03.jpg"),
        "04.jpg": img("assets/art/04.jpg"),
        "05.jpg": img("assets/art/05.jpg"),
        "06.jpg": img("assets/art/06.jpg"),
      }),
      "more.md": file(md.more),
    }),
    "photo.jpg": img("assets/jasmine.jpg"),
    "secret.md": file(md.secret),
    "links": dir({
      "github": link("https://github.com/jyuenbeep"),
      "linkedin": link("https://www.linkedin.com/in/jasmineyiyuen/"),
      "email": link("mailto:jasminey023@gmail.com"),
    }),
  });

  /* path helpers — paths are arrays of segments from ~ */
  let cwd = [];
  const fmtPath = (p) => (p.length ? "~/" + p.join("/") : "~");

  function resolve(input) {
    if (input == null || input === "") return cwd.slice();
    if (input === "~") return [];
    let parts = input.startsWith("~") || input.startsWith("/") ? [] : cwd.slice();
    input.replace(/^~\/?/, "").replace(/^\//, "").split("/").forEach((seg) => {
      if (!seg || seg === ".") return;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    });
    return parts;
  }

  function nodeAt(parts) {
    let n = FS;
    for (const seg of parts) {
      if (n.type !== "dir") return null;
      // case-insensitive match so "experience/Ford.md" still works
      const key = n.children[seg] ? seg : Object.keys(n.children).find((k) => k.toLowerCase() === seg.toLowerCase());
      if (!key) return null;
      n = n.children[key];
    }
    return n;
  }

  // walk every node: cb(pathArray, node)
  function walk(n, path, cb) {
    cb(path, n);
    if (n.type === "dir") Object.keys(n.children).forEach((k) => walk(n.children[k], path.concat(k), cb));
  }

  const plain = (s) => s.replace(/^- /gm, "").replace(/<[^>]+>/g, " ").replace(/[`*#\[\]]/g, "").replace(/\(([^)]*)\)/g, " ").replace(/\s+/g, " ");

  /* ----------------------------------------------------------
     3. WALLPAPER
     ---------------------------------------------------------- */
  const wallEl = $("wallpaper");
  const wallInput = $("wall-file");

  function applyWallpaper(src) {
    const probe = new Image();
    probe.onload = () => { wallEl.style.backgroundImage = `url("${src}")`; };
    probe.src = src; // on error the gradient fallback in CSS stays
  }

  function loadWallpaper() {
    applyWallpaper(store.get(STORE.wall) || WALLPAPER);
  }

  // Downscale so it fits comfortably in localStorage
  function setWallpaperFromFile(f) {
    if (!f || !/^image\//.test(f.type)) return Promise.reject(new Error("that's not an image"));
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(f);
      const im = new Image();
      im.onload = () => {
        const max = 2560;
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let data = c.toDataURL("image/jpeg", 0.85);
        if (!store.set(STORE.wall, data)) {
          data = c.toDataURL("image/jpeg", 0.6); // try smaller before giving up on persisting
          store.set(STORE.wall, data);
        }
        wallEl.style.backgroundImage = `url("${data}")`;
        res(f.name);
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("couldn't read that image")); };
      im.src = url;
    });
  }

  function resetWallpaper() {
    store.del(STORE.wall);
    wallEl.style.backgroundImage = "";
    applyWallpaper(WALLPAPER);
  }

  function pickWallpaper() { wallInput.value = ""; wallInput.click(); }

  wallInput.addEventListener("change", () => {
    const f = wallInput.files[0];
    if (!f) return;
    setWallpaperFromFile(f)
      .then((name) => print(`<div class="blk resp resp--ok">Wallpaper set to <span class="c-img">${esc(name)}</span><span class="sub">saved in this browser · <span class="cmd-link" data-cmd="wallpaper reset">wallpaper reset</span> to undo</span></div>`))
      .catch((e) => print(`<div class="blk resp resp--err">${esc(e.message)}</div>`));
  });

  // drag & drop an image anywhere on the desktop
  const drop = $("drop");
  let dragDepth = 0;
  const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
  window.addEventListener("dragenter", (e) => { if (hasFiles(e)) { dragDepth++; drop.hidden = false; } });
  window.addEventListener("dragleave", () => { if (--dragDepth <= 0) { dragDepth = 0; drop.hidden = true; } });
  window.addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
  window.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault(); dragDepth = 0; drop.hidden = true;
    setWallpaperFromFile(e.dataTransfer.files[0])
      .then((name) => print(`<div class="blk resp resp--ok">Wallpaper set to <span class="c-img">${esc(name)}</span></div>`))
      .catch((err) => print(`<div class="blk resp resp--err">${esc(err.message)}</div>`));
  });

  /* ----------------------------------------------------------
     4. WINDOW — drag by title bar, resize from any edge
     ---------------------------------------------------------- */
  const win = $("win");
  const bar = $("win-bar");
  const MIN_W = 360, MIN_H = 220;
  let maxed = null; // saved rect while zoomed

  const bounds = () => ({
    top: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--menubar-h")) || 26,
    w: window.innerWidth, h: window.innerHeight,
  });

  function setRect(r) {
    Object.assign(win.style, { left: r.x + "px", top: r.y + "px", width: r.w + "px", height: r.h + "px" });
  }
  const getRect = () => ({ x: win.offsetLeft, y: win.offsetTop, w: win.offsetWidth, h: win.offsetHeight });

  function clampRect(r) {
    const b = bounds();
    r.w = Math.max(MIN_W, Math.min(r.w, b.w));
    r.h = Math.max(MIN_H, Math.min(r.h, b.h - b.top));
    r.x = Math.min(Math.max(r.x, 60 - r.w), b.w - 60);  // always keep a grabbable sliver on screen
    r.y = Math.min(Math.max(r.y, b.top), b.h - 40);
    return r;
  }

  function defaultRect() {
    const b = bounds();
    const gap = 130; // leave the typed greeting visible above the window
    // sit between the company icons (left) and the art widget + icon column (right)
    const left = LEFT_RAIL, right = RIGHT_RAIL + 24, room = b.w - left - right;
    const w = Math.max(MIN_W, Math.min(860, room)), h = Math.max(MIN_H, Math.min(580, b.h - b.top - 90 - gap));
    const x = room >= w ? left + Math.round((room - w) / 2) : Math.round((b.w - w) / 2);
    return { x, y: Math.round(b.top + Math.max(gap, (b.h - b.top - 90 - h) / 2)), w, h };
  }

  function initWindow() {
    let r = null;
    try { r = JSON.parse(store.get(STORE.win)); } catch (e) {}
    setRect(clampRect(r && r.w ? r : defaultRect()));
  }
  const saveRect = () => { if (!maxed) store.set(STORE.win, JSON.stringify(getRect())); };

  function startPointer(e, onMove) {
    if (e.button !== 0 || window.innerWidth <= 700) return;
    e.preventDefault();
    const start = { px: e.clientX, py: e.clientY, r: getRect() };
    document.body.classList.add("is-dragging");
    const move = (ev) => onMove(ev.clientX - start.px, ev.clientY - start.py, start.r);
    const up = () => {
      document.body.classList.remove("is-dragging");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveRect();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  bar.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".light")) return;
    startPointer(e, (dx, dy, r) => {
      maxed = null;
      setRect(clampRect({ x: r.x + dx, y: r.y + dy, w: r.w, h: r.h }));
    });
  });
  bar.addEventListener("dblclick", (e) => { if (!e.target.closest(".light")) toggleMax(); });

  win.querySelectorAll(".rz").forEach((h) => {
    const d = h.dataset.dir;
    h.addEventListener("pointerdown", (e) => startPointer(e, (dx, dy, r) => {
      maxed = null;
      const b = bounds();
      let { x, y, w, h: ht } = r;
      if (d.includes("e")) w = Math.max(MIN_W, Math.min(r.w + dx, b.w - r.x));
      if (d.includes("s")) ht = Math.max(MIN_H, Math.min(r.h + dy, b.h - r.y));
      if (d.includes("w")) { const nw = Math.max(MIN_W, r.w - dx); x = r.x + r.w - nw; w = nw; }
      if (d.includes("n")) {
        const ny = Math.max(b.top, Math.min(r.y + dy, r.y + r.h - MIN_H));
        ht = r.h + (r.y - ny); y = ny;
      }
      setRect({ x, y, w, h: ht });
    }));
  });

  function animate(fn) {
    win.classList.add("is-animating");
    fn();
    setTimeout(() => win.classList.remove("is-animating"), 280);
  }

  function toggleMax() {
    const b = bounds();
    animate(() => {
      if (maxed) { setRect(maxed); maxed = null; saveRect(); }
      else { maxed = getRect(); setRect({ x: 0, y: b.top, w: b.w, h: b.h - b.top }); }
    });
  }

  const dockDot = document.querySelector("#dock-term .dock__dot");
  function closeWin() {
    stopAnim();
    win.classList.add("is-hidden");
    dockDot.hidden = true;
  }
  function minWin() { win.classList.add("is-min"); }
  function reopen() {
    const wasClosed = win.classList.contains("is-hidden");
    win.classList.remove("is-hidden", "is-min");
    dockDot.hidden = false;
    if (wasClosed) { setMode("claude"); out.innerHTML = ""; cwd = []; updateCwd(); welcome(); }
    setTimeout(() => input.focus(), 50);
  }

  $("btn-close").addEventListener("click", closeWin);
  $("btn-min").addEventListener("click", minWin);
  $("btn-max").addEventListener("click", toggleMax);
  window.addEventListener("resize", () => { if (!maxed) setRect(clampRect(getRect())); });

  /* menus + dock actions */
  const appleMenu = $("apple-menu"), appleBtn = $("apple-btn"), ctxMenu = $("ctx-menu");
  const hideMenus = () => { appleMenu.hidden = true; ctxMenu.hidden = true; appleBtn.setAttribute("aria-expanded", "false"); };

  appleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = appleMenu.hidden;
    hideMenus();
    appleMenu.hidden = !open;
    appleBtn.setAttribute("aria-expanded", String(open));
  });

  $("desktop").addEventListener("contextmenu", (e) => {
    if (e.target.closest(".win, .menubar, .dock")) return;
    e.preventDefault();
    hideMenus();
    ctxMenu.hidden = false;
    const x = Math.min(e.clientX, window.innerWidth - ctxMenu.offsetWidth - 6);
    const y = Math.min(e.clientY, window.innerHeight - ctxMenu.offsetHeight - 6);
    ctxMenu.style.left = x + "px"; ctxMenu.style.top = y + "px";
  });
  window.addEventListener("click", hideMenus);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") hideMenus(); });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]");
    if (!a) return;
    const act = a.dataset.action;
    hideMenus();
    if (act === "wallpaper") pickWallpaper();
    else if (act === "wallpaper-reset") { resetWallpaper(); print(`<div class="blk resp resp--ok">Wallpaper reset to default</div>`); }
    else if (act === "reopen") reopen();
    else if (act === "about") { reopen(); run("cat ~/about.md"); }
  });

  /* clock */
  function tick() {
    const d = new Date();
    const day = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    $("clock").textContent = `${day}  ${time}`;
  }
  tick(); setInterval(tick, 10000);

  /* ----------------------------------------------------------
     5. TERMINAL
     ---------------------------------------------------------- */
  const term = $("term"), out = $("out"), input = $("input"), promptEl = $("prompt");
  let busy = false;
  let history = [];
  try { history = JSON.parse(store.get(STORE.hist)) || []; } catch (e) {}
  let hIdx = history.length;

  function print(html) {
    out.insertAdjacentHTML("beforeend", html);
    term.scrollTop = term.scrollHeight;
  }

  function updateCwd() {
    const where = fmtPath(cwd);
    $("win-title").textContent = mode === "shell" ? `jasmine — -zsh — ${where}` : `jasmine — claude — ${where}`;
    $("hint-cwd").textContent = where;
    $("prompt-caret").textContent = mode === "shell" ? shellPS() : ">";
  }

  /* tiny markdown → html (headings, lists, bold, code, links, em) */
  function inline(s) {
    // keep raw html tags we wrote ourselves (img/span), escape nothing else is user-supplied
    return s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u}"${u.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`);
  }
  function renderMd(src) {
    const lines = src.split("\n");
    let html = "", inList = false, para = [];
    const flushP = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>`; para = []; } };
    const flushL = () => { if (inList) { html += "</ul>"; inList = false; } };
    lines.forEach((ln) => {
      let m;
      if ((m = ln.match(/^(#{1,3}) (.*)/))) { flushP(); flushL(); html += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; }
      else if ((m = ln.match(/^- (.*)/))) { flushP(); if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(m[1]).replace(/  +/g, (s) => "&nbsp;".repeat(s.length))}</li>`; }
      else if (!ln.trim()) { flushP(); flushL(); }
      else if (/^<(img|span)/.test(ln)) { flushP(); flushL(); html += ln.startsWith("<span") ? `<p>${ln}</p>` : ln; }
      else { flushL(); para.push(ln); }
    });
    flushP(); flushL();
    return `<div class="md">${html}</div>`;
  }

  /* how a single entry name is shown in ls (clickable) */
  function entryHTML(name, n, base) {
    const p = fmtPath(base.concat(name.split("/")));  // absolute, so links work from any cwd
    const arg = p.includes(" ") ? `"${p}"` : p;
    if (n.type === "dir") return `<span class="cmd-link c-dir" data-cmd="cd ${esc(arg)}">${esc(name)}/</span>`;
    if (n.type === "img") return `<span class="cmd-link c-img" data-cmd="open ${esc(arg)}">${esc(name)}</span>`;
    if (n.type === "link") return `<span class="cmd-link c-link" data-cmd="open ${esc(arg)}">${esc(name)}@</span>`;
    return `<span class="cmd-link" data-cmd="cat ${esc(arg)}">${esc(name)}</span>`;
  }

  const ok = (html) => print(`<div class="blk">${html}</div>`);
  const resp = (html, kind) => print(`<div class="blk resp${kind ? " resp--" + kind : ""}">${html}</div>`);
  const err = (msg) => resp(esc(msg), "err");

  function welcome() {
    print(`<div class="welcome">
      <div class="welcome__title"><span class="welcome__star">✻</span><b>Welcome to Jasmine's terminal!</b></div>
      <div class="welcome__grid">
        <img class="welcome__photo" src="assets/jasmine.jpg" alt="Jasmine Yuen" onerror="this.remove()">
        <div class="welcome__meta">
          <div><span class="c-b" style="color:var(--fg)">Jasmine Yuen</span> · software engineer · cs @ georgia tech '28</div>
          <div>ex-<span class="c-acc">ServiceNow</span>, <span class="c-acc">Microsoft</span>, <span class="c-acc">Ford</span> · co-director @ HackGT</div>
          <div><span class="c-dim">/help for help · cwd: ~</span></div>
        </div>
      </div>
    </div>
    <div class="tips"><b>Tips for getting started:</b>
      <ol>
        <li>Look around with <span class="chip" data-cmd="ls">ls</span> <span class="chip" data-cmd="tree">tree</span> <span class="chip" data-cmd="cat about.md">cat about.md</span></li>
        <li>Jump to <span class="chip" data-cmd="cd ~/experience && ls">experience</span> <span class="chip" data-cmd="cd ~/projects && ls">projects</span> <span class="chip" data-cmd="resume">resume</span> <span class="chip" data-cmd="contact">contact</span></li>
        <li>Or just ask — <span class="chip" data-cmd="what did you do at ford?">what did you do at ford?</span> <span class="chip" data-cmd="search typescript">search typescript</span></li>
      </ol>
    </div>`);
  }

  /* ---------- commands ---------- */
  const HELP = [
    ["ls [-l] [dir]", "list files"],
    ["cd <dir>", "change directory (cd .. / cd ~)"],
    ["cat <file>", "print a file"],
    ["open <file|dir>", "view images, follow links"],
    ["tree [dir]", "show everything at once"],
    ["search <words>", "search every file (alias: grep)"],
    ["find <name>", "find files by name"],
    ["resume", "the whole thing on one page"],
    ["contact", "how to reach me"],
    ["wallpaper [reset]", "pick your own desktop background"],
    ["whoami · pwd · history · clear", ""],
  ];

  const COMMANDS = {
    help() {
      resp(`<span class="c-b">Commands</span>${HELP.map(([c, d]) => `<span class="sub"><span style="color:var(--fg)">${esc(c)}</span>${d ? "  <span class='c-dim'>— " + d + "</span>" : ""}</span>`).join("")}
<span class="sub">Anything else is treated as a question — e.g. <span class="chip" data-cmd="what projects have you built?">what projects have you built?</span></span>
<span class="sub">Keys: <span style="color:var(--fg)">tab</span> completes · <span style="color:var(--fg)">↑ ↓</span> history · <span style="color:var(--fg)">ctrl+l</span> clears · drag the title bar, resize from any edge</span>`);
    },

    ls(args) {
      const long = args.some((a) => /^-\w*l/.test(a));
      const showAll = args.some((a) => /^-\w*a/.test(a));
      const target = args.find((a) => !a.startsWith("-"));
      const p = resolve(target);
      const n = nodeAt(p);
      if (!n) return err(`ls: ${target}: No such file or directory`);
      if (n.type !== "dir") return ok(entryHTML(p[p.length - 1], n, p.slice(0, -1)));
      const names = Object.keys(n.children).sort((a, b) => {
        const da = n.children[a].type === "dir", db = n.children[b].type === "dir";
        return da === db ? a.localeCompare(b) : da ? -1 : 1;
      });
      const all = (showAll ? [".", ".."] : []).concat(names);
      if (!long) return ok(`<div class="ls">${all.map((k) => k === "." || k === ".." ? `<span class="c-dir">${k}/</span>` : entryHTML(k, n.children[k], p)).join("")}</div>`);
      const rows = names.map((k) => {
        const c = n.children[k];
        const perm = c.type === "dir" ? "drwxr-xr-x" : c.type === "link" ? "lrwxr-xr-x" : "-rw-r--r--";
        const size = c.type === "dir" ? Object.keys(c.children).length + " items" : c.type === "file" ? c.content.length + " B" : c.type === "img" ? "image" : "→ " + c.url.replace(/^(https?:\/\/|mailto:)/, "");
        return `<span class="c-dim">${perm}</span><span class="c-dim">jasmine</span><span class="c-dim">${esc(size)}</span>${entryHTML(k, c, p)}`;
      });
      ok(`<div class="ls-long">${rows.join("")}</div>`);
    },

    cd(args) {
      const p = resolve(args[0] || "~");
      const n = nodeAt(p);
      if (!n) return err(`cd: no such directory: ${args[0]}`);
      if (n.type !== "dir") return err(`cd: not a directory: ${args[0]}`);
      cwd = canonical(p);
      updateCwd();
    },

    pwd() { ok(fmtPath(cwd).replace(/^~/, "/Users/jasmine")); },

    cat(args) {
      if (!args.length) return err("cat: which file? try `ls`");
      args.forEach((a) => {
        const p = resolve(a), n = nodeAt(p);
        if (!n) return err(`cat: ${a}: No such file or directory`);
        if (n.type === "dir") return err(`cat: ${a}: Is a directory — try \`cd ${a}\` or \`ls ${a}\``);
        if (n.type === "img") return showImages([n.src]);
        if (n.type === "link") return ok(`<a class="c-link" href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.url)}</a>`);
        ok(renderMd(n.content));
        if (p[0] === "experience") focus = experience.find((e) => e.file === p[p.length - 1].toLowerCase()) || focus;
      });
    },

    open(args) {
      const a = args[0] || ".";
      if (/^(https?:|mailto:)/.test(a)) { window.open(a, "_blank", "noopener"); return resp(`Opened ${esc(a)}`, "ok"); }
      const p = resolve(a), n = nodeAt(p);
      if (!n) return err(`open: ${a}: No such file or directory`);
      if (n.type === "link") { window.open(n.url, "_blank", "noopener"); return resp(`Opened <span class="c-link">${esc(n.url)}</span>`, "ok"); }
      if (n.type === "img") return showImages([n.src]);
      if (n.type === "file") return COMMANDS.cat([a]);
      const imgs = Object.values(n.children).filter((c) => c.type === "img").map((c) => c.src);
      if (imgs.length) return showImages(imgs);
      COMMANDS.ls([a]);
    },

    tree(args) {
      const p = resolve(args[0]), n = nodeAt(p);
      if (!n || n.type !== "dir") return err(`tree: ${args[0] || "."}: not a directory`);
      let lines = [`<span class="c-dir">${esc(fmtPath(p))}</span>`], dirs = 0, files = 0;
      (function rec(node, base, prefix) {
        const keys = Object.keys(node.children);
        keys.forEach((k, i) => {
          const last = i === keys.length - 1, c = node.children[k];
          lines.push(`<span class="c-dim">${prefix}${last ? "└── " : "├── "}</span>${entryHTML(k, c, base)}`);
          if (c.type === "dir") { dirs++; rec(c, base.concat(k), prefix + (last ? "    " : "│   ")); } else files++;
        });
      })(n, p, "");
      lines.push(`\n<span class="c-dim">${dirs} directories, ${files} files</span>`);
      ok(lines.join("\n"));
    },

    search(args) {
      const q = args.join(" ").trim();
      if (!q) return err("search: what should I look for? e.g. `search react`");
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
      const hits = [];
      walk(FS, [], (path, n) => {
        if (n.type !== "file") return;
        const text = plain(n.content);
        const lines = text.split(/(?<=[.!?])\s+/).filter((s) => re.test(s) && (re.lastIndex = 0, true));
        if (lines.length || re.test(path.join("/"))) hits.push({ path, lines });
        re.lastIndex = 0;
      });
      if (!hits.length) return resp(`No matches for “${esc(q)}”. <span class="c-dim">Try a broader word, or <span class="cmd-link" data-cmd="tree">tree</span> to see everything.</span>`);
      const hl = (s) => esc(s.trim()).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), (m) => `<mark>${m}</mark>`);
      resp(`Found <span class="c-b">${hits.length}</span> file${hits.length > 1 ? "s" : ""} matching “${esc(q)}”` +
        hits.map((h) => `<span class="sub">${entryHTML(h.path.join("/"), nodeAt(h.path), [])}${h.lines.slice(0, 2).map((l) => `\n  <span class="c-dim">${hl(l.length > 150 ? l.slice(0, 150) + "…" : l)}</span>`).join("")}</span>`).join(""));
    },

    find(args) {
      const q = (args.filter((a) => !a.startsWith("-")).pop() || "").replace(/\*/g, "").toLowerCase();
      const hits = [];
      walk(FS, [], (path, n) => { if (path.length && path[path.length - 1].toLowerCase().includes(q)) hits.push([path, n]); });
      if (!hits.length) return err(`find: nothing named like “${q}”`);
      ok(hits.map(([p, n]) => entryHTML(p.join("/"), n, [])).join("\n"));
    },

    resume() { COMMANDS.cat(["~/resume.md"]); },
    contact() { COMMANDS.cat(["~/contact.md"]); },
    whoami() { ok(`jasmine yuen <span class="c-dim">— software engineer · cs @ georgia tech '28 · atlanta, ga</span>`); },
    echo(args) { ok(esc(args.join(" "))); },
    clear() { out.innerHTML = ""; focus = null; },
    history() { ok(history.map((h, i) => `<span class="c-dim">${String(i + 1).padStart(4)}</span>  <span class="cmd-link" data-cmd="${esc(h)}">${esc(h)}</span>`).join("\n") || "<span class='c-dim'>(empty)</span>"); },

    wallpaper(args) {
      if (args[0] === "reset") { resetWallpaper(); return resp("Wallpaper reset to default", "ok"); }
      resp(`Pick an image to use as your wallpaper.<span class="sub">You can also drag a photo onto the desktop, or right-click the desktop.</span>`);
      pickWallpaper();
    },

    exit() { enterShell(); },
    sudo() { err("jasmine is not in the sudoers file. This incident will be reported."); },
    rm() { err("rm: permission denied (nice try)"); },
    vim() { err("you'd never get out. try `cat` instead"); },
  };
  COMMANDS.grep = COMMANDS.search;
  COMMANDS.dir = COMMANDS.ls;
  COMMANDS.ll = (a) => COMMANDS.ls(["-l"].concat(a));
  COMMANDS.less = COMMANDS.more = COMMANDS.cat;
  COMMANDS.emacs = COMMANDS.nano = COMMANDS.vim;

  // fix casing of a resolved path to match real keys
  function canonical(parts) {
    let n = FS, outp = [];
    for (const seg of parts) {
      const key = n.children[seg] ? seg : Object.keys(n.children).find((k) => k.toLowerCase() === seg.toLowerCase());
      outp.push(key); n = n.children[key];
    }
    return outp;
  }

  function showImages(srcs) {
    if (srcs.length === 1) return ok(`<img class="t-img" src="${esc(srcs[0])}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'c-dim',textContent:'(image not uploaded yet)'}))">`);
    ok(`<div class="gallery">${srcs.map((s) => `<img src="${esc(s)}" alt="" onerror="this.remove()">`).join("")}</div>`);
  }

  /* ---------- "ask" — natural language over the filesystem ---------- */
  // keywords → where the answer lives. Checked in order; first strong match wins.
  const TOPICS = [
    { keys: ["servicenow", "now assist", "fluent"], path: "experience/servicenow.md" },
    { keys: ["microsoft", "copilot", "product fellow"], path: "experience/microsoft.md" },
    { keys: ["ford", "gcp", "cost calculator"], path: "experience/ford.md" },
    { keys: ["hackgt", "hackathon", "mlh"], path: "experience/hackgt.md" },
    { keys: ["hytech", "racing", "formula", "fsae"], path: "experience/hytech-racing.md" },
    { keys: ["schematic", "schema", "api diff"], path: "projects/schematic.md" },
    { keys: ["securehub", "security app", "awareness"], path: "projects/securehub.md" },
    { keys: ["wandersync", "android", "travel", "itinerary"], path: "projects/wandersync.md" },
    { keys: ["keyboard", "switch", "keycap", "mechanical"], path: "play/keyboards/README.md", then: "open ~/play/keyboards" },
    { keys: ["art", "sketch", "draw", "blender", "3d"], path: "play/art/README.md", then: "open ~/play/art" },
    { keys: ["hobb", "fun", "free time", "hike", "hiking", "boulder", "music", "read", "travel"], path: "play/more.md" },
    { keys: ["resume", "cv", "everything", "summary"], path: "resume.md" },
    { keys: ["school", "college", "university", "georgia tech", "gt ", "gpa", "degree", "major", "class", "course", "educat", "study", "graduat"], path: "education/georgia-tech.md" },
    { keys: ["skill", "language", "stack", "tech", "know", "tools"], path: "skills.md" },
    { keys: ["contact", "email", "reach", "hire", "linkedin", "github", "talk", "connect"], path: "contact.md" },
    { keys: ["project", "built", "build", "side project", "portfolio"], dir: "projects" },
    { keys: ["work", "intern", "job", "experience", "employ", "company", "companies"], dir: "experience" },
    { keys: ["who", "about", "yourself", "you", "jasmine", "introduce"], path: "about.md" },
  ];

  const VERBS = ["Pondering", "Rummaging", "Grepping", "Sifting", "Recalling", "Noodling", "Clauding", "Reticulating"];

  function ask(q) {
    const lq = " " + q.toLowerCase() + " ";
    const topic = TOPICS.find((t) => t.keys.some((k) => lq.includes(k)));
    // naming a company focuses the conversation on it; broad questions ("what project?")
    // then stay about that company instead of jumping to the general list
    const co = topic && topic.path && experience.find((e) => "experience/" + e.file === topic.path);
    if (co) focus = co;
    const aboutFocus = co || (focus && (!topic || isGeneric(topic, lq)));
    busy = true; promptEl.classList.add("is-busy");
    const id = "spin" + Date.now();
    const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
    print(`<div class="blk spin" id="${id}"><span class="glyph">✻</span> <span class="verb">${verb}…</span></div>`);
    const frames = ["·", "✢", "✳", "✶", "✻", "✽"];
    let f = 0;
    const el = $(id);
    const iv = setInterval(() => { el.querySelector(".glyph").textContent = frames[f++ % frames.length]; }, 120);
    setTimeout(() => {
      clearInterval(iv); el.remove();
      busy = false; promptEl.classList.remove("is-busy");
      if (aboutFocus) answerCompany(q, focus); else answer(q, topic);
      input.focus();
    }, 650 + Math.random() * 500);
  }

  function answer(q, topic) {
    if (!topic) {
      // fall back to full-text search on the meaningful words
      const words = q.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ").split(/\s+/)
        .filter((w) => w.length > 2 && !STOP.has(w));
      const scored = [];
      walk(FS, [], (path, n) => {
        if (n.type !== "file") return;
        const t = plain(n.content).toLowerCase();
        const s = words.reduce((acc, w) => acc + (t.split(w).length - 1), 0);
        if (s) scored.push({ path, s });
      });
      scored.sort((a, b) => b.s - a.s);
      if (!scored.length) {
        return resp(`I don't have anything on that in here. Here's what I can tell you about:
${["about.md", "experience", "projects", "education", "play", "contact.md"].map((p) => `<span class="sub">${entryHTML(p, nodeAt([p]), [])}</span>`).join("")}`, "ai");
      }
      return resp(`Closest matches for that:` + scored.slice(0, 4).map((h) => `<span class="sub">${entryHTML(h.path.join("/"), nodeAt(h.path), [])}</span>`).join(""), "ai");
    }

    if (topic.dir) {
      const d = nodeAt([topic.dir]);
      const items = Object.keys(d.children).map((k) => {
        const first = d.children[k].content.split("\n");
        const title = first[0].replace(/^# /, "");
        const sub = (first.find((l) => /^\*\*/.test(l)) || first.find((l) => /tagline/.test(l)) || "").replace(/<[^>]+>|\*\*/g, "");
        return `<span class="sub">${entryHTML(k, d.children[k], [topic.dir])} <span class="c-dim">— ${esc(title)}${sub ? " · " + esc(sub) : ""}</span></span>`;
      });
      return resp(`Here's ${topic.dir === "experience" ? "where I've worked" : "what I've built"}:${items.join("")}<span class="sub">Click one to read more, or <span class="cmd-link" data-cmd="cd ~/${topic.dir}">cd ${topic.dir}</span>.</span>`, "ai");
    }

    const p = topic.path.split("/");
    resp(`<span class="c-dim">Read(</span>${entryHTML(topic.path, nodeAt(p), [])}<span class="c-dim">)</span>`, "ok");
    print(`<div class="blk">${renderMd(nodeAt(p).content)}</div>`);
    if (topic.then) run(topic.then, true);
  }
  let focus = null; // the company the conversation is currently about
  // plural / "personal" / "side" project questions mean my own projects, not the focused company
  const isGeneric = (t, lq) => (t.dir === "projects" ? !/projects|personal|side/.test(lq) : !!t.dir)
    || t.path === "about.md" || t.path === "skills.md";

  function answerCompany(q, e) {
    const lq = q.toLowerCase();
    const sub = (html) => `<span class="sub">${html}</span>`;
    let html;
    if (/favou?rite|learn|challeng|hard|team|culture|enjoy|like/.test(lq)) {
      html = `That's not in my notes for <span class="c-acc">${esc(e.co)}</span> yet. I'd love to tell you in person, so ${`<span class="cmd-link" data-cmd="contact">reach out</span>`}!`;
    } else if (/when|how long|date|year|month|duration|start|end/.test(lq)) {
      html = `I was at <span class="c-acc">${esc(e.co)}</span> as a ${esc(e.role)}: ${esc(e.date)}.`;
    } else if (/role|title|position/.test(lq)) {
      html = `At <span class="c-acc">${esc(e.co)}</span> I was a <span class="c-b">${esc(e.role)}</span> <span class="c-dim">(${esc(e.date)})</span>.`;
    } else if (/tech|stack|language|tool|framework|use|skill/.test(lq)) {
      html = `At <span class="c-acc">${esc(e.co)}</span> I worked with:` + sub(e.tags.map((t) => `<span class="c-acc">${esc(t)}</span>`).join("  "));
    } else if (/impact|result|sav|achiev|metric|number|outcome|accomplish/.test(lq)) {
      const wins = e.points.filter((p) => /\d/.test(p));
      html = `The impact at <span class="c-acc">${esc(e.co)}</span>:` + (wins.length ? wins : e.points).map((p) => sub(esc(p))).join("");
    } else {
      html = `Here's what I worked on at <span class="c-acc">${esc(e.co)}</span> as a ${esc(e.role)}:` + e.points.map((p) => sub(esc(p))).join("");
    }
    const follow = ["what tech did you use?", "what was the impact?", "how long were you there?"]
      .map((x) => `<span class="chip" data-cmd="${x}">${x}</span>`).join("");
    resp(html + sub(`<span class="c-dim">more about ${esc(e.co)}:</span> ${follow}`), "ai");
  }

  const STOP = new Set("the and for are you your what where when how did does have has with that this was were who about can tell more any some from into out our its it's like just i'm i've".split(" "));

  function lightbox(src) {
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<img src="${esc(src)}" alt="">`;
    lb.addEventListener("click", () => lb.remove());
    document.body.appendChild(lb);
  }

  /* ---------- run a line ---------- */
  function tokenize(line) {
    const toks = []; let m; const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    while ((m = re.exec(line))) toks.push(m[1] ?? m[2] ?? m[3]);
    return toks;
  }

  function run(line, silent) {
    line = line.trim();
    if (mode === "shell") return runShell(line);
    if (!line) return;
    if (!silent) {
      print(`<div class="blk blk--cmd"><b>${esc(line)}</b></div>`);
      if (history[history.length - 1] !== line) history.push(line);
      history = history.slice(-100);
      store.set(STORE.hist, JSON.stringify(history));
      hIdx = history.length;
    }
    // support "cd x && ls"
    const parts = line.split(/\s*&&\s*/);
    if (parts.length > 1) return parts.forEach((p) => run(p, true));

    const toks = tokenize(line.replace(/^\//, "")); // "/help" works like "help"
    const cmd = (toks[0] || "").toLowerCase();
    if (line === "?") return COMMANDS.help();
    if (COMMANDS[cmd] && (toks.length === 1 || !/\?$/.test(line) || cmd === "echo")) return COMMANDS[cmd](toks.slice(1));
    // `cd`-able bare names: typing "projects" goes there
    const bare = nodeAt(resolve(line));
    if (toks.length === 1 && bare) return bare.type === "dir" ? (COMMANDS.cd([line]), COMMANDS.ls([])) : COMMANDS.open([line]);
    ask(line);
  }

  /* ---------- tab completion ---------- */
  function complete() {
    const v = input.value;
    const toks = v.split(/\s+/);
    if (toks.length <= 1) {
      const names = mode === "shell" ? Object.keys(SHELL).concat(Object.keys(ANIMS)) : Object.keys(COMMANDS);
      const opts = names.filter((c) => c.startsWith(toks[0].toLowerCase()));
      if (opts.length === 1) input.value = opts[0] + " ";
      else if (opts.length > 1) ok(`<span class="c-dim">${opts.join("  ")}</span>`);
      return;
    }
    const last = toks[toks.length - 1];
    const slash = last.lastIndexOf("/");
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
    const stem = last.slice(slash + 1).toLowerCase();
    const n = nodeAt(resolve(dirPart || "."));
    if (!n || n.type !== "dir") return;
    const opts = Object.keys(n.children).filter((k) => k.toLowerCase().startsWith(stem));
    if (opts.length === 1) {
      const c = n.children[opts[0]];
      toks[toks.length - 1] = dirPart + opts[0] + (c.type === "dir" ? "/" : "");
      input.value = toks.join(" ");
    } else if (opts.length > 1) {
      ok(`<div class="ls">${opts.map((k) => entryHTML(k, n.children[k], resolve(dirPart || "."))).join("")}</div>`);
      // fill the common prefix
      let pre = opts[0];
      opts.forEach((o) => { while (!o.toLowerCase().startsWith(pre.toLowerCase())) pre = pre.slice(0, -1); });
      toks[toks.length - 1] = dirPart + pre;
      input.value = toks.join(" ");
    }
  }

  input.addEventListener("keydown", (e) => {
    if (anim) { e.preventDefault(); stopAnim(true); return; }
    if (busy) { e.preventDefault(); return; }
    if (e.key === "Enter") { const v = input.value; input.value = ""; run(v); }
    else if (e.key === "c" && e.ctrlKey && mode === "shell") { e.preventDefault(); shellEcho(input.value + "^C"); input.value = ""; }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hIdx > 0) input.value = history[--hIdx]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); COMMANDS.clear(); }
    else if (e.key === "?" && !input.value) { e.preventDefault(); run("?"); }
  });

  // click anything with data-cmd to run it
  term.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cmd]");
    if (t) { if (!busy) run(t.dataset.cmd); input.focus(); return; }
    const im = e.target.closest(".t-img, .gallery img");
    if (im) return lightbox(im.getAttribute("src"));
    // focus the prompt on click, unless the user is selecting text or following a link
    if (!window.getSelection().toString() && !e.target.closest("a")) input.focus();
  });

  /* ----------------------------------------------------------
     5b. MAIN TERMINAL — the plain shell under claude (`exit`)
         with ASCII toys from animations.js
     ---------------------------------------------------------- */
  let mode = "claude"; // "claude" | "shell"
  let anim = null;
  let claudeStarted = Date.now();
  const ANIMS = window.ANIMATIONS || {};

  const shellPS = () => `jasmine@macbook ${cwd.length ? cwd[cwd.length - 1] : "~"} %`;
  const shellEcho = (line) => print(`<div class="sh-line"><span class="sh-ps">${esc(shellPS())}</span> ${esc(line)}</div>`);
  const shellOut = (html) => print(`<div class="sh-out">${html}</div>`);

  function setMode(m) {
    stopAnim();
    mode = m;
    term.classList.toggle("is-shell", m === "shell");
    input.placeholder = m === "shell" ? "" : 'Try "ls", "cat about.md", or ask "where have you interned?"';
    updateCwd();
  }

  function enterShell() {
    const secs = Math.round((Date.now() - claudeStarted) / 1000);
    const dur = secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
    print(`<div class="blk c-dim">Total cost:            $0.00 (it's a static site)
Total duration (wall): ${dur}
Total code changes:    0 lines added, 0 lines removed</div>`);
    setMode("shell");
    const d = new Date();
    shellOut(`<span class="c-dim">Last login: ${d.toDateString().slice(0, 10)} ${d.toTimeString().slice(0, 8)} on ttys001</span>
type <span class="c-acc">help</span> to see what's in here.`);
  }

  function enterClaude(quiet) {
    setMode("claude");
    claudeStarted = Date.now();
    if (quiet) return;
    welcome();
  }

  // monospace cell size for the animation font, used to size animations to the window
  function termSize() {
    const probe = document.createElement("pre");
    probe.className = "anim";
    probe.style.cssText = "position:absolute;visibility:hidden";
    probe.textContent = "x".repeat(50);
    term.appendChild(probe);
    const cw = probe.getBoundingClientRect().width / 50, ch = probe.getBoundingClientRect().height;
    probe.remove();
    return {
      cols: Math.max(30, Math.min(110, Math.floor((term.clientWidth - 34) / cw))),
      rows: Math.max(10, Math.min(26, Math.floor((term.clientHeight - 60) / ch))),
    };
  }

  function playAnim(name, args) {
    const A = ANIMS[name];
    const { cols, rows } = termSize();
    if (A.static) return shellOut(`<pre class="anim">${A.static(args, cols)}</pre>`);
    const pre = document.createElement("pre");
    pre.className = "anim";
    out.appendChild(pre);
    print(`<div class="sh-out c-dim anim-hint">press any key to stop</div>`);
    const hint = out.lastElementChild;
    const state = A.init(cols, rows, args);
    const t0 = performance.now();
    let n = 0;
    promptEl.classList.add("is-running");
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const html = A.frame(state, n++, t);
      if (html === null || (A.duration && t > A.duration)) return stopAnim();
      pre.innerHTML = html;
      term.scrollTop = term.scrollHeight;
    };
    anim = { iv: setInterval(tick, 1000 / (A.fps || 20)), hint };
    tick();
  }

  function stopAnim(interrupted) {
    if (!anim) return;
    clearInterval(anim.iv);
    anim.hint.textContent = interrupted ? "^C" : "";
    anim = null;
    promptEl.classList.remove("is-running");
    input.focus();
  }

  // plain-shell commands; the toys come from ANIMATIONS
  const SHELL = {
    help() {
      const toys = Object.keys(ANIMS).filter((k) => !ANIMS[k].static);
      const fun = Object.keys(ANIMS).filter((k) => ANIMS[k].static);
      shellOut(`<span class="c-b">animations</span>  ${toys.map((k) => `<span class="cmd-link c-acc" data-cmd="${k}">${k}</span>`).join("  ")}
<span class="c-b">fun</span>         ${fun.map((k) => `<span class="cmd-link c-acc" data-cmd="${k}">${k}</span>`).join("  ")}  <span class="c-dim">(cowsay &lt;text&gt;, keyboard &lt;text&gt;)</span>
<span class="c-b">files</span>       ls  cd  cat  tree  pwd  open
<span class="c-b">other</span>       clear  whoami  date  echo  history
            <span class="cmd-link c-acc" data-cmd="claude">claude</span> <span class="c-dim">— back to claude</span>   <span class="c-acc">exit</span> <span class="c-dim">— close the window</span>
<span class="c-dim">press any key to stop an animation</span>`);
    },
    claude() { enterClaude(false); },
    exit() {
      shellOut(`<span class="c-dim">[Process completed]</span>`);
      setTimeout(closeWin, 700);
    },
    date() { shellOut(esc(new Date().toString().replace(/ GMT.*/, ""))); },
    whoami() { shellOut("jasmine"); },
    echo(a) { shellOut(esc(a.join(" "))); },
    clear() { out.innerHTML = ""; },
    sudo() { shellOut("jasmine is not in the sudoers file. This incident will be reported."); },
  };
  // reuse claude's file commands; they print fine in either mode
  ["ls", "ll", "cd", "cat", "tree", "pwd", "open", "history", "find", "grep"].forEach((k) => { SHELL[k] = COMMANDS[k]; });

  function runShell(line) {
    stopAnim(true); // e.g. clicking a link while something is playing
    shellEcho(line);
    if (!line) return;
    if (history[history.length - 1] !== line) history.push(line);
    hIdx = history.length;
    const toks = tokenize(line);
    const cmd = (toks[0] || "").toLowerCase(), args = toks.slice(1);
    if (ANIMS[cmd]) return playAnim(cmd, args);
    if (SHELL[cmd]) return SHELL[cmd](args);
    shellOut(`zsh: command not found: ${esc(toks[0])}  <span class="c-dim">(try <span class="cmd-link" data-cmd="help">help</span>)</span>`);
  }

  /* ----------------------------------------------------------
     6. DESKTOP — typed greeting + clickable icons
     ---------------------------------------------------------- */
  const GREETINGS = [
    "welcome, i'm jasmine.",
    "cs @ georgia tech '28",
    "incoming swe @ servicenow",
    "security · systems · ui",
    "i build keyboards, too.",
  ];

  function greet() {
    const el = $("greet-text"), wrap = el.parentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = GREETINGS[0]; return; }
    let i = 0;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async function loop() {
      for (;;) {
        const line = GREETINGS[i++ % GREETINGS.length];
        wrap.classList.add("is-typing");
        for (let n = 1; n <= line.length; n++) { el.textContent = line.slice(0, n); await wait(55 + Math.random() * 45); }
        wrap.classList.remove("is-typing");
        await wait(1800);
        wrap.classList.add("is-typing");
        for (let n = line.length - 1; n >= 0; n--) { el.textContent = line.slice(0, n); await wait(18); }
        wrap.classList.remove("is-typing");
        await wait(450);
      }
    })();
  }

  const svgDoc = (label) => `<svg viewBox="0 0 48 58" width="44" height="54" aria-hidden="true">
    <path d="M4 2h28l12 12v40a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fbfaf7"/>
    <path d="M32 2v10a2 2 0 0 0 2 2h10z" fill="#d9d6cf"/>
    <g fill="#c7c3ba"><rect x="9" y="22" width="26" height="2.4" rx="1"/><rect x="9" y="28" width="30" height="2.4" rx="1"/><rect x="9" y="34" width="22" height="2.4" rx="1"/></g>
    <text x="24" y="50" text-anchor="middle" font-family="-apple-system, Helvetica, sans-serif" font-size="8.5" font-weight="700" fill="#d97757">${label}</text>
  </svg>`;
  const svgFolder = `<svg viewBox="0 0 64 50" width="58" height="46" aria-hidden="true">
    <path d="M2 7a4 4 0 0 1 4-4h17l5 5h30a4 4 0 0 1 4 4v3H2z" fill="#5aa8e8"/>
    <path d="M2 13h60v31a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="#7cc0f5"/>
    <path d="M2 13h60v2H2z" fill="#a9d6fa"/>
  </svg>`;

  // each icon runs a terminal command when opened
  const ICONS = [
    { id: "resume", label: "resume.md", art: svgDoc("MD"), cmd: "cat ~/resume.md" },
    { id: "about", label: "about.md", art: svgDoc("MD"), cmd: "cat ~/about.md" },
    { id: "experience", label: "experience", art: svgFolder, cmd: "cd ~/experience && ls" },
    { id: "projects", label: "projects", art: svgFolder, cmd: "cd ~/projects && ls" },
    { id: "play", label: "play", art: svgFolder, cmd: "cd ~/play && tree" },
    { id: "photo", label: "photo.jpg", art: `<img class="dicon__thumb" src="assets/jasmine.jpg" alt="" draggable="false">`, cmd: "open ~/photo.jpg" },
    { id: "contact", label: "contact.md", art: svgDoc("MD"), cmd: "contact" },
    // companies, staggered down the left side
    ...experience.map((e) => ({
      id: "co-" + e.file.replace(".md", ""), side: "left", label: e.co,
      art: `<span class="dicon__app"><img src="${e.logo}" alt="" draggable="false" onerror="this.replaceWith('${e.co.slice(0, 2)}')"></span>`,
      cmd: "cat ~/experience/" + e.file,
      after: () => {
        resp(`Ask questions to learn more about my experience at <span class="c-acc">${esc(e.co)}</span>.`, "ai");
        input.placeholder = `e.g. "what did you build at ${e.co}?"`;
      },
    })),
  ];
  const ICON_W = 88, ICON_H = 98;

  // art board widget. Set `src` (e.g. "assets/art/07.jpg") to replace a placeholder;
  // `h` is only the placeholder's height, real images keep their own aspect ratio.
  const ARTWORK = [
    { src: "", title: "untitled 01", h: 180, color: "#e8c9b5" },
    { src: "", title: "untitled 02", h: 120, color: "#c9d6e3" },
    { src: "", title: "untitled 03", h: 150, color: "#d8d2c4" },
    { src: "", title: "untitled 04", h: 210, color: "#cfdccb" },
    { src: "", title: "untitled 05", h: 130, color: "#e3cfd8" },
    { src: "", title: "untitled 06", h: 170, color: "#d6cde6" },
    { src: "", title: "untitled 07", h: 110, color: "#ecdcc0" },
    { src: "", title: "untitled 08", h: 190, color: "#c4d9da" },
    { src: "", title: "untitled 09", h: 140, color: "#e6d3c3" },
    { src: "", title: "untitled 10", h: 160, color: "#d3d9c2" },
  ];

  function initArtWidget() {
    const grid = $("art-grid");
    $("art-count").textContent = ARTWORK.length + " pins";
    grid.innerHTML = `<div class="widget__cols">` + ARTWORK.map((a, i) => `
      <figure class="pin" data-i="${i}">
        ${a.src
          ? `<img class="pin__media" src="${esc(a.src)}" alt="${esc(a.title)}" loading="lazy" draggable="false">`
          : `<span class="pin__media pin__ph" style="height:${a.h}px;background-color:${a.color}">${String(i + 1).padStart(2, "0")}</span>`}
        <figcaption class="pin__cap">${esc(a.title)}</figcaption>
      </figure>`).join("") + `</div>`;
    grid.addEventListener("click", (e) => {
      const pin = e.target.closest(".pin");
      const a = pin && ARTWORK[pin.dataset.i];
      if (a && a.src) lightbox(a.src);
    });
  }

  function openIcon(ic) {
    reopen();
    if (mode === "shell") enterClaude(true);
    run(ic.cmd);
    if (ic.after) ic.after();
  }

  function initIcons() {
    const box = $("icons");
    let saved = {};
    try { saved = JSON.parse(store.get(STORE.icons)) || {}; } catch (e) {}

    // defaults: right icons in a column that wraps leftward like Finder;
    // left (company) icons zig-zag down below the greeting
    const place = () => {
      const b = bounds();
      const rows = Math.max(1, Math.floor((b.h - b.top - 110) / ICON_H));
      const lefts = ICONS.filter((ic) => ic.side === "left").length;
      const leftTop = b.top + 150;
      const step = Math.max(70, Math.min(100, (b.h - leftTop - 100) / lefts));
      let ri = 0, li = 0;
      ICONS.forEach((ic) => {
        const node = box.querySelector(`[data-id="${ic.id}"]`);
        // saved positions are kept relative to the icon's own edge so they survive resizes
        const s = saved[ic.id];
        let x, y;
        if (ic.side === "left") {
          const i = li++;
          x = s ? s.lx : 28 + (i % 2 ? 76 : 0);
          y = s ? s.y : leftTop + step * i;
        } else {
          const i = ri++;
          x = b.w - (s ? s.rx : RIGHT_RAIL - 88 + ICON_W * (Math.floor(i / rows) + 1));
          y = s ? s.y : b.top + 14 + ICON_H * (i % rows);
        }
        node.style.left = Math.min(Math.max(x, 0), b.w - ICON_W) + "px";
        node.style.top = Math.min(Math.max(y, b.top), b.h - ICON_H) + "px";
      });
    };

    ICONS.forEach((ic) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = "dicon";
      node.dataset.id = ic.id;
      node.setAttribute("aria-label", "Open " + ic.label);
      node.innerHTML = `<span class="dicon__art">${ic.art}</span><span class="dicon__label">${esc(ic.label)}</span>`;

      // click opens; drag moves it around the desktop
      node.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        box.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
        node.classList.add("is-selected");
        const sx = e.clientX, sy = e.clientY, ox = node.offsetLeft, oy = node.offsetTop;
        let moved = false;
        const move = (ev) => {
          const dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (!moved && Math.hypot(dx, dy) < 5) return;
          moved = true;
          node.classList.add("is-dragging");
          node.style.left = ox + dx + "px";
          node.style.top = oy + dy + "px";
        };
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          node.classList.remove("is-dragging");
          if (!moved) return openIcon(ic);
          saved[ic.id] = ic.side === "left"
            ? { lx: node.offsetLeft, y: node.offsetTop }
            : { rx: window.innerWidth - node.offsetLeft, y: node.offsetTop };
          store.set(STORE.icons, JSON.stringify(saved));
          place();
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      });
      node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openIcon(ic); } });
      box.appendChild(node);
    });

    place();
    window.addEventListener("resize", place);
    // clicking empty desktop clears the selection
    $("desktop").addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".dicon")) box.querySelectorAll(".is-selected").forEach((n) => n.classList.remove("is-selected"));
    });
  }

  /* ----------------------------------------------------------
     7. BOOT
     ---------------------------------------------------------- */
  loadWallpaper();
  initIcons();
  initArtWidget();
  greet();
  initWindow();
  updateCwd();
  welcome();
  input.focus();
})();
