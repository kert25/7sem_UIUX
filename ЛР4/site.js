/* Флёр — цветочная мастерская. Иллюстрации букетов и интерактивность макета. */
(function () {
  "use strict";

  /* ---------- детерминированный генератор случайных чисел ---------- */
  function rng(seed) {
    let a = (seed || 7) >>> 0;
    return function () {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- виды цветов: цена, палитра, «вес» в букете ---------- */
  const DEFS = {
    rose: { name: "Роза пионовидная", price: 190, pal: ["#b8455c", "#d76d80", "#f0a7b4", "#8d2f42"], weight: 1.15 },
    white_rose: { name: "Роза белая", price: 210, pal: ["#ddcfb8", "#f0e6d4", "#fffdf7", "#c3b39a"], weight: 1.15 },
    peony: { name: "Пион", price: 420, pal: ["#d98b96", "#eeb0b8", "#f9d7da", "#b76a78"], weight: 1.3 },
    tulip: { name: "Тюльпан", price: 90, pal: ["#d98f2e", "#eeb44f", "#f8d99b", "#b06d18"], weight: 0.95 },
    sunflower: { name: "Подсолнух", price: 150, pal: ["#e0a021", "#f0be3f", "#7a4a12", "#5c3410"], weight: 1.1 },
    chamomile: { name: "Ромашка", price: 70, pal: ["#ffffff", "#f6f0e4", "#e8dcc4", "#e0b93f"], weight: 0.8 },
    hydrangea: { name: "Гортензия", price: 350, pal: ["#8fa7bf", "#b7c8da", "#dbe6f0", "#6c84a0"], weight: 1.22 },
    eucalyptus: { name: "Эвкалипт", price: 60, pal: ["#5f7d66", "#8aa68d", "#bdd2be", "#47624d"], weight: 0.5 },
    lavender: { name: "Лаванда", price: 80, pal: ["#7f6f9e", "#a294bd", "#cdc3df", "#5f5179"], weight: 0.5 }
  };

  /* ---------- отрисовка цветов (стилизованные иллюстрации) ---------- */
  let UID = 0;

  function gradDef(id, pal) {
    return '<defs><radialGradient id="' + id + '" cx="46%" cy="40%" r="64%">' +
      '<stop offset="0%" stop-color="' + pal[2] + '"/><stop offset="52%" stop-color="' + pal[1] + '"/>' +
      '<stop offset="100%" stop-color="' + pal[0] + '"/></radialGradient></defs>';
  }

  function petalPath(r, wide) {
    const w = (wide || 0.34) * r;
    return "M0,0 C" + (-w).toFixed(1) + "," + (-0.48 * r).toFixed(1) + " " + (-w * 0.92).toFixed(1) + "," +
      (-0.94 * r).toFixed(1) + " 0," + (-r).toFixed(1) + " C" + (w * 0.92).toFixed(1) + "," +
      (-0.94 * r).toFixed(1) + " " + w.toFixed(1) + "," + (-0.48 * r).toFixed(1) + " 0,0 Z";
  }

  function rose(cx, cy, r, rand, pal) {
    const id = "rg" + (++UID);
    let s = '<g transform="translate(' + cx + ' ' + cy + ')">' + gradDef(id, pal);
    const petal = petalPath(r, 0.36);
    for (let i = 0; i < 6; i++) {
      s += '<g transform="rotate(' + (i * 60 + rand() * 8).toFixed(1) + ')"><path d="' + petal +
        '" fill="url(#' + id + ')" stroke="rgba(90,20,40,.07)" stroke-width="1"/></g>';
    }
    const inner = petalPath(r * 0.6, 0.38);
    for (let i = 0; i < 6; i++) {
      s += '<g transform="rotate(' + (i * 60 + 22 + rand() * 10).toFixed(1) + ')"><path d="' + inner +
        '" fill="url(#' + id + ')" stroke="rgba(90,20,40,.07)" stroke-width=".9"/></g>';
    }
    s += '<circle r="' + (r * 0.13).toFixed(1) + '" fill="' + pal[3] + '" opacity=".9"/>';
    s += '<ellipse cx="' + (-r * 0.16).toFixed(1) + '" cy="' + (-r * 0.2).toFixed(1) + '" rx="' + (r * 0.26).toFixed(1) +
      '" ry="' + (r * 0.16).toFixed(1) + '" fill="#fff" opacity=".18" transform="rotate(-28)"/>';
    return s + "</g>";
  }

  function peony(cx, cy, r, rand, pal) {
    const id = "pg" + (++UID);
    let s = '<g transform="translate(' + cx + ' ' + cy + ')">' + gradDef(id, pal);
    const petal = petalPath(r, 0.46);
    for (let i = 0; i < 9; i++) {
      s += '<g transform="rotate(' + (i * 40 + rand() * 14).toFixed(1) + ')"><path d="' + petal +
        '" fill="url(#' + id + ')" stroke="rgba(120,50,70,.07)" stroke-width="1"/></g>';
    }
    const mid = petalPath(r * 0.66, 0.4);
    for (let i = 0; i < 7; i++) {
      s += '<g transform="rotate(' + (i * 51 + 26 + rand() * 12).toFixed(1) + ')"><path d="' + mid +
        '" fill="url(#' + id + ')" stroke="rgba(120,50,70,.07)" stroke-width=".9"/></g>';
    }
    const inner = petalPath(r * 0.36, 0.36);
    for (let i = 0; i < 5; i++) {
      s += '<g transform="rotate(' + (i * 72 + rand() * 16).toFixed(1) + ')"><path d="' + inner +
        '" fill="url(#' + id + ')" stroke="rgba(120,50,70,.07)" stroke-width=".8"/></g>';
    }
    s += '<circle r="' + (r * 0.1).toFixed(1) + '" fill="' + pal[3] + '" opacity=".85"/>';
    return s + "</g>";
  }

  function tulip(cx, cy, r, rand, pal) {
    const id = "tg" + (++UID);
    const rot = (rand() - 0.5) * 22;
    let s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot.toFixed(1) + ')">' + gradDef(id, pal);
    const petal = "M0," + (r * 0.92).toFixed(1) + " C" + (-r * 0.62).toFixed(1) + "," + (r * 0.3).toFixed(1) + " " +
      (-r * 0.66).toFixed(1) + "," + (-r * 0.62).toFixed(1) + " 0," + (-r * 0.95).toFixed(1) + " C" +
      (r * 0.66).toFixed(1) + "," + (-r * 0.62).toFixed(1) + " " + (r * 0.62).toFixed(1) + "," +
      (r * 0.3).toFixed(1) + " 0," + (r * 0.92).toFixed(1) + " Z";
    s += '<g transform="rotate(-24)" opacity=".92"><path d="' + petal + '" fill="url(#' + id +
      ')" stroke="rgba(120,60,20,.08)" stroke-width="1"/></g>';
    s += '<g transform="rotate(24)" opacity=".92"><path d="' + petal + '" fill="url(#' + id +
      ')" stroke="rgba(120,60,20,.08)" stroke-width="1"/></g>';
    s += '<path d="' + petal + '" fill="url(#' + id + ')" stroke="rgba(120,60,20,.08)" stroke-width="1"/>';
    s += '<path d="M0,' + (-r * 0.62).toFixed(1) + ' C' + (r * 0.18).toFixed(1) + ',' + (-r * 0.3).toFixed(1) + ' ' +
      (r * 0.18).toFixed(1) + ',' + (r * 0.18).toFixed(1) + ' 0,' + (r * 0.55).toFixed(1) +
      ' C' + (-r * 0.18).toFixed(1) + ',' + (r * 0.18).toFixed(1) + ' ' + (-r * 0.18).toFixed(1) + ',' +
      (-r * 0.3).toFixed(1) + ' 0,' + (-r * 0.62).toFixed(1) + ' Z" fill="#fff" opacity=".18"/>';
    return s + "</g>";
  }

  function sunflower(cx, cy, r, rand, pal) {
    const rot = rand() * 12;
    let s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot.toFixed(1) + ')">';
    for (let i = 0; i < 16; i++) {
      s += '<path d="M0,' + (-r * 0.3).toFixed(1) + ' C' + (r * 0.14).toFixed(1) + ',' + (-r * 0.7).toFixed(1) +
        ' ' + (r * 0.1).toFixed(1) + ',' + (-r * 1.02).toFixed(1) + ' 0,' + (-r * 1.02).toFixed(1) +
        ' C' + (-r * 0.1).toFixed(1) + ',' + (-r * 1.02).toFixed(1) + ' ' + (-r * 0.14).toFixed(1) + ',' + (-r * 0.7).toFixed(1) +
        ' 0,' + (-r * 0.3).toFixed(1) + ' Z" fill="' + (i % 2 ? pal[1] : pal[0]) + '" transform="rotate(' + (i * 22.5).toFixed(1) + ')"/>';
    }
    s += '<circle r="' + (r * 0.42).toFixed(1) + '" fill="' + pal[2] + '"/>';
    for (let i = 0; i < 10; i++) {
      const a = i * 36;
      s += '<circle cx="' + (Math.cos(a * Math.PI / 180) * r * 0.24).toFixed(1) + '" cy="' +
        (Math.sin(a * Math.PI / 180) * r * 0.24).toFixed(1) + '" r="' + (r * 0.055).toFixed(1) +
        '" fill="' + pal[3] + '" opacity=".8"/>';
    }
    return s + "</g>";
  }

  function chamomile(cx, cy, r, rand, pal) {
    const rot = rand() * 36;
    let s = '<g transform="translate(' + cx + ' ' + cy + ')">';
    for (let i = 0; i < 11; i++) {
      s += '<ellipse cx="0" cy="' + (-r * 0.52).toFixed(1) + '" rx="' + (r * 0.17).toFixed(1) +
        '" ry="' + (r * 0.46).toFixed(1) + '" fill="' + pal[0] + '" stroke="' + pal[2] +
        '" stroke-width=".8" transform="rotate(' + (i * 32.7 + rot).toFixed(1) + ')"/>';
    }
    s += '<circle r="' + (r * 0.32).toFixed(1) + '" fill="' + pal[3] + '"/>';
    return s + "</g>";
  }

  function hydrangea(cx, cy, r, rand, pal) {
    let s = '<g transform="translate(' + cx + ' ' + cy + ')">';
    s += '<circle r="' + (r * 0.92).toFixed(1) + '" fill="' + pal[2] + '" opacity=".55"/>';
    for (let i = 0; i < 9; i++) {
      const a = i * 40 + rand() * 8;
      const rad = i === 0 ? 0 : r * (0.42 + rand() * 0.2);
      const fx = Math.cos(a * Math.PI / 180) * rad;
      const fy = Math.sin(a * Math.PI / 180) * rad;
      const fr = r * (i === 0 ? 0.3 : 0.24);
      s += '<g transform="translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ')">';
      for (let k = 0; k < 4; k++) {
        s += '<ellipse cx="0" cy="' + (-fr * 0.45).toFixed(1) + '" rx="' + (fr * 0.34).toFixed(1) +
          '" ry="' + (fr * 0.5).toFixed(1) + '" fill="' + (i % 3 === 0 ? pal[1] : pal[0]) +
          '" transform="rotate(' + (k * 90 + rand() * 12).toFixed(1) + ')"/>';
      }
      s += '<circle r="' + (fr * 0.16).toFixed(1) + '" fill="' + pal[3] + '" opacity=".6"/>';
      s += "</g>";
    }
    return s + "</g>";
  }

  function eucalyptus(cx, cy, r, rand, pal) {
    const ang = (rand() - 0.5) * 36;
    let s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + ang.toFixed(1) + ')">';
    s += '<path d="M0,' + (r * 0.9).toFixed(1) + ' L0,' + (-r * 0.8).toFixed(1) + '" stroke="' + pal[3] +
      '" stroke-width="' + Math.max(1.4, r * 0.06).toFixed(1) + '" stroke-linecap="round"/>';
    for (let i = 0; i < 6; i++) {
      const y = r * (0.55 - i * 0.26);
      const side = i % 2 ? 1 : -1;
      const lx = side * r * (0.28 + rand() * 0.12);
      s += '<ellipse cx="' + lx.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (r * 0.26).toFixed(1) +
        '" ry="' + (r * 0.2).toFixed(1) + '" fill="' + (i % 3 ? pal[0] : pal[1]) +
        '" transform="rotate(' + (side * 18).toFixed(1) + ' ' + lx.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return s + "</g>";
  }

  function lavender(cx, cy, r, rand, pal) {
    const ang = (rand() - 0.5) * 26;
    let s = '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + ang.toFixed(1) + ')">';
    s += '<path d="M0,' + (r * 1.0).toFixed(1) + ' L0,' + (-r * 0.15).toFixed(1) + '" stroke="' + pal[3] +
      '" stroke-width="' + Math.max(1.2, r * 0.05).toFixed(1) + '" stroke-linecap="round"/>';
    for (let i = 0; i < 11; i++) {
      const y = -r * 0.15 - i * r * 0.095;
      const side = i % 2 ? 1 : -1;
      s += '<ellipse cx="' + (side * r * 0.075).toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (r * 0.1).toFixed(1) +
        '" ry="' + (r * 0.065).toFixed(1) + '" fill="' + (i % 3 ? pal[0] : pal[1]) + '"/>';
    }
    return s + "</g>";
  }

  const RENDER = {
    rose: rose, white_rose: rose, peony: peony, tulip: tulip, sunflower: sunflower,
    chamomile: chamomile, hydrangea: hydrangea, eucalyptus: eucalyptus, lavender: lavender
  };

  function flower(type, cx, cy, r, rand) {
    const def = DEFS[type] || DEFS.rose;
    return RENDER[type](cx, cy, r, rand, def.pal);
  }

  /* ---------- упаковка ---------- */
  function wrapShape(kind, ribbon) {
    if (kind === "box") {
      return '<g><rect x="168" y="470" width="264" height="172" rx="12" fill="#efe4d6" stroke="#dccdb9" stroke-width="2"/>' +
        '<rect x="168" y="470" width="264" height="26" rx="10" fill="#e3d4c1"/>' +
        '<path d="M300,470 L300,642" stroke="#d6c5b0" stroke-width="2" opacity=".7"/></g>';
    }
    if (kind === "basket") {
      return '<g><path d="M196,506 Q300,392 404,506" fill="none" stroke="#c9a06a" stroke-width="9" stroke-linecap="round"/>' +
        '<rect x="168" y="500" width="264" height="142" rx="18" fill="#d9b489"/>' +
        '<rect x="168" y="500" width="264" height="16" rx="8" fill="#c39d6b"/>' +
        '<path d="M186,540 L414,540 M186,570 L414,570 M186,600 L414,600" stroke="#c39d6b" stroke-width="4" opacity=".55"/></g>';
    }
    if (kind === "film") {
      return '<g><path d="M118,412 L482,412 L352,654 Q300,676 248,654 Z" fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>' +
        '<path d="M300,412 L300,660" stroke="rgba(255,255,255,.8)" stroke-width="2"/>' +
        '<path d="M178,412 L266,660 M422,412 L334,660" stroke="rgba(255,255,255,.55)" stroke-width="2"/></g>';
    }
    return '<g><path d="M120,412 L480,412 L352,654 Q300,676 248,654 Z" fill="#dcbc8b" stroke="#c9a678" stroke-width="2"/>' +
      '<path d="M300,412 L300,660" stroke="#c9a678" stroke-width="2.5" opacity=".8"/>' +
      '<path d="M178,412 L268,660 M422,412 L332,660" stroke="#c9a678" stroke-width="2" opacity=".65"/></g>';
  }

  function ribbonBow(color) {
    return '<g transform="translate(300 452)">' +
      '<path d="M-6,0 C-52,-26 -66,12 -20,16 Z" fill="' + color + '"/>' +
      '<path d="M6,0 C52,-26 66,12 20,16 Z" fill="' + color + '"/>' +
      '<circle r="9" fill="' + color + '"/>' +
      '<path d="M-4,8 C-20,44 -30,56 -46,72 M4,8 C20,44 30,56 46,72" stroke="' + color + '" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
  }

  /* ---------- букет ---------- */
  function bouquetSVG(opts) {
    opts = opts || {};
    const items = (opts.items || []).filter(function (i) { return i.count > 0; });
    const rand = rng(opts.seed || 11);
    const wrap = opts.wrap || "kraft";
    const ribbon = opts.ribbon || "#bf6a4e";
    const flowers = [];
    items.forEach(function (it) {
      const def = DEFS[it.type] || DEFS.rose;
      for (let i = 0; i < it.count; i++) flowers.push({ type: it.type, weight: def.weight });
    });
    flowers.sort(function (a, b) { return b.weight - a.weight; });

    const rings = [
      { n: 1, rad: 0, size: 54 },
      { n: 6, rad: 84, size: 49 },
      { n: 9, rad: 138, size: 43 },
      { n: 12, rad: 184, size: 38 }
    ];
    const placed = [];
    let index = 0;
    rings.forEach(function (ring, ri) {
      const count = Math.min(ring.n, flowers.length - index);
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + ri * 0.55 + (rand() - 0.5) * 0.22;
        const rad = ring.rad * (1 + (rand() - 0.5) * 0.16);
        const f = flowers[index++];
        placed.push({
          x: 300 + Math.cos(ang) * rad,
          y: 274 + Math.sin(ang) * rad * 0.9,
          size: ring.size * (0.9 + 0.14 * f.weight) * (0.94 + rand() * 0.12),
          type: f.type
        });
      }
    });

    let s = '<svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img">';
    s += '<defs><radialGradient id="bgGrad" cx="50%" cy="38%" r="72%">' +
      '<stop offset="0%" stop-color="' + (opts.bg1 || "#f8f1e6") + '"/>' +
      '<stop offset="100%" stop-color="' + (opts.bg2 || "#f0e2d4") + '"/></radialGradient></defs>';
    s += '<rect width="600" height="700" fill="url(#bgGrad)"/>';
    s += '<circle cx="300" cy="300" r="215" fill="#fff" opacity=".28"/>';

    /* стебли */
    s += '<g stroke="#5f7d66" stroke-width="7" stroke-linecap="round" opacity=".9">';
    for (let i = -3; i <= 3; i++) {
      s += '<path d="M300,320 Q' + (300 + i * 26) + ',' + (420 + Math.abs(i) * 10) + ' ' + (300 + i * 34) + ',546"/>';
    }
    s += "</g>";

    s += wrapShape(wrap, ribbon);

    /* зелень по краю */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      s += eucalyptus(300 + Math.cos(a) * 168, 292 + Math.sin(a) * 148, 40, rand, DEFS.eucalyptus.pal);
    }

    placed.slice().reverse().forEach(function (p) {
      s += flower(p.type, p.x, p.y, p.size, rand);
    });

    s += ribbonBow(ribbon);
    s += "</svg>";
    return s;
  }

  /* ---------- миниатюра одного цветка ---------- */
  function flowerThumb(type) {
    const rand = rng(type.length * 13 + 3);
    let s = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    s += '<rect width="64" height="64" fill="#f6efe4"/>';
    if (type === "eucalyptus" || type === "lavender") {
      s += flower(type, 32, 32, 26, rand);
    } else {
      s += flower(type, 32, 32, 25, rand);
    }
    return s + "</svg>";
  }

  /* ---------- рендер всех объявленных букетов ---------- */
  function renderBouquets(root) {
    (root || document).querySelectorAll("[data-bouquet]").forEach(function (node) {
      if (node.dataset.rendered) return;
      let conf;
      try { conf = JSON.parse(node.getAttribute("data-bouquet")); } catch (e) { conf = { items: [] }; }
      node.innerHTML = bouquetSVG(conf);
      node.dataset.rendered = "1";
    });
    (root || document).querySelectorAll("[data-flower-thumb]").forEach(function (node) {
      node.innerHTML = flowerThumb(node.getAttribute("data-flower-thumb"));
    });
  }

  /* ---------- всплывающее уведомление ---------- */
  let toastTimer;
  function toast(text) {
    let node = document.querySelector(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove("is-on"); }, 2400);
  }

  /* ---------- счётчик корзины ---------- */
  function addToCart(n) {
    const badge = document.querySelector(".count-badge");
    if (badge) {
      const next = (parseInt(badge.textContent, 10) || 0) + (n || 1);
      badge.textContent = next;
      badge.style.transform = "scale(1.25)";
      setTimeout(function () { badge.style.transform = ""; }, 180);
    }
    toast("Добавлено в корзину");
  }

  /* ---------- деньги ---------- */
  function money(value) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(value)) + " \u20BD";
  }

  /* ---------- шапка: выпадающее меню, избранное, корзина ---------- */
  function initHeader() {
    document.querySelectorAll(".nav-item").forEach(function (item) {
      const link = item.querySelector(".nav-link");
      if (!link) return;
      link.addEventListener("click", function (e) {
        if (!item.querySelector(".dropdown")) return;
        e.preventDefault();
        const open = item.classList.contains("is-open");
        document.querySelectorAll(".nav-item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
        if (!open) item.classList.add("is-open");
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-item")) {
        document.querySelectorAll(".nav-item.is-open").forEach(function (n) { n.classList.remove("is-open"); });
      }
    });
    document.querySelectorAll(".fav").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle("is-on");
        toast(btn.classList.contains("is-on") ? "Добавлено в избранное" : "Убрано из избранного");
      });
    });
    document.querySelectorAll("[data-cart]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        addToCart(1);
      });
    });
  }

  /* ---------- слайдер ---------- */
  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      const slides = Array.prototype.slice.call(slider.querySelectorAll(".slide"));
      const dots = Array.prototype.slice.call(slider.querySelectorAll(".slider-dots button"));
      let current = 0;
      function show(i) {
        current = (i + slides.length) % slides.length;
        slides.forEach(function (s, k) { s.classList.toggle("is-active", k === current); });
        dots.forEach(function (d, k) { d.classList.toggle("is-active", k === current); });
      }
      dots.forEach(function (d, k) {
        d.addEventListener("click", function () { show(k); });
      });
      const prev = slider.querySelector("[data-prev]");
      const next = slider.querySelector("[data-next]");
      if (prev) prev.addEventListener("click", function () { show(current - 1); });
      if (next) next.addEventListener("click", function () { show(current + 1); });
      show(0);
      slider.__show = show;
    });
  }

  /* ---------- каталог: фильтры ---------- */
  function initCatalog() {
    const list = document.querySelector("[data-products]");
    if (!list) return;
    const cards = Array.prototype.slice.call(list.querySelectorAll(".card"));
    const countNode = document.querySelector("[data-count]");
    const empty = document.querySelector("[data-empty]");
    const range = document.querySelector("[data-price-range]");
    const rangeOut = document.querySelector("[data-price-out]");
    const sort = document.querySelector("[data-sort]");

    function apply() {
      const flowerBoxes = Array.prototype.slice.call(document.querySelectorAll('input[data-f="flower"]:checked'))
        .map(function (i) { return i.value; });
      const wrapBoxes = Array.prototype.slice.call(document.querySelectorAll('input[data-f="wrap"]:checked'))
        .map(function (i) { return i.value; });
      const occasion = document.querySelector('input[data-f="occasion"]:checked');
      const maxPrice = range ? parseInt(range.value, 10) : 10000;
      let shown = 0;
      cards.forEach(function (card) {
        const tags = (card.dataset.flowers || "").split(" ");
        const wraps = (card.dataset.wrap || "").split(" ");
        const okFlower = !flowerBoxes.length || flowerBoxes.some(function (f) { return tags.indexOf(f) >= 0; });
        const okWrap = !wrapBoxes.length || wrapBoxes.some(function (w) { return wraps.indexOf(w) >= 0; });
        const okOccasion = !occasion || occasion.value === "all" || (card.dataset.occasion || "").split(" ").indexOf(occasion.value) >= 0;
        const okPrice = parseInt(card.dataset.price, 10) <= maxPrice;
        const visible = okFlower && okWrap && okOccasion && okPrice;
        card.hidden = !visible;
        if (visible) shown++;
      });
      if (countNode) countNode.textContent = shown;
      if (empty) empty.hidden = shown > 0;
    }

    document.querySelectorAll('input[data-f="flower"], input[data-f="occasion"], input[data-f="wrap"]').forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.type === "radio") {
          document.querySelectorAll('input[data-f="occasion"]').forEach(function (r) { r.checked = r === input; });
        }
        apply();
      });
    });
    if (range) {
      range.addEventListener("input", function () {
        if (rangeOut) rangeOut.textContent = money(range.value);
        apply();
      });
    }
    const reset = document.querySelector("[data-reset]");
    if (reset) {
      reset.addEventListener("click", function () {
        document.querySelectorAll('input[data-f="flower"], input[data-f="wrap"]').forEach(function (i) { i.checked = false; });
        const all = document.querySelector('input[data-f="occasion"][value="all"]');
        if (all) all.checked = true;
        if (range) { range.value = range.max; if (rangeOut) rangeOut.textContent = money(range.max); }
        apply();
      });
    }
    if (sort) {
      sort.addEventListener("change", function () {
        const mode = sort.value;
        const sorted = cards.slice().sort(function (a, b) {
          const pa = parseInt(a.dataset.price, 10);
          const pb = parseInt(b.dataset.price, 10);
          if (mode === "cheap") return pa - pb;
          if (mode === "expensive") return pb - pa;
          return 0;
        });
        sorted.forEach(function (c) { list.appendChild(c); });
      });
    }
    const pages = document.querySelectorAll(".page-btn:not(.arrow)");
    pages.forEach(function (p) {
      p.addEventListener("click", function () {
        if (p.textContent === "\u2026") return;
        pages.forEach(function (x) { x.classList.remove("is-active"); });
        p.classList.add("is-active");
        window.scrollTo({ top: 260, behavior: "smooth" });
      });
    });
    apply();
  }

  /* ---------- конструктор букета ---------- */
  const WRAP_PRICES = { kraft: 0, film: 150, box: 350, basket: 600 };
  const WRAP_NAMES = { kraft: "Крафт-бумага", film: "Матовая плёнка", box: "Шляпная коробка", basket: "Плетёная корзина" };

  function initBuilder() {
    const root = document.querySelector("[data-builder]");
    if (!root) return;
    const state = {
      counts: {}, wrap: "film", ribbon: "#bf6a4e", card: false, text: "", toy: false, delivery: true
    };
    root.querySelectorAll("[data-flower]").forEach(function (row) {
      state.counts[row.dataset.flower] = parseInt(row.dataset.count || "0", 10);
    });

    const preview = root.querySelector("[data-preview]");
    const lines = root.querySelector("[data-lines]");
    const wrapList = root.querySelector("[data-wraps]");
    const totalNode = root.querySelector("[data-total]");
    const steppers = root.querySelectorAll("[data-flower] .stepper");

    function compose() {
      const items = Object.keys(state.counts).map(function (k) {
        return { type: k, count: state.counts[k] };
      }).filter(function (i) { return i.count > 0; });
      return items;
    }

    function render() {
      const items = compose();
      if (preview) {
        preview.innerHTML = items.length
          ? bouquetSVG({ items: items, wrap: state.wrap, ribbon: state.ribbon, seed: 23 })
          : '<svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="700" fill="none"/><text x="300" y="360" text-anchor="middle" font-family="Georgia" font-size="22" fill="#a89e8e">Выберите цветы слева</text></svg>';
      }
      let flowersSum = 0;
      let flowersCount = 0;
      if (lines) {
        lines.innerHTML = items.length ? "" : '<li class="empty">Пока ничего не выбрано</li>';
        items.forEach(function (it) {
          const def = DEFS[it.type];
          const sum = def.price * it.count;
          flowersSum += sum;
          flowersCount += it.count;
          if (lines) {
            lines.innerHTML += "<li><span>" + def.name + " \u00D7 " + it.count + "</span><b>" + money(sum) + "</b></li>";
          }
        });
      }
      const wrapPrice = WRAP_PRICES[state.wrap] || 0;
      const cardPrice = state.card ? 120 : 0;
      const toyPrice = state.toy ? 490 : 0;
      const deliveryPrice = state.delivery ? 350 : 0;
      const total = flowersSum + wrapPrice + cardPrice + toyPrice + deliveryPrice;

      const nodeWrap = root.querySelector("[data-line-wrap]");
      if (nodeWrap) nodeWrap.innerHTML = '<span>' + WRAP_NAMES[state.wrap] + "</span><b>" + (wrapPrice ? money(wrapPrice) : "включено") + "</b>";
      const nodeCard = root.querySelector("[data-line-card]");
      if (nodeCard) nodeCard.innerHTML = state.card ? "<span>Открытка с текстом</span><b>" + money(cardPrice) + "</b>" : "";
      const nodeToy = root.querySelector("[data-line-toy]");
      if (nodeToy) nodeToy.innerHTML = state.toy ? "<span>Плюшевый мишка</span><b>" + money(toyPrice) + "</b>" : "";
      const nodeDel = root.querySelector("[data-line-delivery]");
      if (nodeDel) nodeDel.innerHTML = state.delivery ? "<span>Доставка по Туле</span><b>" + money(deliveryPrice) + "</b>" : "<span>Самовывоз</span><b>0 \u20BD</b>";
      const nodeCount = root.querySelector("[data-flowers-count]");
      if (nodeCount) nodeCount.textContent = flowersCount;
      if (totalNode) totalNode.textContent = money(total);
      const cta = root.querySelector("[data-builder-cta]");
      if (cta) cta.textContent = "Добавить в корзину \u2014 " + money(total);

      root.querySelectorAll("[data-flower]").forEach(function (row) {
        const count = state.counts[row.dataset.flower];
        row.querySelector(".val").textContent = count;
        const def = DEFS[row.dataset.flower];
        row.querySelector(".flower-sum").textContent = count ? money(def.price * count) : "\u2014";
      });
    }

    steppers.forEach(function (stepper) {
      const type = stepper.closest("[data-flower]").dataset.flower;
      stepper.querySelector("[data-plus]").addEventListener("click", function () {
        state.counts[type] = Math.min(99, state.counts[type] + 1);
        render();
      });
      stepper.querySelector("[data-minus]").addEventListener("click", function () {
        state.counts[type] = Math.max(0, state.counts[type] - 1);
        render();
      });
    });

    if (wrapList) {
      wrapList.querySelectorAll('input[name="wrap"]').forEach(function (input) {
        input.addEventListener("change", function () {
          state.wrap = input.value;
          render();
        });
      });
    }

    root.querySelectorAll("[data-ribbon]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.ribbon = btn.dataset.ribbon;
        root.querySelectorAll("[data-ribbon]").forEach(function (b) { b.classList.toggle("is-on", b === btn); });
        render();
      });
    });

    const cardCheck = root.querySelector("[data-card-check]");
    const cardText = root.querySelector("[data-card-text]");
    const cardCounter = root.querySelector("[data-card-counter]");
    if (cardCheck) {
      cardCheck.addEventListener("change", function () {
        state.card = cardCheck.checked;
        if (cardText) cardText.style.display = state.card ? "block" : "none";
        if (cardCounter) cardCounter.style.display = state.card ? "block" : "none";
        render();
      });
    }
    if (cardText) {
      cardText.addEventListener("input", function () {
        state.text = cardText.value;
        const counter = root.querySelector("[data-card-counter]");
        if (counter) counter.textContent = cardText.value.length + " / 120";
      });
    }
    const toyCheck = root.querySelector("[data-toy-check]");
    if (toyCheck) {
      toyCheck.addEventListener("change", function () { state.toy = toyCheck.checked; render(); });
    }
    const deliveryCheck = root.querySelector("[data-delivery-check]");
    if (deliveryCheck) {
      deliveryCheck.addEventListener("change", function () { state.delivery = deliveryCheck.checked; render(); });
    }
    const cta = root.querySelector("[data-builder-cta]");
    if (cta) cta.addEventListener("click", function () { addToCart(1); });

    render();
    window.__builder = { state: state, render: render };
  }

  /* ---------- календарь доставки ---------- */
  const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const WEEK = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];

  function buildCalendar() {
    const host = document.querySelector("[data-calendar]");
    if (!host) return;
    const months = (host.dataset.months || "").split(",");
    const minDate = host.dataset.min || "2026-11-18";
    let html = "";
    months.forEach(function (key) {
      const parts = key.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const first = new Date(year, month, 1);
      const offset = (first.getDay() + 6) % 7;
      const days = new Date(year, month + 1, 0).getDate();
      html += '<div class="cal"><div class="cal-head"><b>' + MONTHS[month] + " " + year + "</b></div>";
      html += "<table><thead><tr>";
      WEEK.forEach(function (w) { html += "<th>" + w + "</th>"; });
      html += "</tr></thead><tbody><tr>";
      for (let i = 0; i < offset; i++) html += "<td></td>";
      let cell = offset;
      for (let d = 1; d <= days; d++) {
        const iso = key + "-" + (d < 10 ? "0" + d : d);
        const muted = iso < minDate;
        html += '<td><button class="day' + (muted ? " is-muted" : "") + '" type="button" data-date="' + iso + '"' +
          (muted ? ' disabled tabindex="-1"' : "") + ">" + d + "</button></td>";
        cell++;
        if (cell % 7 === 0 && d !== days) html += '</tr><tr>';
      }
      html += "</tr></tbody></table></div>";
    });
    host.innerHTML = html;
  }

  function initCalendar() {
    const root = document.querySelector("[data-calendar]");
    if (!root) return;
    const out = document.querySelector("[data-range-out]");
    let start = null;
    let end = null;

    const days = Array.prototype.slice.call(root.querySelectorAll(".day:not(.is-muted)"));
    days.forEach(function (day) {
      day.addEventListener("click", function () {
        const value = day.dataset.date;
        if (!start || (start && end)) {
          start = value;
          end = null;
        } else if (value < start) {
          end = start;
          start = value;
        } else if (value === start) {
          start = value;
        } else {
          end = value;
        }
        paint();
      });
    });

    function paint() {
      days.forEach(function (d) {
        const v = d.dataset.date;
        d.classList.remove("is-start", "is-end", "in-range", "start", "end");
        if (start && v === start) { d.classList.add("is-start", "in-range", "start"); }
        if (end && v === end) { d.classList.add("is-end", "in-range", "end"); }
        if (start && end && v > start && v < end) { d.classList.add("in-range"); }
      });
      if (out) {
        out.textContent = start
          ? (end ? start.split("-").reverse().join(".") + " \u2014 " + end.split("-").reverse().join(".") : start.split("-").reverse().join("."))
          : "не выбран";
      }
      const next = document.querySelector("[data-cal-next]");
      if (next) next.disabled = !start;
    }

    document.querySelectorAll(".slot").forEach(function (slot) {
      slot.addEventListener("click", function () {
        document.querySelectorAll(".slot").forEach(function (s) { s.classList.remove("is-on"); });
        slot.classList.add("is-on");
      });
    });
    document.querySelectorAll(".tariff").forEach(function (tariff) {
      tariff.addEventListener("click", function () {
        document.querySelectorAll(".tariff").forEach(function (t) { t.classList.remove("is-on"); });
        tariff.classList.add("is-on");
        const input = tariff.querySelector("input");
        if (input) input.checked = true;
      });
    });
    paint();
  }

  /* ---------- формы и чипы ---------- */
  function initForms() {
    document.querySelectorAll("[data-chips]").forEach(function (group) {
      group.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          group.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-on"); });
          chip.classList.add("is-on");
        });
      });
    });
    document.querySelectorAll("[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        toast("Заявка отправлена, флорист свяжется с вами");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderBouquets(document);
    buildCalendar();
    initHeader();
    initSliders();
    initCatalog();
    initBuilder();
    initCalendar();
    initForms();
  });

  window.Fleur = { bouquetSVG: bouquetSVG, flowerThumb: flowerThumb, renderBouquets: renderBouquets, money: money };
})();
