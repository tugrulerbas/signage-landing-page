/* Mlink Signage landing: sample store scene and hero animations */
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

  $(".js-year").textContent = new Date().getFullYear();
})();
