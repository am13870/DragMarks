(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function keep(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function ordinal(n) {
    if (n > 3 && n < 21) return n + "th";
    return n + ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th");
  }

  const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  function longDate(d) {
    return MONTHS[d.getMonth()] + " " + ordinal(d.getDate()) + ", " + d.getFullYear();
  }

  const today = new Date();
  const todayKey = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  function seeded(seedText) {
    let h = 1779033703 ^ seedText.length;
    for (let i = 0; i < seedText.length; i++) {
      h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  const state = {
    chair: null,
    move: null,
    trace: [],
    dragged: false
  };

  const facing = {};
  CHAIRS.forEach((c) => { facing[c.id] = Math.random() < 0.5 ? "a" : "b"; });
  const chairSrc = (c) => "img/chairs/" + c.slug + "-" + facing[c.id] + ".png";

  const chairImg = {};
  let chairsReady = 0;
  CHAIRS.forEach((c) => {
    const im = new Image();
    im.src = chairSrc(c);
    im.onload = () => { chairsReady++; };
    chairImg[c.id] = im;
  });

  const gravelImg = new Image();
  gravelImg.src = "img/gravel.jpg";

  (function drift() {
    const cv = $("drift");
    const ctx = cv.getContext("2d");

    function angleTo(from, to) {
      let d = (to - from) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return d;
    }
    const TRAIL_MS = 11000;
    const SIZE = 36;
    const CHAIR_FADE = 0.55;
    let w = 0, h = 0;

    const COLS = 4;
    const movers = CHAIRS.map((c, i) => ({
      chair: c,
      x: ((i % COLS) + 0.25 + Math.random() * 0.5) / COLS,
      y: (Math.floor(i / COLS) + 0.3 + Math.random() * 0.4) / 2,
      heading: (Math.PI * 2 * i) / CHAIRS.length + Math.random(),
      speed: 7 + Math.random() * 9,
      curl: (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.2),
      nextTurn: 3000 + Math.random() * 5000,
      turnedAt: 0,
      dots: []
    }));

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    let last = performance.now();
    let dotAt = 0;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!$("s-pick").classList.contains("is-on")) {
        if (cv.style.display !== "none") {
          ctx.clearRect(0, 0, w, h);
          cv.style.display = "none";
          movers.forEach((m) => { m.dots.length = 0; });
        }
        requestAnimationFrame(frame);
        return;
      }
      if (cv.style.display === "none") cv.style.display = "block";

      ctx.clearRect(0, 0, w, h);

      const laying = now - dotAt > 260;
      if (laying) dotAt = now;

      const SEP = SIZE * 1.9;
      for (let i = 0; i < movers.length; i++) {
        for (let j = i + 1; j < movers.length; j++) {
          const a = movers[i], b = movers[j];
          const dx = (b.x - a.x) * w, dy = (b.y - a.y) * h;
          const dist = Math.hypot(dx, dy);
          if (dist > SEP || dist < 0.001) continue;
          const away = Math.atan2(dy, dx);
          const push = (1 - dist / SEP) * 1.6 * dt;
          a.heading += angleTo(a.heading, away + Math.PI) * push;
          b.heading += angleTo(b.heading, away) * push;
        }
      }

      movers.forEach((m) => {
        let px = m.x * w, py = m.y * h;

        if (now - m.turnedAt > m.nextTurn) {
          m.curl *= -1;
          m.turnedAt = now;
          m.nextTurn = 3000 + Math.random() * 5000;
        }
        m.heading += m.curl * dt;

        const pad = SIZE * 1.4;
        if (px < pad || px > w - pad || py < pad || py > h - pad) {
          const home = Math.atan2(h / 2 - py, w / 2 - px);
          m.heading += angleTo(m.heading, home) * 2.2 * dt;
        }

        px += Math.cos(m.heading) * m.speed * dt;
        py += Math.sin(m.heading) * m.speed * dt;

        const hard = SIZE * 0.5;
        px = Math.min(Math.max(px, hard), w - hard);
        py = Math.min(Math.max(py, hard), h - hard);

        m.x = px / w;
        m.y = py / h;

        if (laying) m.dots.push({ x: px, y: py, t: now });
        while (m.dots.length && now - m.dots[0].t > TRAIL_MS) m.dots.shift();

        m.dots.forEach((d) => {
          const age = (now - d.t) / TRAIL_MS;
          ctx.globalAlpha = (1 - age) * 0.4;
          ctx.fillStyle = "#8C877E";
          ctx.beginPath();
          ctx.arc(d.x, d.y, 1.9, 0, Math.PI * 2);
          ctx.fill();
        });

        const im = chairImg[m.chair.id];
        if (im && im.complete && im.naturalWidth) {
          ctx.globalAlpha = CHAIR_FADE;
          const sc = SIZE / Math.max(im.naturalWidth, im.naturalHeight);
          ctx.drawImage(im, px - (im.naturalWidth * sc) / 2,
            py - (im.naturalHeight * sc) / 2,
            im.naturalWidth * sc, im.naturalHeight * sc);
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    if (!calm) requestAnimationFrame(frame);
  })();

  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("is-on"));
    $(id).classList.add("is-on");
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  }

  document.querySelectorAll("[data-goto]").forEach((b) => {
    b.addEventListener("click", () => show(b.dataset.goto));
  });

  $("wordmark").textContent = COPY.title;
  $("pickSite").textContent = COPY.subtitle;
  $("pickTitle").textContent = COPY.pickTitle;
  $("pickHelp").textContent = COPY.pickHelp;
  $("moveHelp").textContent = COPY.moveHelp;
  $("backToChairs").textContent = COPY.backToChairs;
  $("stillTitle").textContent = COPY.stillTitle;
  $("stillAgain").textContent = COPY.stillButton;
  $("stillBack").textContent = COPY.stillBack;
  $("collSaidH").textContent = COPY.collSaid;
  $("collSawH").textContent = COPY.collSaw;
  $("collEmpty").textContent = COPY.collEmpty;
  $("giveTitle").textContent = COPY.giveTitle;
  $("giveHelp").textContent = COPY.giveHelp;
  $("tabText").textContent = COPY.giveTextTab;
  $("tabPhoto").textContent = COPY.givePhotoTab;
  $("noteInput").placeholder = COPY.givePlaceholder;
  $("photoPrompt").textContent = COPY.givePhotoPrompt;
  $("giveSubmit").textContent = COPY.giveSubmit;
  $("giveSkip").textContent = COPY.giveSkip;
  $("toMap").textContent = COPY.seeMap;
  $("mapChairH").textContent = COPY.mapChair;
  $("mapChairDate").textContent = longDate(today);
  $("mapTodayH").textContent = COPY.mapToday;
  $("mapTodayDate").textContent = longDate(today);
  $("mapAllHelp").textContent = COPY.mapAllHelp;
  $("mapHelp").textContent = COPY.mapHelp;
  $("mapReset").textContent = COPY.mapReset;
  $("mapPastH").textContent = COPY.mapPast;
  $("mapRaked").textContent = COPY.mapRaked;
  $("again").textContent = COPY.startOver;
  $("aboutBtn").textContent = COPY.aboutLink;
  $("aboutText").textContent = COPY.about;
  $("privacyText").textContent = COPY.privacy;
  $("creditText").textContent = COPY.credit;

  $("aboutBtn").addEventListener("click", () => {
    const p = $("aboutPanel");
    p.hidden = !p.hidden;
    $("aboutBtn").setAttribute("aria-expanded", String(!p.hidden));
  });

  (function buildPicker() {
    const grid = $("chairGrid");
    CHAIRS.forEach((c) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = "chair-pick";
      b.style.setProperty("--chair", c.color);
      b.innerHTML =
        '<img src="' + chairSrc(c) + '" alt="" loading="lazy">' +
        "<span>" + COPY.pickChairLabel + " " + c.id + "</span>";
      b.addEventListener("click", () => pickChair(c));
      b.addEventListener("pointerenter", () => { b.style.borderColor = c.color; });
      b.addEventListener("pointerleave", () => { b.style.borderColor = ""; });
      li.appendChild(b);
      grid.appendChild(li);
    });
  })();

  function pickChair(c) {
    state.chair = c;
    document.documentElement.style.setProperty("--chair", c.color);

    $("moveGreet").textContent = c.voice.greet;
    $("moveGreet").style.setProperty("--chair", c.color);
    $("moveAsk").textContent = c.voice.ask;
    $("stillChair").src = chairSrc(c);
    $("stillLine").textContent = c.voice.still;
    $("stillLine").style.setProperty("--chair", c.color);

    buildMoves();
    show("s-move");
  }

  function buildMoves() {
    const list = $("moveList");
    list.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = "move-btn";
      b.style.setProperty("--mcol", cat.color);
      b.textContent = cat.label;
      b.addEventListener("click", () => pickMove(cat));
      li.appendChild(b);
      list.appendChild(li);
    });
  }

  function pickMove(cat) {
    state.move = cat;
    if (cat.id === "still") { show("s-still"); return; }
    buildCollection();
    show("s-coll");
  }

  $("stillAgain").addEventListener("click", () => show("s-move"));

  const MINE_KEY = "dragmarks.mine";
  let mine = store(MINE_KEY, []);

  function buildCollection() {
    const c = state.chair, cat = state.move;

    $("collLine").textContent = c.voice.coll;
    $("collLine").style.setProperty("--chair", c.color);
    $("collTitle").textContent = "They moved a chair " + cat.label + ".";

    const ours = mine.filter((m) => m.cat === cat.id);
    const all = ours.concat(ENTRIES[cat.id] || []);

    const notes = all.filter((e) => e.text);
    const pics = all.filter((e) => e.photo && !e.text);

    const noteList = $("noteList");
    noteList.innerHTML = "";
    notes.forEach((e) => noteList.appendChild(noteCard(e)));

    const grid = $("photoGrid");
    grid.innerHTML = "";
    pics.forEach((e) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.innerHTML = '<img src="' + e.photo + '" alt="" loading="lazy">';
      b.addEventListener("click", () => openPhoto(e));
      li.appendChild(b);
      grid.appendChild(li);
    });

    $("collSaid").hidden = notes.length === 0;
    $("collSaw").hidden = pics.length === 0;
    $("collEmpty").hidden = all.length > 0;

    /* reset the contribute block for this move */
    $("noteInput").value = "";
    $("counter").textContent = "0";
    $("photoPreview").hidden = true;
    $("photoPreview").removeAttribute("src");
    $("photoInput").value = "";
    $("giveThanks").hidden = true;
    $("giveSubmit").hidden = false;
    pending.photo = null;
    showTab("text");
  }

  function noteCard(e) {
    const li = document.createElement("li");
    li.className = "note" + (e.cat ? " mine" : "");
    if (e.cat) li.style.setProperty("--chair", state.chair.color);

    if (e.photo) {
      const im = document.createElement("img");
      im.src = e.photo;
      im.alt = "";
      im.loading = "lazy";
      im.addEventListener("click", () => openPhoto(e));
      li.appendChild(im);
    }

    const p = document.createElement("p");
    p.textContent = e.text;
    li.appendChild(p);

    const d = document.createElement("div");
    d.className = "date";
    d.textContent = e.date;
    li.appendChild(d);
    return li;
  }

  function openPhoto(e) {
    $("lightboxImg").src = e.photo;
    $("lightboxImg").hidden = false;
    $("lightboxNote").hidden = true;
    $("lightboxCap").textContent = e.date || "";
    $("lightbox").hidden = false;
  }

  function openStop(s) {
    if (s.photo) {
      $("lightboxImg").src = s.photo;
      $("lightboxImg").hidden = false;
      $("lightboxNote").hidden = true;
    } else {
      $("lightboxImg").hidden = true;
      $("lightboxImg").removeAttribute("src");
      $("lightboxNote").textContent = s.text || "";
      $("lightboxNote").hidden = false;
    }
    $("lightboxCap").textContent = "left here at " + s.time;
    $("lightbox").hidden = false;
  }
  $("lightboxClose").addEventListener("click", () => { $("lightbox").hidden = true; });
  $("lightbox").addEventListener("click", (ev) => {
    if (ev.target.id === "lightbox") $("lightbox").hidden = true;
  });

  const pending = { photo: null };

  function showTab(which) {
    const t = which === "text";
    $("tabText").classList.toggle("is-on", t);
    $("tabPhoto").classList.toggle("is-on", !t);
    $("tabText").setAttribute("aria-selected", String(t));
    $("tabPhoto").setAttribute("aria-selected", String(!t));
    $("paneText").hidden = !t;
    $("panePhoto").hidden = t;
  }
  $("tabText").addEventListener("click", () => showTab("text"));
  $("tabPhoto").addEventListener("click", () => showTab("photo"));

  $("noteInput").addEventListener("input", (ev) => {
    $("counter").textContent = String(ev.target.value.length);
  });

  $("photoInput").addEventListener("change", (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => {
        const max = 900;
        const sc = Math.min(1, max / Math.max(im.width, im.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(im.width * sc);
        cv.height = Math.round(im.height * sc);
        cv.getContext("2d").drawImage(im, 0, 0, cv.width, cv.height);
        pending.photo = cv.toDataURL("image/jpeg", 0.7);
        $("photoPreview").src = pending.photo;
        $("photoPreview").hidden = false;
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $("giveSubmit").addEventListener("click", () => {
    const text = $("noteInput").value.trim();
    if (!text && !pending.photo) return;

    const entry = {
      id: "mine-" + Date.now(),
      cat: state.move.id,
      chair: state.chair.id,
      text: text || null,
      photo: pending.photo || null,
      date: longDate(new Date())
    };

    mine.unshift(entry);
    while (mine.length > 12) mine.pop();
    if (!keep(MINE_KEY, mine)) {
      mine.shift();
      mine.unshift(entry);
    }

    const t = $("giveThanks");
    t.innerHTML = "";
    t.appendChild(document.createTextNode(state.chair.voice.thanks || COPY.giveThanksFallback));
    const s = document.createElement("small");
    s.textContent = COPY.giveThanksNote + " " + COPY.giveLocalNote;
    t.appendChild(s);
    t.style.setProperty("--chair", state.chair.color);
    t.hidden = false;
    $("giveSubmit").hidden = true;

    const keepScroll = window.scrollY;
    buildCollectionKeepingThanks();
    window.scrollTo(0, keepScroll);
  });

  function buildCollectionKeepingThanks() {
    const thanksHTML = $("giveThanks").innerHTML;
    const thanksHidden = $("giveThanks").hidden;
    const submitHidden = $("giveSubmit").hidden;
    buildCollection();
    $("giveThanks").innerHTML = thanksHTML;
    $("giveThanks").hidden = thanksHidden;
    $("giveThanks").style.setProperty("--chair", state.chair.color);
    $("giveSubmit").hidden = submitHidden;
  }

  $("giveSkip").addEventListener("click", () => goToMap());
  $("toMap").addEventListener("click", () => goToMap());

  const jmap = {
    cv: null, ctx: null, w: 0, h: 0,
    pts: [], stops: [], hits: [], placed: [],
    home: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    dragging: false,
    t0: performance.now()
  };

  const amap = { ctx: null, w: 0, h: 0, lines: [] };

  let running = false;
  const TRACE_KEY = "dragmarks.trace." + todayKey;

  function wander(rnd, w, h, legs) {
    const pad = 0.1;
    let x = (pad * 2 + rnd() * (1 - pad * 4)) * w;
    let y = (pad * 2 + rnd() * (1 - pad * 4)) * h;
    const pts = [{ x: x, y: y }];
    let a = rnd() * Math.PI * 2;
    let turn = rnd() < 0.5 ? -1 : 1;
    const unit = Math.min(w, h);

    for (let l = 0; l < legs; l++) {
      const steps = 4 + Math.floor(rnd() * 5);
      for (let s = 0; s < steps; s++) {
        a += turn * (0.15 + rnd() * 0.8) + (rnd() - 0.5);
        const step = unit * (0.03 + rnd() * 0.055);
        x += Math.cos(a) * step;
        y += Math.sin(a) * step;
        if (x < pad * w || x > w - pad * w) { a = Math.PI - a; x = Math.min(Math.max(x, pad * w), w - pad * w); }
        if (y < pad * h || y > h - pad * h) { a = -a; y = Math.min(Math.max(y, pad * h), h - pad * h); }
        pts.push({ x: x, y: y });
      }
      turn *= -1;
    }
    return smooth(pts);
  }

  function smooth(p, steps) {
    steps = steps || 10;
    if (p.length < 3) return p;
    const a = [p[0]].concat(p, [p[p.length - 1]]);
    const out = [];
    for (let i = 0; i < a.length - 3; i++) {
      const p0 = a[i], p1 = a[i + 1], p2 = a[i + 2], p3 = a[i + 3];
      for (let s = 0; s < steps; s++) {
        const t = s / steps, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push(p[p.length - 1]);
    return out;
  }

  function dayOf(chair, w, h) {
    const authored = typeof JOURNEYS !== "undefined" && JOURNEYS[chair.id];
    if (authored && authored.length > 1) {
      const knots = authored.map((p) => ({ x: p.x * w, y: p.y * h }));
      const stops = [];
      authored.forEach((p, i) => {
        if (p.stop) stops.push(Object.assign({}, p.stop, { x: knots[i].x, y: knots[i].y }));
      });
      return { pts: smooth(knots), stops: stops };
    }
    const rnd = seeded(todayKey + ":" + chair.id);
    return { pts: wander(rnd, w, h, 2 + Math.floor(rnd() * 3)), stops: [] };
  }

  function goToMap() {
    $("mapLine").textContent = state.chair.voice.map;
    $("mapLine").style.setProperty("--chair", state.chair.color);
    show("s-map");
    setUpMap();
  }

  function fitCanvas(cv) {
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(rect.width * dpr);
    cv.height = Math.round(rect.height * dpr);
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: rect.width, h: rect.height };
  }

  function setUpMap() {

    const j = fitCanvas($("journeyCanvas"));
    jmap.cv = $("journeyCanvas");
    jmap.ctx = j.ctx; jmap.w = j.w; jmap.h = j.h;

    const day = dayOf(state.chair, jmap.w, jmap.h);
    jmap.pts = day.pts;
    jmap.stops = day.stops;
    jmap.hits = [];
    jmap.home = jmap.pts[jmap.pts.length - 1];

    const saved = store(TRACE_KEY, null);
    if (saved && saved.chair === state.chair.id && saved.pts && saved.pts.length > 1) {

      state.trace = saved.pts.map((p) => ({ x: p.x * jmap.w, y: p.y * jmap.h }));
      jmap.pos = state.trace[state.trace.length - 1];
      state.dragged = true;
    } else {
      state.trace = [];
      jmap.pos = { x: jmap.home.x, y: jmap.home.y };
      state.dragged = false;
    }

    $("mapReset").hidden = !state.dragged;
    $("mapHelp").textContent = state.dragged ? COPY.mapDone
      : (jmap.stops.length ? COPY.mapHelp : COPY.mapNoStops);

    const a = fitCanvas($("mapCanvas"));
    amap.ctx = a.ctx; amap.w = a.w; amap.h = a.h;
    amap.lines = CHAIRS.map((c) => ({ chair: c, pts: dayOf(c, amap.w, amap.h).pts }));

    jmap.t0 = performance.now();
    if (!running) { running = true; requestAnimationFrame(drawMaps); }
  }

  function line(ctx, pts, colour, width, alpha) {
    if (pts.length < 2) return;
    ctx.globalAlpha = alpha * 0.4;
    ctx.strokeStyle = "rgba(25,25,25,1)";
    ctx.lineWidth = width + 3.5;
    ctx.lineJoin = ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawChair(ctx, c, x, y, px, alpha) {
    const im = chairImg[c.id];
    if (!im || !im.complete || !im.naturalWidth) return;
    const sc = px / Math.max(im.naturalWidth, im.naturalHeight);
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, x - (im.naturalWidth * sc) / 2, y - (im.naturalHeight * sc) / 2,
      im.naturalWidth * sc, im.naturalHeight * sc);
    ctx.globalAlpha = 1;
  }

  function gravel(ctx, w, h) {
    if (gravelImg.complete && gravelImg.naturalWidth) {
      const s = Math.max(w / gravelImg.naturalWidth, h / gravelImg.naturalHeight);
      const dw = gravelImg.naturalWidth * s, dh = gravelImg.naturalHeight * s;
      ctx.drawImage(gravelImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#8a8a86";
      ctx.fillRect(0, 0, w, h);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawStop(ctx, s, colour, w, h) {
    const label = (s.photo ? "photo" : "message") + ", " + s.time;
    ctx.font = "600 11.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
    const padX = 8, padY = 6;
    const tw = ctx.measureText(label).width;
    const bw = tw + padX * 2, bh = 11.5 + padY * 2;

    const toLeft = s.x > w * 0.56;
    let bx = toLeft ? s.x - 13 - bw : s.x + 13;
    let by = s.y - bh / 2;
    bx = Math.min(Math.max(bx, 4), w - bw - 4);
    by = Math.min(Math.max(by, 4), h - bh - 4);

    const clash = (y) => jmap.placed.some((p) =>
      bx < p.x + p.w && bx + bw > p.x && y < p.y + p.h && y + bh > p.y);
    if (clash(by)) {
      const step = bh + 5;
      let moved = null;
      for (let k = 1; k <= 4 && moved === null; k++) {
        const down = by + step * k, up = by - step * k;
        if (down + bh <= h - 4 && !clash(down)) moved = down;
        else if (up >= 4 && !clash(up)) moved = up;
      }
      if (moved !== null) by = moved;
    }
    jmap.placed.push({ x: bx, y: by, w: bw, h: bh });

    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(toLeft ? bx + bw : bx, by + bh / 2);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.4)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, bx, by, bw, bh, 7);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#1C1B19";
    ctx.textBaseline = "middle";
    ctx.fillText(label, bx + padX, by + bh / 2 + 0.5);

    ctx.beginPath();
    ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(25,25,25,.55)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();

    jmap.hits.push({ x: bx - 6, y: by - 6, w: bw + 12, h: bh + 12, stop: s });
  }

  function drawMaps(now) {
    if (!$("s-map").classList.contains("is-on")) { running = false; return; }
    if (!jmap.ctx || !amap.ctx) { running = false; return; }

    const ctx = jmap.ctx, w = jmap.w, h = jmap.h;
    gravel(ctx, w, h);
    const size = Math.max(42, Math.min(w, h) * 0.13);

    line(ctx, jmap.pts, state.chair.color, 4, 0.95);
    if (state.trace.length > 1) line(ctx, state.trace, state.chair.color, 4.5, 1);

    jmap.hits = [];
    jmap.placed = [];
    jmap.stops.forEach((s) => drawStop(ctx, s, state.chair.color, w, h));

    let bob = 0;
    if (!state.dragged && !jmap.dragging && !calm) {
      bob = Math.sin((now - jmap.t0) / 420) * 3.5;
    }
    drawChair(ctx, state.chair, jmap.pos.x, jmap.pos.y + bob, size, 1);

    const actx = amap.ctx, aw = amap.w, ah = amap.h;
    gravel(actx, aw, ah);
    const asize = Math.max(38, Math.min(aw, ah) * 0.12);

    amap.lines.forEach((o) => {
      const mine = o.chair.id === state.chair.id;
      line(actx, o.pts, o.chair.color, mine ? 4 : 3, mine ? 1 : 0.5);
      let end = o.pts[o.pts.length - 1];
      if (mine && state.trace.length > 1) {
        const scaled = state.trace.map((p) => ({ x: p.x / jmap.w * aw, y: p.y / jmap.h * ah }));
        line(actx, scaled, o.chair.color, 4, 1);
        end = scaled[scaled.length - 1];
      }
      drawChair(actx, o.chair, end.x, end.y, mine ? asize : asize * 0.86, mine ? 1 : 0.45);
    });

    requestAnimationFrame(drawMaps);
  }

  (function handling() {
    const cv = $("journeyCanvas");

    function at(ev) {
      const r = cv.getBoundingClientRect();
      return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    cv.addEventListener("pointerdown", (ev) => {
      if (!state.chair) return;
      const p = at(ev);

      for (let i = 0; i < jmap.hits.length; i++) {
        const k = jmap.hits[i];
        const onLabel = p.x >= k.x && p.x <= k.x + k.w && p.y >= k.y && p.y <= k.y + k.h;
        const onDot = Math.hypot(p.x - k.stop.x, p.y - k.stop.y) < 18;
        if (onLabel || onDot) { openStop(k.stop); ev.preventDefault(); return; }
      }

      const reach = Math.max(46, Math.min(jmap.w, jmap.h) * 0.13);
      if (Math.hypot(p.x - jmap.pos.x, p.y - jmap.pos.y) > reach) return;

      jmap.dragging = true;
      cv.setPointerCapture(ev.pointerId);
      if (!state.dragged) state.trace = [{ x: jmap.pos.x, y: jmap.pos.y }];
      ev.preventDefault();
    });

    cv.addEventListener("pointermove", (ev) => {
      if (!jmap.dragging) return;
      const p = at(ev);
      p.x = Math.min(Math.max(p.x, 8), jmap.w - 8);
      p.y = Math.min(Math.max(p.y, 8), jmap.h - 8);
      const last = state.trace[state.trace.length - 1];
      if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 3) state.trace.push(p);
      jmap.pos = p;
      ev.preventDefault();
    });

    function release(ev) {
      if (!jmap.dragging) return;
      jmap.dragging = false;
      try { cv.releasePointerCapture(ev.pointerId); } catch (e) {}
      if (state.trace.length > 1) {
        state.dragged = true;
        $("mapReset").hidden = false;
        $("mapHelp").textContent = COPY.mapDone;
        keep(TRACE_KEY, {
          chair: state.chair.id,
          pts: state.trace.map((p) => ({ x: p.x / jmap.w, y: p.y / jmap.h }))
        });
      }
    }
    cv.addEventListener("pointerup", release);
    cv.addEventListener("pointercancel", release);
  })();

  $("mapReset").addEventListener("click", () => {
    state.trace = [];
    state.dragged = false;
    jmap.pos = { x: jmap.home.x, y: jmap.home.y };
    jmap.t0 = performance.now();
    $("mapReset").hidden = true;
    $("mapHelp").textContent = jmap.stops.length ? COPY.mapHelp : COPY.mapNoStops;
    try { localStorage.removeItem(TRACE_KEY); } catch (e) {}
  });

  window.addEventListener("resize", () => {
    if ($("s-map").classList.contains("is-on")) setUpMap();
  });

  (function buildPast() {
    const list = $("pastList");
    PAST_MAPS.forEach((m) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = "past-row";
      b.style.setProperty("--pcol", m.color);
      b.innerHTML = "<span>" + COPY.mapPastRow + "</span><span>" + m.date + "</span>";
      b.addEventListener("click", () => openPhoto({ photo: m.img, date: m.date }));
      li.appendChild(b);
      list.appendChild(li);
    });
  })();

  $("again").addEventListener("click", () => {
    state.move = null;
    show("s-pick");
  });

})();
