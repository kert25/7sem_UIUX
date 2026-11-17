/* ===========================================================================
   Fleur Builder — общие помощники: шрифты, цвета, компоненты, шапка, подвал.
   Файл собирается в code.js скриптом build_plugin.mjs.
   =========================================================================== */

const W = 1440;      // ширина экрана
const M = 100;       // поле страницы
const CW = 1240;     // ширина контента

const C = {
  ink: "#221F1A",
  muted: "#736C61",
  line: "#E7DFD1",
  cream: "#FBF7F0",
  cream2: "#F4EDE1",
  white: "#FFFFFF",
  green: "#1E3A2B",
  green2: "#2F5D45",
  blush: "#F4DED9",
  rose: "#D98E86",
  terra: "#BF6A4E",
  gold: "#C8A25A",
  block: "#EDE4D5",
  blockLine: "#C3B4A0",
  blockText: "#7D7264"
};

function hex(h) {
  const s = h.replace("#", "");
  return {
    r: parseInt(s.slice(0, 2), 16) / 255,
    g: parseInt(s.slice(2, 4), 16) / 255,
    b: parseInt(s.slice(4, 6), 16) / 255
  };
}

function fill(h, opacity) {
  return { type: "SOLID", color: hex(h), opacity: opacity === undefined ? 1 : opacity };
}

/* ---------- шрифты ---------- */
let FONTS = null;

async function resolveFonts() {
  const available = await figma.listAvailableFontsAsync();
  function pick(family, styles) {
    const fam = available.filter((f) => f.fontName.family === family);
    if (!fam.length) return null;
    for (const st of styles) {
      const hit = fam.find((f) => f.fontName.style === st);
      if (hit) return hit.fontName;
    }
    return fam[0].fontName;
  }
  const serif = pick("Georgia", ["Regular", "Book"]) || pick("Inter", ["Regular"]);
  const serifBold = pick("Georgia", ["Bold"]) || pick("Inter", ["Bold"]);
  const sans = pick("Segoe UI", ["Regular"]) || pick("Inter", ["Regular"]);
  const sansBold = pick("Segoe UI", ["Bold", "Semibold"]) || pick("Inter", ["Bold"]);
  const list = [serif, serifBold, sans, sansBold];
  const seen = {};
  for (const f of list) {
    const key = f.family + "/" + f.style;
    if (!seen[key]) {
      seen[key] = true;
      await figma.loadFontAsync(f);
    }
  }
  FONTS = { serif, serifBold, sans, sansBold };
  return FONTS;
}

/* ---------- текстовые и цветовые стили ---------- */
const STYLES = {};

/* повторный запуск не должен падать на занятых именах стилей */
async function dropStyles(prefix) {
  let list = [];
  if (typeof figma.getLocalTextStylesAsync === "function") {
    list = await figma.getLocalTextStylesAsync();
  } else if (typeof figma.getLocalTextStyles === "function") {
    list = figma.getLocalTextStyles();
  }
  let removed = 0;
  for (const s of list) {
    if (s.name.indexOf(prefix) === 0) { s.remove(); removed++; }
  }
  return removed;
}

async function dropPaintStyles(prefix) {
  let list = [];
  if (typeof figma.getLocalPaintStylesAsync === "function") {
    list = await figma.getLocalPaintStylesAsync();
  } else if (typeof figma.getLocalPaintStyles === "function") {
    list = figma.getLocalPaintStyles();
  }
  let removed = 0;
  for (const s of list) {
    if (s.name.indexOf(prefix) === 0) { s.remove(); removed++; }
  }
  return removed;
}

async function clearStyles() {
  const t = await dropStyles("Текст/");
  const p = await dropPaintStyles("Цвет/");
  return t + "/" + p;
}

function makePaint(name, color, opacity) {
  const s = figma.createPaintStyle();
  s.name = "Цвет/" + name;
  s.paints = [fill(color, opacity)];
  STYLES["paint:" + name] = s;
  return s;
}

function describeErr(e) {
  if (!e) return "пустая ошибка";
  return [e.name, e.message, String(e)].filter(function (x) { return x && String(x).length; }).join(" | ");
}

