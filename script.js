// ================= EDIT THIS PART =================
const CONFIG = {
  name: "Kavya",
  from: "Your name here",          // shown at the end, e.g. "Always yours, Rahul"
  letter: [
    "Kavya, I don't know exactly what went wrong, and honestly that is part of the problem. I should have noticed before it got this quiet.",
    "Whatever I did, or didn't do, I'm sorry. I would much rather hear it from you, even if it's hard to hear, than keep guessing.",
    "I miss talking to you. Your voice, your random messages, all of it.",
    "You matter more to me than being right."
  ],
  promises: [
    { title: "I'll listen first", text: "When something bothers you, I'll hear all of it before I say a word." },
    { title: "I'll be honest", text: "If I'm wrong, I'll say so right away instead of getting defensive." },
    { title: "I'll show up", text: "Fewer big promises, more small things done on time." }
  ]
};
// ==================================================

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  /* ---------- fill in the name ---------- */
  $$("[data-name]").forEach((el) => (el.textContent = CONFIG.name));
  $("#sign").textContent = CONFIG.from;

  /* ---------- split the big title into letters ---------- */
  const title = $("#bigTitle");
  const words = ["I'm", "sorry."];
  title.textContent = "";
  let n = 0;
  words.forEach((w, wi) => {
    [...w].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch" + (wi === 1 ? " hot" : "");
      s.style.setProperty("--i", n++);
      s.textContent = c;
      s.setAttribute("aria-hidden", "true");
      title.appendChild(s);
    });
    if (wi === 0) {
      const sp = document.createElement("span");
      sp.className = "ch sp"; sp.style.setProperty("--i", n++);
      title.appendChild(sp);
    }
  });

  /* ---------- scenes ---------- */
  const scenes = $$(".scene");
  const dots = $$("#dots i");
  let cur = -1;
  const enter = [null, startLetter, null, null];

  function go(i) {
    if (i === cur) return;
    if (cur >= 0) scenes[cur].classList.remove("active");
    cur = i;
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
    setTimeout(() => {
      scenes[i].classList.add("active");
      if (enter[i]) enter[i]();
    }, cur === 0 && !scenes[0].dataset.shown ? 100 : (reduce ? 0 : 450));
    scenes[0].dataset.shown = "1";
  }
  $$("[data-next]").forEach((b) => b.addEventListener("click", () => go(cur + 1)));
  go(0);

  /* ---------- scene 1: typed letter ---------- */
  let typed = false, skip = false;
  const letter = $("#letter");
  async function startLetter() {
    if (typed) return;
    typed = true;
    const lines = CONFIG.letter.concat([]);
    const caret = document.createElement("span");
    caret.className = "caret";
    for (const text of lines) {
      const p = document.createElement("p");
      letter.appendChild(p);
      p.appendChild(caret);
      for (const ch of text) {
        if (skip) { p.insertBefore(document.createTextNode(text.slice(p.textContent.length)), caret); break; }
        p.insertBefore(document.createTextNode(ch), caret);
        await wait(/[.,]/.test(ch) ? 260 : 32);
      }
      await wait(skip ? 0 : 450);
    }
    const sig = document.createElement("p");
    sig.className = "sig";
    sig.textContent = CONFIG.from ? "Always yours, " + CONFIG.from : "Always yours";
    letter.appendChild(sig);
    caret.remove();
    $("#skipType").hidden = true;
    $("#letterNext").hidden = false;
  }
  $("#skipType").addEventListener("click", () => { skip = true; });

  /* ---------- scene 2: flip cards ---------- */
  const cardsBox = $("#cards");
  let opened = 0;
  CONFIG.promises.forEach((p, i) => {
    const d = document.createElement("div");
    d.className = "flip";
    d.style.setProperty("--i", i);
    d.innerHTML =
      '<button type="button" aria-label="Open promise ' + (i + 1) + '">' +
      '<span class="face front"><svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg><span>Tap to open</span></span>' +
      '<span class="face back"><b></b><p></p></span></button>';
    $("b", d).textContent = p.title;
    $("p", d).textContent = p.text;
    $("button", d).addEventListener("click", () => {
      if (d.classList.contains("on")) return;
      d.classList.add("on");
      opened++;
      $("#cardHint").textContent = opened + " of " + CONFIG.promises.length + " opened";
      if (opened === CONFIG.promises.length) {
        $("#cardHint").textContent = "That's all of them.";
        setTimeout(() => { $("#cardsNext").hidden = false; }, reduce ? 0 : 700);
      }
    });
    cardsBox.appendChild(d);
  });
  $("#cardHint").textContent = "0 of " + CONFIG.promises.length + " opened";

  /* ---------- scene 3: runaway No ---------- */
  const yes = $("#yes"), no = $("#no"), hint = $("#askHint");
  const MAX = 6;
  const lines = [
    "",
    "Hey, that button is shy.",
    "Are you sure? Look at my sad face.",
    "I'll bring snacks. Please?",
    "It's getting smaller...",
    "One more try and it's gone.",
    "Okay. Only Yes is left now."
  ];
  let tries = 0;
  function dodge(e) {
    if (tries >= MAX) return;
    if (e && e.preventDefault) e.preventDefault();
    tries++;
    hint.textContent = lines[tries];
    no.classList.add("flying");
    const w = no.offsetWidth, h = no.offsetHeight, pad = 16;
    const x = pad + Math.random() * Math.max(10, innerWidth - w - pad * 2);
    const y = pad + Math.random() * Math.max(10, innerHeight - h - pad * 2 - 40);
    no.style.left = x + "px";
    no.style.top = y + "px";
    no.style.transform = "scale(" + Math.max(0.45, 1 - tries * 0.1) + ")";
    yes.style.setProperty("--grow", 1 + tries * 0.09);
    if (tries >= MAX) setTimeout(() => no.classList.add("gone"), 400);
  }
  ["pointerenter", "pointerdown", "touchstart", "click", "focus"].forEach((ev) => no.addEventListener(ev, dodge, { passive: false }));

  yes.addEventListener("click", () => {
    $("#askPre").hidden = true;
    no.classList.add("gone");
    $("#askDone").hidden = false;
    burst(); setTimeout(burst, 500); setTimeout(burst, 1100);
  });

  /* ---------- background: stars + rising hearts + parallax ---------- */
  const bg = $("#bg"), bctx = bg.getContext("2d");
  const fx = $("#fx"), fctx = fx.getContext("2d");
  let W = 0, H = 0, mx = 0, my = 0;
  function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    [bg, fx].forEach((c) => { c.width = W * d; c.height = H * d; });
    bctx.setTransform(d, 0, 0, d, 0, 0);
    fctx.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener("resize", resize); resize();

  const spot = $("#spot");
  addEventListener("pointermove", (e) => {
    mx = (e.clientX / W - 0.5);
    my = (e.clientY / H - 0.5);
    spot.style.left = e.clientX + "px";
    spot.style.top = e.clientY + "px";
  });

  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.3,
    p: Math.random() * 6.28, z: Math.random() * 0.8 + 0.2
  }));
  const rise = Array.from({ length: 16 }, () => newRise(true));
  function newRise(init) {
    return { x: Math.random(), y: init ? Math.random() : 1.1, s: Math.random() * 0.9 + 0.5, v: Math.random() * 0.00022 + 0.00008, p: Math.random() * 6.28 };
  }
  function heart(ctx, x, y, s, rot, col, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.globalAlpha = a; ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-7, -2, -4, -9, 0, -5);
    ctx.bezierCurveTo(4, -9, 7, -2, 0, 3);
    ctx.fill(); ctx.restore();
  }
  let t = 0;
  function drawBg() {
    t += 1;
    bctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = 0.35 + 0.35 * Math.sin(t * 0.02 + s.p);
      bctx.globalAlpha = a; bctx.fillStyle = "#f6eee9";
      bctx.beginPath();
      bctx.arc(s.x * W - mx * 40 * s.z, s.y * H - my * 40 * s.z, s.r, 0, 6.283);
      bctx.fill();
    }
    for (let i = 0; i < rise.length; i++) {
      const h = rise[i];
      h.y -= h.v * H / 600 * 6;
      if (h.y < -0.1) rise[i] = newRise(false);
      const x = h.x * W + Math.sin(t * 0.01 + h.p) * 24 - mx * 60;
      heart(bctx, x, h.y * H - my * 60, h.s * 2.6, Math.sin(t * 0.01 + h.p) * 0.4, "#ff8fa3", 0.16);
    }
    requestAnimationFrame(drawBg);
  }
  if (!reduce) drawBg(); else { t = 1; drawBg(); }

  /* ---------- confetti hearts ---------- */
  let parts = [], raf = 0;
  const cols = ["#ff8fa3", "#e8647f", "#ffd9a8", "#f6eee9", "#ffb3c1"];
  function burst() {
    const count = reduce ? 20 : 90;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI - Math.PI;
      const sp = Math.random() * 11 + 4;
      parts.push({
        x: W / 2, y: H * 0.55,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3,
        s: Math.random() * 1.8 + 0.9, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
        c: cols[i % cols.length], a: 1
      });
    }
    if (!raf) tick();
  }
  function tick() {
    fctx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => p.a > 0.02 && p.y < H + 40);
    for (const p of parts) {
      p.vy += 0.26; p.vx *= 0.995; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.a -= 0.006;
      heart(fctx, p.x, p.y, p.s * 2.4, p.r, p.c, Math.max(p.a, 0));
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) fctx.clearRect(0, 0, W, H);
  }
})();
