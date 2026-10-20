/* Mlink Signage landing — sample store scene, scroll animations, branch screens */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Split text into words for staggered animations ---- */
  const splitWords = root => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span");
            w.className = "w"; w.style.setProperty("--i", i++); w.textContent = part;
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
  };
  $$(".js-split, .js-words").forEach(splitWords);

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }), { threshold: .2, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(el => reduced ? el.classList.add("in") : io.observe(el));
  // Hero copy is above the fold: reveal right after the headline starts
  setTimeout(() => $$(".hero [data-reveal]").forEach(el => el.classList.add("in")), reduced ? 0 : 450);

  /* ---- Sample store: screen content through the day ---- */
  const PHASES = [
    {
      time: "08:30",
      totem: ["blue", "<small>Good morning</small><b>Fresh bagels and pastries</b><span>08:00–11:00</span>"],
      shelf: ["ink", "<b>Filter coffee</b><span>89.90 TL</span>"],
      till:  ["ink", "<small>Breakfast</small><b>20% off cheese</b>"],
    },
    {
      time: "12:30",
      totem: ["blue", "<small>Lunch break</small><b>Salads and sandwiches</b><span>12:00–14:00</span>"],
      shelf: ["ink", "<b>Iced tea</b><span>Buy 2, get 1</span>"],
      till:  ["orange", "<small>Ad</small><b>Refreshing mineral water</b><span>A beverage brand</span>"],
    },
    {
      time: "19:00",
      totem: ["blue", "<small>Evening</small><b>Dinner deals</b><span>18:00–22:00</span>"],
      shelf: ["ink", "<b>Pasta</b><span>24.50 TL</span>"],
      till:  ["ink", "<small>Loyalty card</small><b>Earn points on every visit</b>"],
    },
  ];
  const DUR = 4500;
  const store = $(".store");
  const slots = { totem: $(".js-totem"), shelf: $(".js-shelf"), till: $(".js-till") };
  const buttons = $$(".phases button");
  const clock = $(".js-time");
  let phase = -1, timer = null;

  const paint = (el, [tone, html], animate) => {
    const f = document.createElement("div");
    f.className = `frame frame--${tone}${animate ? " enter" : ""}`;
    f.innerHTML = html;
    el.append(f);
    // Remove old frames once the new one has wiped in; the top frame always stays
    const old = [...el.children].filter(c => c !== f);
    if (!animate) old.forEach(o => o.remove());
    else setTimeout(() => old.forEach(o => o !== el.lastElementChild && o.remove()), 800);
  };

  const show = (i, animate = !reduced) => {
    if (i === phase) return;
    phase = i;
    const p = PHASES[i];
    store.dataset.phase = i;
    clock.textContent = p.time;
    // Screens change a few hundred milliseconds apart, not all at once
    Object.keys(slots).forEach((k, n) => {
      if (animate) setTimeout(() => paint(slots[k], p[k], true), n * 160);
      else paint(slots[k], p[k], false);
    });
    buttons.forEach((b, n) => {
      b.setAttribute("aria-pressed", n === i);
      b.classList.remove("run");
    });
    if (timer) {
      void buttons[i].offsetWidth;
      buttons[i].style.setProperty("--dur", `${DUR}ms`);
      buttons[i].classList.add("run");
    }
  };

  const auto = () => {
    clearInterval(timer);
    timer = setInterval(() => show((phase + 1) % PHASES.length), DUR);
  };

  buttons.forEach((b, n) => b.addEventListener("click", () => {
    clearInterval(timer); timer = null; // a manual pick stops the auto cycle
    show(n);
  }));

  if (reduced) {
    show(1, false);
  } else {
    timer = true; show(0, false); auto();
    // Pause the cycle while the scene is off screen
    new IntersectionObserver(([e]) => {
      if (!timer) return;
      if (e.isIntersecting) auto(); else { clearInterval(timer); timer = true; }
    }).observe(store);
  }

  /* ---- Brand story: branch screens switch campaigns together ---- */
  const CAMPAIGNS = ["October campaign", "Weekend 20% off"];
  const minis = $$(".mini");
  let camp = 0, chainTimer = null;
  const flip = () => {
    camp = (camp + 1) % CAMPAIGNS.length;
    minis.forEach((m, n) => setTimeout(() => {
      m.classList.toggle("is-new", camp === 1);
      $(".mini__show", m).textContent = CAMPAIGNS[camp];
    }, n * 180));
  };
  if (!reduced && minis.length) {
    new IntersectionObserver(([e]) => {
      clearInterval(chainTimer);
      if (e.isIntersecting) chainTimer = setInterval(flip, 2800);
    }, { threshold: .4 }).observe($(".art-chain"));
  }

  /* ---- Tour: sticky benefits, one step per scroll gesture (Mixpanel style) ---- */
  const tour = $(".tour");
  if (tour) {
    const items = $$(".tour__item"), tabs = $$(".tour__rail button");
    const n = items.length, NAV = 68;
    const mobile = matchMedia("(max-width: 900px)");
    const root = document.documentElement;
    let cur = 0;

    const setActive = i => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      tabs.forEach((t, k) => t.setAttribute("aria-selected", k === i));
    };
    const top0 = () => tour.getBoundingClientRect().top + scrollY - NAV;
    const span = () => tour.offsetHeight - (innerHeight - NAV);
    // Her adımın sayfadaki durma noktası: ilk adım bölüm başında, son adım bölüm sonunda
    const pos = k => Math.round(top0() + (k / (n - 1)) * span());

    const onScroll = () => {
      if (mobile.matches) { // alt alta düzen: göründükçe aç
        items.forEach(it => { if (it.getBoundingClientRect().top < innerHeight * .8) it.classList.add("is-active"); });
        return;
      }
      const prog = Math.min(1, Math.max(0, (scrollY - top0()) / span()));
      const i = Math.min(n - 1, Math.round(prog * (n - 1)));
      setActive(i);
      tabs.forEach((t, k) => t.style.setProperty("--p", k <= i ? 1 : 0));
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();

    /* Yumuşak, adım adım kaydırma */
    let anim = null, locked = false, lastInput = 0;
    const tween = to => {
      cancelAnimationFrame(anim);
      const from = scrollY, dist = to - from, dur = reduced ? 0 : 750, t0 = performance.now();
      root.style.scrollBehavior = "auto";
      locked = true;
      const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const tick = now => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        scrollTo(0, from + dist * ease(k));
        if (k < 1) anim = requestAnimationFrame(tick);
        else { anim = null; root.style.scrollBehavior = ""; }
      };
      anim = requestAnimationFrame(tick);
    };
    const goTo = k => tween(pos(Math.max(0, Math.min(n - 1, k))));

    // Bu jest bölüm içinde mi ele alınmalı? Ele alınırsa hedef adımı döndürür
    const target = dir => {
      const y = scrollY, first = pos(0), last = pos(n - 1), tol = 6;
      if (dir > 0) {
        if (y < first - innerHeight * .6 || y >= last - tol) return null; // bölüm dışında / son adım: normal kaydır
        if (y < first - tol) return 0;                                    // yukarıdan giriş
        return cur + 1;
      }
      if (y > last + innerHeight * .6 || y <= first + tol) return null;  // bölüm dışında / ilk adım
      if (y > last + tol) return n - 1;                                  // aşağıdan giriş
      return cur - 1;
    };
    const handle = (dir, e) => {
      if (mobile.matches) return;
      const now = performance.now();
      const gap = now - lastInput;
      lastInput = now;
      // Animasyon sürerken ya da trackpad ataleti devam ederken bölüm içindeki girdileri yut
      if (locked) {
        if (anim || gap < 220) { if (target(dir) !== null || anim) e.preventDefault(); return; }
        locked = false;
      }
      const k = target(dir);
      if (k === null) return;
      e.preventDefault();
      goTo(k);
    };
    addEventListener("wheel", e => { if (Math.abs(e.deltaY) > 2) handle(Math.sign(e.deltaY), e); }, { passive: false });

    let touchY = null;
    addEventListener("touchstart", e => { touchY = e.touches[0].clientY; }, { passive: true });
    addEventListener("touchmove", e => {
      if (touchY === null || mobile.matches) return;
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) < 24) { if (target(Math.sign(dy) || 1) !== null) e.preventDefault(); return; }
      handle(Math.sign(dy), e);
      touchY = null;
    }, { passive: false });

    addEventListener("keydown", e => {
      const dir = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (!dir || e.target.closest("input, textarea, button, a")) return;
      handle(dir, e);
    });

    tabs.forEach((t, k) => t.addEventListener("click", () => goTo(k)));

    // Mobile: items are stacked; reveal each one as it scrolls in
    const itemIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && mobile.matches) e.target.classList.add("is-active");
    }), { threshold: .25 });
    items.forEach(it => itemIO.observe(it));
  }

  /* ---- Flow: advertiser ↔ Mlink Signage ↔ screen owner ---- */
  const canvas = $(".flow__canvas");
  if (canvas) {
    const A = $('[data-node="a"]', canvas), H = $('[data-node="h"]', canvas), O = $('[data-node="o"]', canvas);
    const lanes = Object.fromEntries($$(".lane", canvas).map(g => [g.dataset.lane, g]));
    const screens = $$(".own__screens i", canvas), meter = $(".own__meter", canvas);
    const stepBtns = $$(".flow__steps button");
    const svg = $(".flow__lanes", canvas);
    const D = {};
    const STEP_MS = 3600;

    const box = (el, c) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - c.left, r: r.right - c.left, t: r.top - c.top, b: r.bottom - c.top, cx: (r.left + r.right) / 2 - c.left, cy: (r.top + r.bottom) / 2 - c.top, w: r.width, h: r.height };
    };
    const layout = () => {
      const c = canvas.getBoundingClientRect();
      svg.setAttribute("viewBox", `0 0 ${c.width} ${c.height}`);
      const a = box(A, c), h = box(H, c), o = box(O, c);
      if (h.cy < a.b) { // yan yana
        const k = h.h * .22, y = h.cy, h1 = h.l + h.w * .1, h2 = h.r - h.w * .1;
        const d1 = (h1 - a.r) * .45, d2 = (o.l - h2) * .45;
        D.ah = `M${a.r},${y - k} C${a.r + d1},${y - k - 70} ${h1 - d1},${y - k - 40} ${h1},${y - k}`;
        D.ho = `M${h2},${y - k} C${h2 + d2},${y - k - 40} ${o.l - d2},${y - k - 70} ${o.l},${y - k}`;
        D.oh = `M${o.l},${y + k} C${o.l - d2},${y + k + 70} ${h2 + d2},${y + k + 40} ${h2},${y + k}`;
        D.ha = `M${h1},${y + k} C${h1 - d1},${y + k + 40} ${a.r + d1},${y + k + 70} ${a.r},${y + k}`;
      } else { // alt alta (mobil)
        const k = h.w * .22, x = h.cx, h1 = h.t + h.h * .1, h2 = h.b - h.h * .1;
        const d1 = (h1 - a.b) * .45, d2 = (o.t - h2) * .45;
        D.ah = `M${x - k},${a.b} C${x - k - 50},${a.b + d1} ${x - k - 30},${h1 - d1} ${x - k},${h1}`;
        D.ho = `M${x - k},${h2} C${x - k - 30},${h2 + d2} ${x - k - 50},${o.t - d2} ${x - k},${o.t}`;
        D.oh = `M${x + k},${o.t} C${x + k + 50},${o.t - d2} ${x + k + 30},${h2 + d2} ${x + k},${h2}`;
        D.ha = `M${x + k},${h1} C${x + k + 30},${h1 - d1} ${x + k + 50},${a.b + d1} ${x + k},${a.b}`;
      }
      Object.entries(lanes).forEach(([id, g]) => $$("path", g).forEach(p => p.setAttribute("d", D[id])));
    };
    new ResizeObserver(layout).observe(canvas);
    layout();

    const ping = () => { H.classList.remove("ping"); void H.offsetWidth; H.classList.add("ping"); };
    const send = (lane, kind, label, delay, done) => setTimeout(() => {
      const el = document.createElement("span");
      el.className = `pk pk--${kind}`;
      el.textContent = label;
      el.style.offsetPath = `path("${D[lane]}")`;
      canvas.append(el);
      const anim = el.animate([
        { offsetDistance: "0%", opacity: 0, transform: "scale(.6)" },
        { opacity: 1, transform: "scale(1)", offset: .12 },
        { opacity: 1, transform: "scale(1)", offset: .86 },
        { offsetDistance: "100%", opacity: 0, transform: "scale(.7)" },
      ], { duration: 1500, easing: "cubic-bezier(.45,0,.25,1)" });
      anim.onfinish = () => { el.remove(); done && done(); };
    }, delay);

    let rev = 0, lit = 0;
    const setRev = v => { rev = Math.min(100, v); meter.style.setProperty("--rev", rev + "%"); };
    const FREE = [0, 2, 4, 1, 3, 5];
    // Bir adıma atlarken önceki adımların sonucunu sabit olarak kur
    const base = i => {
      screens.forEach(s => s.classList.remove("free", "lit"));
      if (i >= 1) FREE.slice(0, 3).forEach(k => screens[k].classList.add("free"));
      if (i >= 3) screens.forEach(s => s.classList.add("lit"));
      lit = i >= 3 ? 6 : 0;
      if (i >= 4) canvas.dataset.report = ""; else delete canvas.dataset.report;
      setRev(0);
    };
    const STEPS = [
      { lanes: ["oh"], node: [O, "is-cool"], run: () => {
        FREE.slice(0, 3).forEach((k, n) => setTimeout(() => screens[k].classList.add("free"), n * 200));
        ["12:00–14:00", "15:00–17:00", "20:00–22:00"].forEach((t, n) => send("oh", "hours", t, 300 + n * 420, ping));
      } },
      { lanes: ["ah"], node: [A, "is-hot"], run: () => ["Campaign", "Campaign", "Campaign"].forEach((t, n) => send("ah", "ad", t, 250 + n * 420, ping)) },
      { lanes: ["ho"], node: [O, "is-hot"], run: () => [0, 1, 2].forEach(n => send("ho", "ad", "Ad", 200 + n * 420, () => {
        for (let j = 0; j < 2 && lit < 6; j++) screens[FREE[lit++]].classList.replace("free", "lit") || screens[FREE[lit - 1]].classList.add("lit");
      })) },
      { lanes: ["ha"], node: [A, "is-cool"], run: () => {
        [0, 1, 2].forEach(n => send("ha", "report", "Played", 200 + n * 420, n === 0 ? () => { canvas.dataset.report = ""; } : null));
      } },
      { lanes: ["ah", "ho"], node: [O, "is-hot"], run: () => [0, 1, 2].forEach(n => send("ah", "coin", "+", 150 + n * 380, () => {
        ping(); send("ho", "coin", "+", 0, () => setRev(rev + 34));
      })) },
    ];

    let step = -1, flowTimer = null, auto = !reduced;
    const go = (i, animate = !reduced) => {
      step = i;
      canvas.dataset.step = i;
      base(i);
      Object.values(lanes).forEach(g => g.classList.remove("is-on"));
      STEPS[i].lanes.forEach(l => lanes[l].classList.add("is-on"));
      [A, O].forEach(nd => nd.classList.remove("is-hot", "is-cool"));
      STEPS[i].node[0].classList.add(STEPS[i].node[1]);
      stepBtns.forEach((b, k) => { b.setAttribute("aria-selected", k === i); b.classList.remove("run"); });
      if (animate) STEPS[i].run();
      else { // hareketsiz: adımın sonucunu doğrudan göster
        if (i === 0) FREE.slice(0, 3).forEach(k => screens[k].classList.add("free"));
        if (i === 2) screens.forEach(s => s.classList.add("lit"));
        if (i === 3) canvas.dataset.report = "";
        if (i === 4) setRev(100);
      }
      if (auto) {
        void stepBtns[i].offsetWidth;
        stepBtns[i].style.setProperty("--dur", `${STEP_MS}ms`);
        stepBtns[i].classList.add("run");
      }
    };
    const loop = () => { clearInterval(flowTimer); flowTimer = setInterval(() => go((step + 1) % STEPS.length), STEP_MS); };
    stepBtns.forEach((b, k) => b.addEventListener("click", () => { auto = false; clearInterval(flowTimer); go(k); }));
    go(0, false);
    new IntersectionObserver(([e]) => {
      if (!auto) return;
      if (e.isIntersecting) { go(0); loop(); } else clearInterval(flowTimer);
    }, { threshold: .35 }).observe(canvas);
  }

  $(".js-year").textContent = new Date().getFullYear();
})();