function makeText(name, font, size, lineHeight, color) {
  if (!font || !font.family) throw new Error("шрифт не найден для стиля " + name + ": " + JSON.stringify(font));
  let s;
  try {
    s = figma.createTextStyle();
  } catch (e) {
    throw new Error("createTextStyle " + name + ": " + describeErr(e));
  }
  s.name = "Текст/" + name;
  const steps = [
    ["fontName", function () { s.fontName = font; }],
    ["fontSize", function () { s.fontSize = size; }],
    ["lineHeight", function () { s.lineHeight = { unit: "PERCENT", value: lineHeight }; }]
  ];
  /* в актуальной Figma у TextStyle нет свойства fills — цвет задаётся на текстовом слое */
  if ("fills" in s) steps.push(["fills", function () { s.fills = [fill(color || C.ink)]; }]);
  for (const step of steps) {
    try {
      step[1]();
    } catch (e) {
      throw new Error("стиль " + name + " шаг " + step[0] + ": " + describeErr(e) +
        " (тип=" + (s && s.type) + ", extensible=" + (s ? Object.isExtensible(s) : "?") + ")");
    }
  }
  STYLES["text:" + name] = s;
  return s;
}

function buildStyles() {
  makePaint("Тёмная зелень", C.green);
  makePaint("Сливочный фон", C.cream);
  makePaint("Пудровый", C.blush);
  makePaint("Терракота", C.terra);
  makePaint("Золото", C.gold);
  makePaint("Тёплый серый", C.muted);

  makeText("H1", FONTS.serif, 58, 105);
  makeText("H2", FONTS.serif, 36, 115);
  makeText("H3", FONTS.serif, 22, 130);
  makeText("Основной", FONTS.sans, 16, 155);
  makeText("Мелкий", FONTS.sans, 13, 150, C.muted);
}

/* ---------- базовые элементы ---------- */
function rect(parent, x, y, w, h, color, radius, opts) {
  opts = opts || {};
  const r = figma.createRectangle();
  parent.appendChild(r);
  r.resize(Math.max(1, w), Math.max(1, h));
  r.x = x;
  r.y = y;
  r.cornerRadius = radius || 0;
  r.fills = color ? [fill(color, opts.opacity)] : [];
  if (opts.stroke) {
    r.strokes = [fill(opts.stroke)];
    r.strokeWeight = opts.sw || 1;
    if (opts.dash) r.dashPattern = [6, 4];
    r.strokeAlign = "INSIDE";
  }
  return r;
}

function circle(parent, x, y, d, color, opts) {
  opts = opts || {};
  const c = figma.createEllipse();
  parent.appendChild(c);
  c.resize(d, d);
  c.x = x;
  c.y = y;
  c.fills = color ? [fill(color, opts.opacity)] : [];
  if (opts.stroke) {
    c.strokes = [fill(opts.stroke)];
    c.strokeWeight = opts.sw || 1;
    c.strokeAlign = "INSIDE";
  }
  return c;
}

function txt(parent, s, x, y, opts) {
  opts = opts || {};
  const t = figma.createText();
  parent.appendChild(t);
  t.fontName = opts.serif ? (opts.bold ? FONTS.serifBold : FONTS.serif) : (opts.bold ? FONTS.sansBold : FONTS.sans);
  t.characters = s;
  t.fontSize = opts.size || 16;
  t.lineHeight = { unit: "PERCENT", value: opts.lh || 145 };
  if (opts.ls) t.letterSpacing = { unit: "PIXELS", value: opts.ls };
  if (opts.style && STYLES["text:" + opts.style]) t.textStyleId = STYLES["text:" + opts.style].id;
  t.fills = [fill(opts.color || C.ink, opts.opacity)];
  if (opts.w) {
    t.textAutoResize = "HEIGHT";
    t.resize(opts.w, 8);
    if (opts.align) t.textAlignHorizontal = opts.align;
  } else {
    t.textAutoResize = "WIDTH_AND_HEIGHT";
  }
  t.x = x;
  t.y = y;
  return t;
}

function txtRight(parent, s, xRight, y, opts) {
  opts = opts || {};
  const width = opts.w || 420;
  return txt(parent, s, xRight - width, y, Object.assign({}, opts, { w: width, align: "RIGHT" }));
}

function icon(parent, name, x, y, size, color) {
  const path = ICONS[name];
  if (!path) return null;
  const svg =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
  const node = figma.createNodeFromSvg(svg);
  parent.appendChild(node);
  node.rescale(size / 24);
  node.x = x;
  node.y = y;
  return node;
}

const ICONS = {
  truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
  camera: '<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.4"/><path d="M8 6l1.6-2h4.8L16 6"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  card: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M2.5 10h19"/>',
  heart: '<path d="M12 20s-7-4.4-7-9a3.8 3.8 0 017-2.1A3.8 3.8 0 0119 11c0 4.6-7 9-7 9z"/>',
  bag: '<path d="M6 8h12l-1.2 11H7.2z"/><path d="M9 8V6.5a3 3 0 016 0V8"/>',
  flower: '<circle cx="12" cy="8.5" r="2.4"/><path d="M12 6.1C12 3.8 9.8 3 8.8 4.2 7.6 5.6 9 7.4 11 8M12 6.1c0-2.3 2.2-3.1 3.2-1.9 1.2 1.4-.2 3.2-2.2 3.8M9.8 10.5C7.6 10 6.3 12 7.3 13.3c1.1 1.4 3.2.6 3.9-1.3M14.2 10.5c2.2-.5 3.5 1.5 2.5 2.8-1.1 1.4-3.2.6-3.9-1.3M12 14v6"/>',
  leaf: '<path d="M12 21c0-6 3-10 8-11-1 6-4 9-8 11zM12 21C12 15 9 11 4 10c1 6 4 9 8 11z"/>',
  user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c1.4-3.6 4-5 7-5s5.6 1.4 7 5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  check: '<path d="M5 12l4.5 4.5L19 7"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M4 13h16M12 9v11M8.5 9a2.4 2.4 0 010-4.8C10.6 4.2 12 9 12 9s1.4-4.8 3.5-4.8a2.4 2.4 0 010 4.8"/>',
  palette: '<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="15" cy="10" r="1"/>'
};

/* ---------- тень ---------- */
function shadow(node) {
  node.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0.12, g: 0.23, b: 0.17, a: 0.16 },
    offset: { x: 0, y: 18 },
    radius: 40,
    spread: 0,
    visible: true,
    blendMode: "NORMAL"
  }];
}

/* ---------- кнопки и метки ---------- */
function button(parent, x, y, w, h, label, kind, opts) {
  opts = opts || {};
  const f = figma.createFrame();
  parent.appendChild(f);
  f.name = "Кнопка / " + label;
  f.resize(w, h);
  f.x = x;
  f.y = y;
  f.cornerRadius = h / 2;
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisAlignItems = "CENTER";
  f.counterAxisAlignItems = "CENTER";
  f.paddingLeft = 0;
  f.paddingRight = 0;
  f.fills = kind === "primary" ? [fill(C.green)] : kind === "terra" ? [fill(C.terra)] :
    kind === "soft" ? [fill(C.white)] : [];
  if (kind === "outline") {
    f.strokes = [fill(C.ink)];
    f.strokeWeight = 1;
    f.strokeAlign = "INSIDE";
  }
  if (kind === "soft") {
    f.strokes = [fill(C.line)];
    f.strokeWeight = 1;
    f.strokeAlign = "INSIDE";
  }
  const t = figma.createText();
  f.appendChild(t);
  t.fontName = opts.serif ? FONTS.serif : FONTS.sansBold;
  t.characters = label;
  t.fontSize = opts.size || 15;
  t.fills = [fill(kind === "primary" || kind === "terra" ? C.cream : C.ink)];
  f.resize(w, h);
  return f;
}

function tag(parent, x, y, label, kind) {
  const padX = 10;
  const t = txt(parent, label, 0, 0, { size: 11, bold: true, color: kind === "terra" ? "#FFFFFF" : C.green, ls: 0.4 });
  const w = t.width + padX * 2;
  const h = 24;
  const f = figma.createFrame();
  parent.appendChild(f);
  f.resize(w, h);
  f.x = x;
  f.y = y;
  f.cornerRadius = 12;
  f.layoutMode = "HORIZONTAL";
  f.primaryAxisAlignItems = "CENTER";
  f.counterAxisAlignItems = "CENTER";
  f.fills = kind === "terra" ? [fill(C.terra)] : [fill(C.white)];
  if (kind !== "terra") {
    f.strokes = [fill(C.line)];
    f.strokeWeight = 1;
    f.strokeAlign = "INSIDE";
  }
  t.remove();
  const tt = figma.createText();
  f.appendChild(tt);
  tt.fontName = FONTS.sansBold;
  tt.characters = label;
  tt.fontSize = 11;
  tt.letterSpacing = { unit: "PIXELS", value: 0.4 };
  tt.fills = [fill(kind === "terra" ? "#FFFFFF" : C.green)];
  f.resize(w, h);
  return f;
}

/* ---------- иллюстрации ---------- */
const MASTERS = {};

function bouquet(parent, key, x, y, width) {
  const svg = BOUQUETS[key];
  if (!svg) return null;
  let master = MASTERS[key];
  if (!master) {
    master = figma.createNodeFromSvg(svg);
    master.name = "bouquet/" + key;
    master.visible = false;
    servicePage.appendChild(master);
    master.x = 4000 + Object.keys(MASTERS).length * 620;
    master.y = 4000;
    MASTERS[key] = master;
  }
  const node = master.clone();
  parent.appendChild(node);
  node.visible = true;
  node.rescale(width / 600);
  node.x = x;
  node.y = y;
  return node;
}

/* ---------- рамки страниц ---------- */
function pageFrame(page, name, x, y, w, h, bg) {
  const f = figma.createFrame();
  page.appendChild(f);
  f.name = name;
  f.resize(w, h);
  f.x = x;
  f.y = y;
  f.fills = [fill(bg || C.cream)];
  f.clipsContent = true;
  f.layoutMode = "NONE";
  return f;
}

/* ---------- шапка и подвал ---------- */
function buildHeader(page, activeIdx) {
  rect(page, 0, 0, W, 40, C.green);
  icon(page, "truck", M, 12, 16, "#E6DFD0");
  txt(page, "Доставка по Туле за 2 часа", M + 26, 9, { size: 13, color: "#E6DFD0" });
  icon(page, "camera", M + 262, 12, 16, "#E6DFD0");
  txt(page, "Фото букета перед отправкой", M + 288, 9, { size: 13, color: "#E6DFD0" });
  txtRight(page, "Ежедневно 8:00–22:00", W - M - 150, 9, { size: 13, color: "#E6DFD0", w: 150 });
  txtRight(page, "Личный кабинет", W - M, 9, { size: 13, color: "#E6DFD0", w: 120 });

  rect(page, 0, 40, W, 84, C.cream);
  rect(page, 0, 123, W, 1, C.line);

  circle(page, M, 59, 46, C.green);
  icon(page, "flower", M + 10, 69, 26, "#F4ECDD");
  txt(page, "Флёр", M + 58, 54, { serif: true, size: 27, lh: 100 });
  txt(page, "ЦВЕТОЧНАЯ МАСТЕРСКАЯ", M + 59, 88, { size: 10, color: C.muted, ls: 2 });

  const nav = ["Каталог", "Собрать букет", "Свадебные", "Флорист", "Доставка"];
  let nx = M + 290;
  nav.forEach((label, i) => {
    const active = i === activeIdx;
    const t = txt(page, label, nx, 61, { size: 15, bold: active, color: active ? C.green : C.ink });
    if (active) rect(page, t.x, 84, t.width, 2, C.green);
    nx = t.x + t.width + 30;
  });

  txtRight(page, "+7 (4872) 55-08-14", W - M - 120, 55, { size: 15, bold: true, w: 210 });
  txtRight(page, "звонок бесплатный", W - M - 120, 79, { size: 11, color: C.muted, w: 210 });

  circle(page, W - M - 108, 60, 44, C.white, { stroke: C.line });
  icon(page, "heart", W - M - 96, 72, 20, C.green);
  circle(page, W - M - 54, 60, 44, C.white, { stroke: C.line });
  icon(page, "bag", W - M - 42, 72, 20, C.green);
  circle(page, W - M - 52, 55, 19, C.terra);
  txt(page, "2", W - M - 49, 58, { size: 11, bold: true, color: "#FFFFFF" });
}

function buildFooter(page, y) {
  rect(page, 0, y, W, 520, C.green);
  circle(page, M, y + 56, 46, C.green2);
  icon(page, "flower", M + 10, y + 66, 26, "#F4ECDD");
  txt(page, "Флёр", M + 58, y + 51, { serif: true, size: 27, lh: 100, color: "#FFFFFF" });
  txt(page, "ЦВЕТОЧНАЯ МАСТЕРСКАЯ", M + 59, y + 85, { size: 10, color: "#A9A091", ls: 2 });
  txt(page, "Тула, ул. Менделеевская, 11.\nЕжедневно 8:00–22:00.", M, y + 120, { size: 13.5, color: "#B5AC9B", w: 300, lh: 165 });

  rect(page, M, y + 190, 280, 46, C.white, 23, { opacity: 0.07, stroke: "#3B5A49" });
  txt(page, "Почта для новостей", M + 20, y + 203, { size: 13, color: "#A9A091" });
  button(page, M + 292, y + 190, 132, 46, "Подписаться", "terra", { size: 14 });

  const cols = [
    { x: M + 520, title: "Каталог", items: ["Готовые букеты", "Собрать свой", "Свадебные букеты", "Подарки и открытки"] },
    { x: M + 760, title: "Помощь", items: ["Доставка и оплата", "Вопросы и ответы", "Услуги флориста", "Возврат букета"] },
    { x: M + 1000, title: "Контакты", items: ["+7 (4872) 55-08-14", "hello@fleur-tula.ru", "Telegram", "ВКонтакте"] }
  ];
  cols.forEach((col) => {
    txt(page, col.title, col.x, y + 56, { serif: true, size: 17, color: "#FFFFFF" });
    col.items.forEach((item, i) => {
      txt(page, item, col.x, y + 92 + i * 26, { size: 14, color: "#C8BFAE" });
    });
  });

  rect(page, M, y + 452, CW, 1, "#3B5A49");
  txt(page, "© 2026 Флёр. Цветочная мастерская, Тула.", M, y + 470, { size: 12.5, color: "#A9A091" });
  const pays = ["Visa", "Mastercard", "МИР", "СБП"];
  let px = W - M - 250;
  pays.forEach((p) => {
    const t = txt(page, p, px, y + 470, { size: 11, color: "#A9A091" });
    rect(page, px - 8, y + 466, t.width + 16, 22, C.white, 6, { opacity: 0.06, stroke: "#3B5A49" });
    t.y = y + 470;
    px = t.x + t.width + 16;
  });
}

/* ---------- заголовки секций ---------- */
function sectionHead(page, x, y, eyebrow, title, subtitle, width) {
  txt(page, eyebrow, x, y, { size: 12, color: C.terra, bold: true, ls: 2.2 });
  const t = txt(page, title, x, y + 22, { serif: true, size: 36, lh: 115, w: width || CW });
  let bottom = t.y + t.height;
  if (subtitle) {
    const s = txt(page, subtitle, x, bottom + 8, { size: 15, color: C.muted, w: width || 620 });
    bottom = s.y + s.height;
  }
  return bottom;
}

/* ---------- карточка товара ---------- */
function productCard(page, x, y, w, conf) {
  const artH = conf.artH || Math.round(w * 0.9);
  const h = conf.h || artH + 150;
  const card = figma.createFrame();
  page.appendChild(card);
  card.name = "Карточка / " + conf.title;
  card.resize(w, h);
  card.x = x;
  card.y = y;
  card.cornerRadius = 18;
  card.fills = [fill(C.white)];
  card.strokes = [fill(C.line)];
  card.strokeWeight = 1;
  card.strokeAlign = "INSIDE";
  card.clipsContent = true;

  /* фотография букета живёт в отдельном обрезающем фрейме: иначе вектор
     (600×700 при ширине карточки) вылезает ниже зоны фото и наезжает на текст */
  const art = figma.createFrame();
  card.appendChild(art);
  art.name = "Фото";
  art.resize(w, artH);
  art.x = 0;
  art.y = 0;
  art.cornerRadius = 0;
  art.fills = [fill(conf.artBg || "#F6EFE4")];
  art.clipsContent = true;
  art.layoutMode = "NONE";
  circle(art, w / 2 - artH * 0.36, 20, artH * 0.72, "#FFFFFF", { opacity: 0.28 });
  bouquet(art, conf.bouquet, 6, 4, w - 12);
  if (conf.tag) tag(card, 12, 12, conf.tag, conf.tagKind);
  circle(card, w - 46, 12, 34, C.white);
  icon(card, "heart", w - 37, 21, 17, C.green);

  txt(card, conf.title, 16, artH + 16, { serif: true, size: 19, w: w - 32 });
  txt(card, conf.desc, 16, artH + 46, { size: 13, color: C.muted, w: w - 32, lh: 145 });
  txt(card, conf.price, 16, h - 40, { size: 19, bold: true });
  const bw = conf.btnW || 108;
  button(card, w - bw - 16, h - 50, bw, 38, conf.btn || "В корзину", "outline", { size: 13 });
  return card;
}

/* ---------- мелкие помощники ---------- */
function dashed(parent, x, y, w, h, label) {
  const r = rect(parent, x, y, w, h, C.block, 6, { stroke: C.blockLine, dash: true });
  if (label) {
    const t = txt(parent, label, x + 10, y + h / 2 - 8, { size: 11, color: C.blockText, w: w - 20, align: "CENTER" });
  }
  return r;
}

function zoneBadge(parent, x, y, n) {
  circle(parent, x - 8, y - 8, 22, C.terra);
  txt(parent, String(n), x + 1, y - 2, { size: 11, bold: true, color: "#FFFFFF" });
}
