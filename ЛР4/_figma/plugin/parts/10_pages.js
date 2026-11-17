/* ===========================================================================
   Экраны макета: главная, каталог, конструктор, доставка, свадебные, флорист.
   =========================================================================== */

function money(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

function tableBlock(page, x, y, w, cols, rows, opts) {
  opts = opts || {};
  const rowH = opts.rowH || 46;
  const total = cols.reduce((s, c) => s + c.width, 0);
  const scale = w / total;
  const widths = cols.map((c) => Math.round(c.width * scale));

  rect(page, x, y, w, rowH, C.cream, 10);
  let cx = x;
  cols.forEach((c, i) => {
    txt(page, c.title, cx + 14, y + 14, { size: 11, bold: true, color: C.muted, ls: 1 });
    cx += widths[i];
  });

  rows.forEach((row, ri) => {
    const ry = y + rowH + ri * rowH;
    rect(page, x, ry, w, rowH, C.white);
    let rx = x;
    row.forEach((cell, ci) => {
      txt(page, cell, rx + 14, ry + 13, {
        size: ci === 0 ? 14 : 13.5,
        bold: ci === 0,
        color: ci === 0 ? C.ink : C.muted,
        w: widths[ci] - 24
      });
      rx += widths[ci];
    });
    rect(page, x, ry + rowH - 1, w, 1, C.line);
  });
  rect(page, x, y + rowH + rows.length * rowH - 1, w, 1, C.line);
  return y + rowH + rows.length * rowH;
}

function checkLine(page, x, y, label, checked, count) {
  rect(page, x, y + 2, 18, 18, checked ? C.green : C.white, 5, { stroke: checked ? C.green : "#C9BFAE" });
  if (checked) icon(page, "check", x + 3, y + 5, 12, "#FFFFFF");
  txt(page, label, x + 28, y, { size: 14.5 });
  if (count) txtRight(page, count, x + 250, y + 1, { size: 12, color: C.muted, w: 40 });
}

function radioLine(page, x, y, label, on) {
  circle(page, x, y + 2, 18, C.white, { stroke: on ? C.green : "#C9BFAE" });
  if (on) circle(page, x + 4, y + 6, 10, C.green);
  txt(page, label, x + 28, y, { size: 14.5, color: on ? C.ink : C.ink });
}

/* ---------------------------------------------------------------- ГЛАВНАЯ */
function buildHome(page) {
  const f = pageFrame(page, "01 Главная", 0, 0, W, 3360);
  buildHeader(f, 0);

  /* герой */
  txt(f, "ЦВЕТОЧНАЯ МАСТЕРСКАЯ В ТУЛЕ", M, 170, { size: 12, color: C.terra, bold: true, ls: 2.2 });
  const h1 = txt(f, "Букеты, которые говорят за вас", M, 196, { serif: true, size: 58, lh: 105, w: 600 });
  /* подзаголовок ставим по фиксированной высоте двухстрочного заголовка:
     height текстового слоя в момент создания ещё не учитывает перенос строк */
  txt(f, "Срезаем свежие цветы каждое утро, собираем букет вручную, присылаем фото перед отправкой и привозим по Туле за два часа.", M, h1.y + 136, { size: 18, color: C.muted, w: 520, lh: 155 });
  button(f, M, 486, 190, 52, "Выбрать букет", "primary");
  button(f, M + 206, 486, 170, 52, "Собрать свой", "outline");

  const facts = [["2 часа", "доставка по Туле"], ["7 дней", "свежесть букета"], ["4,9 / 5", "812 отзывов"]];
  facts.forEach((it, i) => {
    txt(f, it[0], M + i * 165, 578, { serif: true, size: 26 });
    txt(f, it[1], M + i * 165, 614, { size: 13, color: C.muted });
  });

  const slider = figma.createFrame();
  f.appendChild(slider);
  slider.name = "Слайдер";
  slider.resize(580, 520);
  slider.x = 760;
  slider.y = 160;
  slider.cornerRadius = 28;
  slider.clipsContent = true;
  slider.fills = [fill(C.blush)];
  slider.layoutMode = "NONE";
  bouquet(slider, "peonyMix", 30, -40, 520);
  rect(slider, 30, 348, 292, 124, C.cream, 16, { opacity: 0.94 });
  tag(slider, 50, 366, "ХИТ НЕДЕЛИ");
  txt(slider, "Пудровый рассвет", 50, 398, { serif: true, size: 22 });
  txt(slider, "Пионы, гортензия и эвкалипт — 4 900 ₽", 50, 428, { size: 13, color: C.muted, w: 252 });
  [0, 1, 2].forEach((i) => {
    rect(slider, 32 + i * 12, 492, i === 0 ? 22 : 8, 8, C.green, 4, { opacity: i === 0 ? 1 : 0.28 });
  });
  circle(slider, 486, 460, 40, C.white);
  icon(slider, "chevron", 497, 471, 18, C.ink);
  circle(slider, 534, 460, 40, C.white);
  const next = icon(slider, "arrow", 543, 471, 18, C.ink);

  /* категории */
  const catY = 780;
  sectionHead(f, M, catY, "С ЧЕГО НАЧАТЬ", "Четыре способа выбрать цветы");
  const cats = [
    ["Готовые букеты", "38 композиций: от монобукета до корзины", "Смотреть →", "flower"],
    ["Соберите свой", "Конструктор: цветы, упаковка, лента, открытка", "Собрать →", "palette"],
    ["Свадебные", "Букет невесты, бутоньерки, композиции на стол", "Подобрать →", "gift"],
    ["Подарки", "Открытки, ленты, мягкие игрушки, шоколад", "Добавить →", "bag"]
  ];
  cats.forEach((c, i) => {
    const x = M + i * 316;
    const card = figma.createFrame();
    f.appendChild(card);
    card.name = "Категория / " + c[0];
    card.resize(292, 176);
    card.x = x;
    card.y = catY + 84;
    card.cornerRadius = 18;
    card.fills = [fill(C.white)];
    card.strokes = [fill(C.line)];
    card.strokeWeight = 1;
    card.strokeAlign = "INSIDE";
    rect(card, 22, 22, 42, 42, C.cream, 12);
    icon(card, c[3], 32, 32, 22, C.green);
    txt(card, c[0], 22, 80, { serif: true, size: 20 });
    txt(card, c[1], 22, 112, { size: 13, color: C.muted, w: 240, lh: 145 });
    txt(card, c[2], 22, 148, { size: 14, bold: true, color: C.terra });
  });

  /* хиты */
  const hitsY = 1060;
  sectionHead(f, M, hitsY, "ВЫБОР ПОКУПАТЕЛЕЙ", "Хиты недели");
  txtRight(f, "Все букеты", W - M, hitsY + 30, { size: 14, bold: true, w: 140 });

  const hits = [
    { title: "Рандеву", desc: "15 роз пионовидных, крафт, лента", price: "3 450 ₽", bouquet: "rose15", tag: "ХИТ", tagKind: "terra" },
    { title: "Пудровый рассвет", desc: "Пионы, гортензия, эвкалипт", price: "4 900 ₽", bouquet: "peonyMix", tag: "НОВИНКА" },
    { title: "Полевой", desc: "Ромашка, лаванда, эвкалипт", price: "2 250 ₽", bouquet: "field", tag: "СУХОЦВЕТЫ" },
    { title: "Солнечный", desc: "Подсолнухи и ромашки в корзине", price: "2 690 ₽", bouquet: "sun", tag: "ХИТ" }
  ];
  hits.forEach((it, i) => {
    productCard(f, M + i * 316, hitsY + 100, 292, {
      title: it.title, desc: it.desc, price: it.price, bouquet: it.bouquet,
      tag: it.tag, tagKind: it.tagKind, artH: 300, h: 460
    });
  });

  /* преимущества */
  const featY = 1700;
  rect(f, 0, featY, W, 150, C.cream2);
  const feats = [
    ["clock", "Срезаем утром", "Цветы приезжают с плантаций дважды в неделю"],
    ["camera", "Фото до отправки", "Согласуем вид букета в мессенджере"],
    ["truck", "Доставка 2 часа", "Свой курьер, интервал выбираете при заказе"],
    ["card", "Оплата при получении", "Картой курьеру или наличными"]
  ];
  feats.forEach((it, i) => {
    const x = M + i * 316;
    circle(f, x, featY + 52, 44, C.white, { stroke: C.line });
    icon(f, it[0], x + 12, featY + 64, 20, C.green);
    txt(f, it[1], x + 58, featY + 50, { size: 15, bold: true });
    txt(f, it[2], x + 58, featY + 74, { size: 13, color: C.muted, w: 210, lh: 140 });
  });

  /* шаги */
  const stepsY = 1900;
  sectionHead(f, M, stepsY, "КАК ЭТО РАБОТАЕТ", "От заказа до двери — четыре шага");
  const steps = [
    ["Выбираете букет", "Готовый из каталога или свой в конструкторе."],
    ["Согласуем детали", "Флорист собирает букет и присылает фото."],
    ["Упаковываем", "Крафт, плёнка или коробка, лента под цвет."],
    ["Привозим", "Курьер в выбранный интервал, оплата при получении."]
  ];
  steps.forEach((it, i) => {
    const x = M + i * 310;
    rect(f, x, stepsY + 90, 290, 1, C.line);
    txt(f, "0" + (i + 1), x, stepsY + 76, { size: 14, color: C.terra });
    txt(f, it[0], x, stepsY + 108, { serif: true, size: 19 });
    txt(f, it[1], x, stepsY + 140, { size: 14, color: C.muted, w: 270, lh: 145 });
  });

  /* промо */
  const promoY = 2160;
  rect(f, M, promoY, CW, 190, C.blush, 18);
  txt(f, "КОНСТРУКТОР БУКЕТА", M + 34, promoY + 28, { size: 12, color: C.terra, bold: true, ls: 2.2 });
  txt(f, "Соберите букет сами — от 990 ₽", M + 34, promoY + 54, { serif: true, size: 26 });
  txt(f, "Выберите цветы поштучно, упаковку и ленту. Цена и вид букета обновляются сразу.", M + 34, promoY + 96, { size: 14, color: "#6D5A52", w: 620 });
  button(f, M + CW - 264, promoY + 69, 230, 52, "Открыть конструктор", "primary");

  /* отзывы */
  const revY = 2420;
  sectionHead(f, M, revY, "ОТЗЫВЫ", "Что говорят получатели");
  txtRight(f, "4,9 из 5 · 812 отзывов", W - M, revY, { size: 13, color: C.muted, w: 220 });
  const reviews = [
    ["Анна, Тула", "Заказала «Пудровый рассвет» на годовщину. Прислали фото до отправки, привезли на полчаса раньше — пионы стояли больше недели."],
    ["Дмитрий, Тула", "Собирал букет в конструкторе, добавил открытку и мишку. Удобно, что итоговая цена видна сразу."],
    ["Мария, Щёкино", "Брали свадебный букет и бутоньерки. Флорист подобрал состав под платье."]
  ];
  reviews.forEach((r, i) => {
    const card = figma.createFrame();
    f.appendChild(card);
    card.name = "Отзыв " + (i + 1);
    card.resize(389, 230);
    card.x = M + i * 415;
    card.y = revY + 90;
    card.cornerRadius = 18;
    card.fills = [fill(C.white)];
    card.strokes = [fill(C.line)];
    card.strokeWeight = 1;
    card.strokeAlign = "INSIDE";
    for (let s = 0; s < 5; s++) icon(card, "star", 22 + s * 20, 20, 15, C.gold);
    txt(card, r[1], 22, 52, { size: 14.5, w: 345, lh: 150 });
    circle(card, 22, 172, 36, C.blush);
    txt(card, r[0][0], 34, 182, { size: 13, bold: true, color: C.terra });
    txt(card, r[0], 70, 183, { size: 13, color: C.muted });
  });

  buildFooter(f, 2810);
  return f;
}

/* ---------------------------------------------------------------- КАТАЛОГ */
function buildCatalog(page) {
  const f = pageFrame(page, "02 Каталог", 1520, 0, W, 2160);
  buildHeader(f, 0);

  txt(f, "Главная   /   Каталог   /   Готовые букеты", M, 150, { size: 13, color: C.muted });
  txt(f, "Готовые букеты", M, 176, { serif: true, size: 44 });
  txt(f, "Собраны флористами утром: 38 композиций из свежих цветов. Можно заказать как есть или изменить состав в конструкторе.", M, 240, { size: 16, color: C.muted, w: 700 });

  /* фильтры */
  const fx = M, fy = 306;
  const panel = figma.createFrame();
  f.appendChild(panel);
  panel.name = "Фильтры";
  panel.resize(288, 940);
  panel.x = fx;
  panel.y = fy;
  panel.cornerRadius = 18;
  panel.fills = [fill(C.white)];
  panel.strokes = [fill(C.line)];
  panel.strokeWeight = 1;
  panel.strokeAlign = "INSIDE";

  txt(panel, "Фильтры", 22, 20, { serif: true, size: 19 });
  txt(panel, "Подберите букет по поводу и цветам", 22, 48, { size: 12.5, color: C.muted, w: 240 });

  rect(panel, 22, 80, 244, 1, C.line);
  txt(panel, "ПОВОД", 22, 96, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  ["Любой повод", "День рождения", "Свидание", "Свадьба", "Без повода"].forEach((label, i) => {
    radioLine(panel, 22, 122 + i * 32, label, i === 0);
  });

  rect(panel, 22, 296, 244, 1, C.line);
  txt(panel, "ЦВЕТЫ", 22, 312, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  [["Розы", "14"], ["Пионы", "7"], ["Тюльпаны", "6"], ["Гортензия", "5"], ["Подсолнухи", "3"], ["Ромашки", "5"], ["Сухоцветы", "9"]]
    .forEach((row, i) => checkLine(panel, 22, 338 + i * 30, row[0], i === 1, row[1]));

  rect(panel, 22, 566, 244, 1, C.line);
  txt(panel, "ЦЕНА, ₽", 22, 582, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  rect(panel, 22, 612, 244, 4, "#E7DFD1", 2);
  rect(panel, 22, 612, 244, 4, C.green, 2);
  circle(panel, 252, 604, 20, C.white, { stroke: C.green, sw: 1.5 });
  txt(panel, "2 000 ₽", 22, 626, { size: 12, color: C.muted });
  txtRight(panel, "6 000 ₽", 266, 626, { size: 12, color: C.muted, w: 60 });

  rect(panel, 22, 666, 244, 1, C.line);
  txt(panel, "УПАКОВКА", 22, 682, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  ["Крафт", "Плёнка", "Коробка"].forEach((label, i) => checkLine(panel, 22, 708 + i * 30, label, false));

  button(panel, 22, 812, 244, 42, "Показать букеты", "primary", { size: 14 });
  button(panel, 22, 864, 244, 42, "Сбросить", "soft", { size: 14 });

  /* результаты */
  txt(f, "Показано 6 из 38 букетов", 420, 312, { size: 14, color: C.muted });
  rect(f, 1040, 300, 200, 44, C.white, 22, { stroke: C.line });
  txt(f, "Сначала популярные", 1056, 312, { size: 14 });
  icon(f, "chevron", 1212, 315, 16, C.ink);

  const cards = [
    { title: "Рандеву", desc: "15 роз пионовидных, крафт, лента", price: "3 450 ₽", bouquet: "rose15", tag: "ХИТ", tagKind: "terra" },
    { title: "Пудровый рассвет", desc: "Пионы, гортензия, эвкалипт", price: "4 900 ₽", bouquet: "peonyMix", tag: "НОВИНКА" },
    { title: "Тюльпанный май", desc: "25 тюльпанов, крафт-бумага", price: "2 890 ₽", bouquet: "tulip25", tag: "СЕЗОН" },
    { title: "Полевой", desc: "Ромашка, лаванда, эвкалипт", price: "2 250 ₽", bouquet: "field", tag: "СУХОЦВЕТЫ" },
    { title: "Облако", desc: "Гортензия трёх оттенков, эвкалипт", price: "4 200 ₽", bouquet: "hydrangeaMix", tag: "МОНОБУКЕТ" },
    { title: "Утро невесты", desc: "Белые розы, пионы, эвкалипт", price: "5 400 ₽", bouquet: "bride", tag: "СВАДЕБНЫЙ" }
  ];
  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    productCard(f, 420 + col * 313, 366 + row * 430, 291, {
      title: c.title, desc: c.desc, price: c.price, bouquet: c.bouquet,
      tag: c.tag, tagKind: c.tagKind, artH: 240, h: 400
    });
  });

  /* пагинация */
  const pgY = 1250;
  [1, 2, 3, "…", 8].forEach((n, i) => {
    const x = M + 420 + i * 50;
    const active = n === 1;
    circle(f, x, pgY, 42, active ? C.green : C.white, { stroke: active ? C.green : C.line });
    txt(f, String(n), x + 16, pgY + 12, { size: 14, color: active ? C.cream : C.ink, bold: active });
  });

  /* промо */
  rect(f, 420, 1340, 920, 170, C.blush, 18);
  txt(f, "Не нашли нужный букет?", 454, 1370, { serif: true, size: 24 });
  txt(f, "Соберите свой: выберите цветы поштучно, упаковку и открытку — цена обновится сразу.", 454, 1408, { size: 14, color: "#6D5A52", w: 520 });
  button(f, 1000, 1396, 300, 52, "Собрать свой букет", "primary");

  buildFooter(f, 1600);
  return f;
}

/* ------------------------------------------------------------- КОНСТРУКТОР */
function buildConstructor(page) {
  const f = pageFrame(page, "03 Конструктор", 0, 3560, W, 2300);
  buildHeader(f, 1);

  txt(f, "Главная   /   Каталог   /   Конструктор букета", M, 150, { size: 13, color: C.muted });
  txt(f, "Конструктор букета", M, 176, { serif: true, size: 44 });
  txt(f, "Соберите букет по своему рецепту: цветы поштучно, упаковка, лента и открытка. Цена и вид обновляются на каждом шаге.", M, 240, { size: 16, color: C.muted, w: 700 });

  /* шаги */
  const steps = ["Цветы", "Упаковка", "Дополнения", "Доставка"];
  let sx = M;
  steps.forEach((label, i) => {
    const on = i === 0;
    circle(f, sx, 288, 26, on ? C.white : C.white, { stroke: on ? C.green : C.line, sw: on ? 1.5 : 1 });
    txt(f, String(i + 1), sx + 9, 294, { size: 12, bold: on, color: on ? C.green : C.muted });
    txt(f, label, sx + 36, 294, { size: 14, bold: on, color: on ? C.ink : C.muted });
    if (i < 3) rect(f, sx + 150, 301, 60, 1, C.line);
    sx += 250;
  });

  /* левая колонка */
  const leftX = M;
  const p1 = figma.createFrame();
  f.appendChild(p1);
  p1.name = "1. Цветы";
  p1.resize(790, 600);
  p1.x = leftX;
  p1.y = 360;
  p1.cornerRadius = 18;
  p1.fills = [fill(C.white)];
  p1.strokes = [fill(C.line)];
  p1.strokeWeight = 1;
  p1.strokeAlign = "INSIDE";
  txt(p1, "1. Выберите цветы", 24, 22, { serif: true, size: 22 });
  txt(p1, "Любое количество от одной штуки. Флорист добавит зелень в подарок.", 24, 56, { size: 13.5, color: C.muted, w: 700 });
  const flowers = [
    ["Роза пионовидная", "190 ₽ / шт · основной цвет", 9, "9", "1 710 ₽"],
    ["Пион", "420 ₽ / шт · объёмный акцент", 5, "5", "2 100 ₽"],
    ["Тюльпан", "90 ₽ / шт · весенний сезон", 0, "0", "—"],
    ["Гортензия", "350 ₽ / шт · объёмная шапка", 0, "0", "—"],
    ["Эвкалипт", "60 ₽ / шт · зелень и аромат", 5, "5", "300 ₽"],
    ["Роза белая", "210 ₽ / шт · свадебная классика", 0, "0", "—"]
  ];
  flowers.forEach((fl, i) => {
    const ry = 100 + i * 78;
    rect(p1, 24, ry + 70, 742, 1, C.line);
    rect(p1, 24, ry + 6, 56, 56, C.cream, 14);
    circle(p1, 38, ry + 20, 28, ["#D76D80", "#EEB0B8", "#EEB44F", "#B7C8DA", "#8AA68D", "#F0E6D4"][i]);
    txt(p1, fl[0], 96, ry + 8, { size: 15.5, bold: true });
    txt(p1, fl[1], 96, ry + 32, { size: 13, color: C.muted });
    rect(p1, 420, ry + 14, 120, 38, C.white, 19, { stroke: C.line });
    txt(p1, "−", 436, ry + 22, { size: 17, color: C.green });
    txt(p1, fl[3], 470, ry + 23, { size: 15, bold: true });
    txt(p1, "+", 512, ry + 22, { size: 17, color: C.green });
    txtRight(p1, fl[4], 760, ry + 22, { size: 15, bold: true, w: 110 });
  });

  const p2 = figma.createFrame();
  f.appendChild(p2);
  p2.name = "2. Упаковка и лента";
  p2.resize(790, 330);
  p2.x = leftX;
  p2.y = 980;
  p2.cornerRadius = 18;
  p2.fills = [fill(C.white)];
  p2.strokes = [fill(C.line)];
  p2.strokeWeight = 1;
  p2.strokeAlign = "INSIDE";
  txt(p2, "2. Упаковка и лента", 24, 22, { serif: true, size: 22 });
  txt(p2, "Если сомневаетесь — оставьте матовую плёнку: она подходит к любому составу.", 24, 56, { size: 13.5, color: C.muted, w: 700 });
  const wraps = [["Крафт-бумага", "включено", false], ["Матовая плёнка", "150 ₽", false], ["Шляпная коробка", "350 ₽", true], ["Плетёная корзина", "600 ₽", false]];
  wraps.forEach((w, i) => {
    const ry = 96 + i * 40;
    radioLine(p2, 24, ry, w[0], w[2]);
    txtRight(p2, w[1], 766, ry + 2, { size: 13.5, bold: true, w: 140 });
  });
  txt(p2, "ЦВЕТ ЛЕНТЫ", 24, 266, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  [C.terra, C.rose, C.gold, C.green, "#E8DDCB"].forEach((color, i) => {
    circle(p2, 24 + i * 46, 288, 30, color, { stroke: i === 0 ? C.green : C.line, sw: i === 0 ? 2 : 1 });
  });

  const p3 = figma.createFrame();
  f.appendChild(p3);
  p3.name = "3. Дополнения";
  p3.resize(790, 250);
  p3.x = leftX;
  p3.y = 1330;
  p3.cornerRadius = 18;
  p3.fills = [fill(C.white)];
  p3.strokes = [fill(C.line)];
  p3.strokeWeight = 1;
  p3.strokeAlign = "INSIDE";
  txt(p3, "3. Дополнения", 24, 22, { serif: true, size: 22 });
  txt(p3, "Открытку подписываем от руки, текст передаём в день доставки.", 24, 56, { size: 13.5, color: C.muted, w: 700 });
  [["Открытка с вашим текстом", "120 ₽", true], ["Плюшевый мишка", "490 ₽", true], ["Доставка курьером по Туле", "350 ₽", true]]
    .forEach((it, i) => {
      const ry = 90 + i * 44;
      rect(p3, 24, ry, 742, 36, i === 0 ? C.cream : C.white, 10, { stroke: C.line });
      checkLine(p3, 38, ry + 9, it[0], it[2]);
      txtRight(p3, it[1], 750, ry + 10, { size: 13.5, bold: true, w: 90 });
    });

  /* правая колонка */
  const rightX = 920;
  const pv = figma.createFrame();
  f.appendChild(pv);
  pv.name = "Превью букета";
  pv.resize(420, 640);
  pv.x = rightX;
  pv.y = 360;
  pv.cornerRadius = 18;
  pv.fills = [fill(C.white)];
  pv.strokes = [fill(C.line)];
  pv.strokeWeight = 1;
  pv.strokeAlign = "INSIDE";
  rect(pv, 12, 12, 396, 520, "#F3E6DC", 14);
  bouquet(pv, "construct", 34, 40, 350);
  txt(pv, "Высота букета ≈ 35 см", 20, 556, { size: 13, color: C.muted });
  txtRight(pv, "Стойкость 5–7 дней", 400, 556, { size: 13, color: C.muted, w: 160 });

  const sm = figma.createFrame();
  f.appendChild(sm);
  sm.name = "Итог заказа";
  sm.resize(420, 600);
  sm.x = rightX;
  sm.y = 1020;
  sm.cornerRadius = 18;
  sm.fills = [fill(C.white)];
  sm.strokes = [fill(C.line)];
  sm.strokeWeight = 1;
  sm.strokeAlign = "INSIDE";
  txt(sm, "Ваш букет", 24, 22, { serif: true, size: 22 });
  const lines = [["Роза пионовидная × 9", "1 710 ₽"], ["Пион × 5", "2 100 ₽"], ["Эвкалипт × 5", "300 ₽"]];
  lines.forEach((l, i) => {
    txt(sm, l[0], 24, 68 + i * 30, { size: 14, color: C.muted });
    txtRight(sm, l[1], 396, 68 + i * 30, { size: 14, bold: true, w: 100 });
  });
  rect(sm, 24, 176, 372, 1, C.line);
  txt(sm, "УПАКОВКА И ДОПОЛНЕНИЯ", 24, 192, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  const extra = [["Шляпная коробка", "350 ₽"], ["Открытка с текстом", "120 ₽"], ["Плюшевый мишка", "490 ₽"], ["Доставка по Туле", "350 ₽"]];
  extra.forEach((l, i) => {
    txt(sm, l[0], 24, 220 + i * 30, { size: 14, color: C.muted });
    txtRight(sm, l[1], 396, 220 + i * 30, { size: 14, bold: true, w: 100 });
  });
  rect(sm, 24, 364, 372, 1, C.line);
  txt(sm, "Итого, 19 цветов", 24, 386, { size: 14, color: C.muted });
  txtRight(sm, "5 420 ₽", 396, 382, { serif: true, size: 30, bold: true, w: 200 });
  button(sm, 24, 448, 372, 52, "Добавить в корзину — 5 420 ₽", "primary", { size: 15 });
  txt(sm, "Фото букета перед отправкой — бесплатно", 24, 516, { size: 13, color: C.muted, w: 372, align: "CENTER" });

  buildFooter(f, 1780);
  return f;
}

/* --------------------------------------------------------------- ДОСТАВКА */
function buildDelivery(page) {
  const f = pageFrame(page, "04 Доставка", 1520, 3060, W, 2860);
  buildHeader(f, 4);

  txt(f, "Главная   /   Доставка и оплата", M, 150, { size: 13, color: C.muted });
  txt(f, "Доставка и оплата", M, 176, { serif: true, size: 44 });
  txt(f, "Свой курьер по Туле и области: привозим в выбранный двухчасовой интервал, перед отправкой присылаем фото букета.", M, 240, { size: 16, color: C.muted, w: 720 });

  /* календарь */
  const cal = figma.createFrame();
  f.appendChild(cal);
  cal.name = "Когда доставить";
  cal.resize(760, 560);
  cal.x = M;
  cal.y = 310;
  cal.cornerRadius = 18;
  cal.fills = [fill(C.white)];
  cal.strokes = [fill(C.line)];
  cal.strokeWeight = 1;
  cal.strokeAlign = "INSIDE";
  txt(cal, "Когда доставить", 24, 20, { serif: true, size: 22 });
  txt(cal, "Выберите дату или диапазон: например, 20–22 ноября. Сегодняшние заказы принимаем до 20:00.", 24, 54, { size: 13.5, color: C.muted, w: 700 });

  const months = [
    { name: "Ноябрь 2026", start: 6, days: 30, from: 18 },
    { name: "Декабрь 2026", start: 1, days: 31, from: 1 }
  ];
  months.forEach((m, mi) => {
    const mx = 24 + mi * 366;
    const my = 96;
    rect(cal, mx, my, 342, 300, C.white, 12, { stroke: C.line });
    txt(cal, m.name, mx + 16, my + 14, { serif: true, size: 16 });
    const week = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
    week.forEach((d, i) => txt(cal, d, mx + 18 + i * 44, my + 46, { size: 10.5, color: C.muted, bold: true }));
    let day = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        if (idx < m.start || day > m.days) continue;
        const muted = day < m.from;
        const bx = mx + 18 + col * 44;
        const by = my + 68 + row * 38;
        const selected = mi === 0 && (day === 20 || day === 22);
        if (selected) circle(cal, bx - 6, by - 8, 30, C.green);
        if (mi === 0 && day === 21) circle(cal, bx - 6, by - 8, 30, C.blush);
        txt(cal, String(day), bx, by, { size: 13, color: selected ? "#FFFFFF" : (muted ? "#C3B9A9" : C.ink) });
        day++;
      }
    }
  });
  txt(cal, "Выбранная дата: 20.11.2026 — 22.11.2026", 24, 410, { size: 14 });
  txt(cal, "ИНТЕРВАЛ ДОСТАВКИ", 24, 444, { size: 11, color: C.muted, bold: true, ls: 1.6 });
  const slots = ["09:00–12:00", "12:00–15:00", "15:00–18:00", "18:00–22:00", "Как можно быстрее"];
  slots.forEach((s, i) => {
    const x = 24 + i * 142;
    const on = i === 1;
    rect(cal, x, 468, 132, 44, on ? C.green : C.white, 10, { stroke: on ? C.green : C.line });
    txt(cal, s, x + 12, 482, { size: 12.5, color: on ? "#FFFFFF" : C.ink, w: 110 });
  });

  /* адрес */
  const addr = figma.createFrame();
  f.appendChild(addr);
  addr.name = "Куда и кому";
  addr.resize(760, 250);
  addr.x = M;
  addr.y = 900;
  addr.cornerRadius = 18;
  addr.fills = [fill(C.white)];
  addr.strokes = [fill(C.line)];
  addr.strokeWeight = 1;
  addr.strokeAlign = "INSIDE";
  txt(addr, "Куда и кому", 24, 20, { serif: true, size: 22 });
  txt(addr, "Получателю позвоним за час до приезда — предупредим о сюрпризе только по вашей просьбе.", 24, 54, { size: 13.5, color: C.muted, w: 700 });
  [["АДРЕС В ТУЛЕ", "ул. Ленина, 52, кв. 18", 24, 96, 712], ["ИМЯ ПОЛУЧАТЕЛЯ", "Мария", 24, 168, 340], ["ТЕЛЕФОН", "+7 (910) 555-12-40", 384, 168, 352]]
    .forEach((fl) => {
      txt(addr, fl[0], fl[2], fl[3], { size: 11, color: C.muted, bold: true, ls: 1.2 });
      rect(addr, fl[2], fl[3] + 18, fl[4], 44, C.white, 10, { stroke: C.line });
      txt(addr, fl[1], fl[2] + 14, fl[3] + 30, { size: 14 });
    });

  /* тарифы */
  const tar = figma.createFrame();
  f.appendChild(tar);
  tar.name = "Способ доставки";
  tar.resize(760, 300);
  tar.x = M;
  tar.y = 1180;
  tar.cornerRadius = 18;
  tar.fills = [fill(C.white)];
  tar.strokes = [fill(C.line)];
  tar.strokeWeight = 1;
  tar.strokeAlign = "INSIDE";
  txt(tar, "Способ доставки", 24, 20, { serif: true, size: 22 });
  [["Курьер по Туле", "Доставим за 2 часа в выбранный интервал", "350 ₽", true],
   ["Тульская область", "До 20 км от Тулы, 3–4 часа", "590 ₽", false],
   ["Самовывоз из мастерской", "ул. Менделеевская, 11 — с 8:00 до 22:00", "бесплатно", false]]
    .forEach((t, i) => {
      const ry = 66 + i * 74;
      rect(tar, 24, ry, 712, 64, C.white, 12, { stroke: t[3] ? C.green : C.line, sw: t[3] ? 1.5 : 1 });
      circle(tar, 40, ry + 22, 18, C.white, { stroke: t[3] ? C.green : "#C9BFAE" });
      if (t[3]) circle(tar, 44, ry + 26, 10, C.green);
      txt(tar, t[0], 72, ry + 12, { size: 15, bold: true });
      txt(tar, t[1], 72, ry + 34, { size: 13, color: C.muted });
      txtRight(tar, t[2], 720, ry + 22, { size: 14, bold: true, w: 120 });
    });

  /* заказ */
  const ord = figma.createFrame();
  f.appendChild(ord);
  ord.name = "Ваш заказ";
  ord.resize(440, 520);
  ord.x = 900;
  ord.y = 310;
  ord.cornerRadius = 18;
  ord.fills = [fill(C.white)];
  ord.strokes = [fill(C.line)];
  ord.strokeWeight = 1;
  ord.strokeAlign = "INSIDE";
  txt(ord, "Ваш заказ", 24, 20, { serif: true, size: 22 });
  rect(ord, 24, 68, 56, 56, C.cream, 12);
  bouquet(ord, "rose15", 26, 66, 52);
  txt(ord, "Рандеву", 94, 72, { size: 15, bold: true });
  txt(ord, "15 роз, крафт, лента", 94, 96, { size: 13, color: C.muted });
  txtRight(ord, "3 450 ₽", 416, 80, { size: 15, bold: true, w: 120 });
  rect(ord, 24, 144, 392, 1, C.line);
  txt(ord, "Букет", 24, 160, { size: 14, color: C.muted });
  txtRight(ord, "3 450 ₽", 416, 160, { size: 14, bold: true, w: 120 });
  txt(ord, "Доставка по Туле", 24, 190, { size: 14, color: C.muted });
  txtRight(ord, "350 ₽", 416, 190, { size: 14, bold: true, w: 120 });
  rect(ord, 24, 226, 392, 1, C.line);
  txt(ord, "Итого", 24, 248, { size: 14, color: C.muted });
  txtRight(ord, "3 800 ₽", 416, 240, { serif: true, size: 30, bold: true, w: 220 });
  button(ord, 24, 320, 392, 52, "Оплатить заказ", "primary", { size: 15 });
  txt(ord, "Оплата при получении или картой онлайн", 24, 386, { size: 13, color: C.muted, w: 392, align: "CENTER" });

  const help = figma.createFrame();
  f.appendChild(help);
  help.name = "Поможем с выбором";
  help.resize(440, 200);
  help.x = 900;
  help.y = 850;
  help.cornerRadius = 18;
  help.fills = [fill(C.white)];
  help.strokes = [fill(C.line)];
  help.strokeWeight = 1;
  help.strokeAlign = "INSIDE";
  txt(help, "Поможем с выбором", 24, 20, { serif: true, size: 19 });
  txt(help, "Флорист ответит на вопросы и подберёт букет под повод.", 24, 56, { size: 13.5, color: C.muted, w: 380 });
  button(help, 24, 100, 392, 46, "+7 (4872) 55-08-14", "soft", { size: 14 });
  txt(help, "Ежедневно с 8:00 до 22:00", 24, 158, { size: 12.5, color: C.muted });

  /* зоны */
  txt(f, "Зоны доставки", M, 1520, { serif: true, size: 22 });
  tableBlock(f, M, 1560, CW, [
    { title: "ЗОНА", width: 560 },
    { title: "СРОК", width: 340 },
    { title: "СТОИМОСТЬ", width: 340 }
  ], [
    ["Центральный, Пролетарский, Заречье", "2 часа", "350 ₽"],
    ["Привокзальный, Советский", "2–3 часа", "350 ₽"],
    ["Тула до 10 км от МКАД", "3 часа", "450 ₽"],
    ["Тульская область до 20 км", "4 часа", "590 ₽"],
    ["Дальше 20 км", "по согласованию", "от 790 ₽"]
  ]);

  /* FAQ */
  txt(f, "Частые вопросы", M, 1880, { serif: true, size: 22 });
  const faq = [
    ["Можно ли заказать букет на сегодня?", "Да, если заказ оформлен до 20:00. Такой букет собирается вне очереди, доплата 350 ₽.", true],
    ["Что, если получателя нет дома?", "Курьер звонит получателю и ждёт 15 минут. Повторный выезд — 200 ₽.", false],
    ["Можно отправить букет анонимно?", "Да. В открытке не указываем отправителя, а курьер не называет имя заказчика.", false],
    ["Как можно оплатить?", "Картой курьеру, наличными или по QR-коду СБП. Для юридических лиц выставляем счёт.", false]
  ];
  let faqY = 1920;
  faq.forEach((q) => {
    const h = q[2] ? 100 : 66;
    rect(f, M, faqY, CW, h, C.white, 14, { stroke: C.line });
    txt(f, q[0], M + 22, faqY + 22, { size: 15, bold: true });
    txt(f, q[2] ? "×" : "+", W - M - 46, faqY + 18, { size: 20, color: C.terra });
    if (q[2]) txt(f, q[1], M + 22, faqY + 52, { size: 13.5, color: C.muted, w: 1100 });
    faqY += h + 10;
  });

  buildFooter(f, 2320);
  return f;
}

/* ------------------------------------------------------------- СВАДЕБНЫЕ */
function buildWedding(page) {
  const f = pageFrame(page, "05 Свадебные", 0, 5960, W, 3340);
  buildHeader(f, 2);

  txt(f, "Главная   /   Свадебные букеты", M, 150, { size: 13, color: C.muted });
  txt(f, "СВАДЕБНАЯ ФЛОРИСТИКА", M, 186, { size: 12, color: C.terra, bold: true, ls: 2.2 });
  const h1 = txt(f, "Букет невесты, который держит форму весь день", M, 212, { serif: true, size: 48, lh: 110, w: 640 });
  txt(f, "Собираем на каркасе из проволоки и тейп-ленты, подбираем оттенок ленты под платье и делаем примерку за три дня до свадьбы. Бутоньерка жениху — в подарок.", M, h1.y + 126, { size: 16, color: C.muted, w: 560 });
  button(f, M, 500, 190, 52, "Подобрать букет", "primary");
  button(f, M + 206, 500, 200, 52, "Оформление свадьбы", "outline");
  [["3 дня", "примерка перед свадьбой"], ["0 ₽", "бутоньерка в подарок"], ["12 часов", "букет держит форму"]]
    .forEach((it, i) => {
      txt(f, it[0], M + i * 172, 594, { serif: true, size: 26 });
      txt(f, it[1], M + i * 172, 630, { size: 13, color: C.muted });
    });

  const hero = figma.createFrame();
  f.appendChild(hero);
  hero.name = "Превью свадебного букета";
  hero.resize(560, 500);
  hero.x = 780;
  hero.y = 170;
  hero.cornerRadius = 24;
  hero.fills = [fill("#F7F1E7")];
  hero.clipsContent = true;
  bouquet(hero, "bride", 60, 20, 440);
  rect(hero, 30, 420, 240, 56, C.white, 12, { opacity: 0.92 });
  txt(hero, "Букет «Утро невесты» — 5 400 ₽", 46, 438, { size: 13.5 });

  /* коллекции */
  const colY = 720;
  sectionHead(f, M, colY, "КОЛЛЕКЦИИ", "Свадебные букеты");
  txtRight(f, "Весь каталог", W - M, colY + 30, { size: 14, bold: true, w: 140 });
  const weds = [
    { title: "Утро невесты", desc: "Белые розы, пионы, эвкалипт", price: "5 400 ₽", bouquet: "bride", tag: "ХИТ", tagKind: "terra" },
    { title: "Пудра и лён", desc: "Пионы, ромашки, эвкалипт", price: "4 800 ₽", bouquet: "peonyMix", tag: "ПУДРА" },
    { title: "Белая классика", desc: "15 белых роз, матовая плёнка", price: "3 900 ₽", bouquet: "classicWhite", tag: "КЛАССИКА" },
    { title: "Полевая свадьба", desc: "Ромашка, лаванда, эвкалипт", price: "3 200 ₽", bouquet: "field", tag: "ПОЛЕВОЙ" },
    { title: "Терракота", desc: "Розы, тюльпаны, эвкалипт", price: "4 600 ₽", bouquet: "terra", tag: "ТЕРРАКОТА" },
    { title: "Гортензия", desc: "Гортензия, белые розы, коробка", price: "5 100 ₽", bouquet: "hydrangeaMix", tag: "ПОД ЗАКАЗ" }
  ];
  weds.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    productCard(f, M + col * 421, colY + 100 + row * 540, 397, {
      title: c.title, desc: c.desc, price: c.price, bouquet: c.bouquet,
      tag: c.tag, tagKind: c.tagKind, artH: 340, h: 500
    });
  });

  /* комплекты */
  txt(f, "Что заказать к свадьбе", M, 1980, { serif: true, size: 28 });
  txt(f, "Комплект выгоднее на 10–15%, состав можно заменить в пределах той же стоимости.", M, 2022, { size: 14, color: C.muted, w: 700 });
  tableBlock(f, M, 2060, CW, [
    { title: "КОМПЛЕКТ", width: 240 },
    { title: "СОСТАВ", width: 700 },
    { title: "СРОК", width: 150 },
    { title: "ЦЕНА", width: 150 }
  ], [
    ["Базовый", "Букет невесты + бутоньерка жениху", "3 дня", "5 900 ₽"],
    ["Классический", "Букет, 2 бутоньерки, браслет на руку", "4 дня", "8 400 ₽"],
    ["Полный", "Букет, 4 бутоньерки, 2 браслета, 6 композиций на столы", "7 дней", "16 800 ₽"]
  ]);

  /* форма */
  const form = figma.createFrame();
  f.appendChild(form);
  form.name = "Подбор букета";
  form.resize(740, 440);
  form.x = M;
  form.y = 2320;
  form.cornerRadius = 20;
  form.fills = [fill(C.blush)];
  txt(form, "ПОДБОР БУКЕТА", 30, 26, { size: 12, color: C.terra, bold: true, ls: 2.2 });
  txt(form, "Расскажите о свадьбе — флорист предложит состав", 30, 52, { serif: true, size: 24, w: 660 });
  txt(form, "Консультация бесплатная. Покажем похожие букеты на примерке.", 30, 88, { size: 13, color: "#6D5A52", w: 640 });
  [["ДАТА СВАДЬБЫ", "19.06.2027", 30, 124, 300], ["БЮДЖЕТ НА БУКЕТ", "4 000–6 000 ₽", 360, 124, 350]]
    .forEach((fl) => {
      txt(form, fl[0], fl[2], fl[3], { size: 11, color: "#6D5A52", bold: true, ls: 1.2 });
      rect(form, fl[2], fl[3] + 18, fl[4], 44, C.white, 10, { stroke: "#E2D3CA" });
      txt(form, fl[1], fl[2] + 14, fl[3] + 30, { size: 14 });
    });
  txt(form, "СТИЛЬ", 30, 210, { size: 11, color: "#6D5A52", bold: true, ls: 1.2 });
  ["Пудровый", "Классический", "Полевой", "Минимализм"].forEach((chip, i) => {
    const on = i === 0;
    const w = 30 + chip.length * 8;
    rect(form, 30 + i * 150, 232, w, 36, on ? C.green : C.white, 18, { stroke: on ? C.green : "#E2D3CA" });
    txt(form, chip, 30 + i * 150 + 14, 241, { size: 13, color: on ? "#FFFFFF" : C.ink });
  });
  [["ИМЯ", "Мария", 30, 296, 300], ["ТЕЛЕФОН", "+7 (___) ___-__-__", 360, 296, 350]].forEach((fl) => {
    txt(form, fl[0], fl[2], fl[3], { size: 11, color: "#6D5A52", bold: true, ls: 1.2 });
    rect(form, fl[2], fl[3] + 18, fl[4], 44, C.white, 10, { stroke: "#E2D3CA" });
    txt(form, fl[1], fl[2] + 14, fl[3] + 30, { size: 14, color: C.muted });
  });
  button(form, 30, 372, 680, 44, "Записаться на консультацию", "primary", { size: 14 });

  const side = figma.createFrame();
  f.appendChild(side);
  side.name = "Пример букета";
  side.resize(470, 420);
  side.x = 870;
  side.y = 2320;
  side.cornerRadius = 20;
  side.fills = [fill(C.white)];
  side.strokes = [fill(C.line)];
  side.strokeWeight = 1;
  side.strokeAlign = "INSIDE";
  bouquet(side, "bride", 25, 10, 420);
  txt(side, "На консультации покажем 5–7 вариантов под ваш бюджет.", 25, 380, { size: 13, color: C.muted, w: 420 });

  buildFooter(f, 2800);
  return f;
}

/* ---------------------------------------------------------------- ФЛОРИСТ */
function buildFlorist(page) {
  const f = pageFrame(page, "06 Флорист", 1520, 6200, W, 2740);
  buildHeader(f, 3);

  txt(f, "Главная   /   Услуги флориста", M, 150, { size: 13, color: C.muted });
  txt(f, "Услуги флориста", M, 176, { serif: true, size: 44 });
  txt(f, "Помогаем не только с букетом: оформляем мероприятия, делаем подписку на цветы и учим собирать композиции на мастер-классах.", M, 240, { size: 16, color: C.muted, w: 760 });

  const services = [
    ["Оформление мероприятий", "Свадьбы, корпоративы, открытия: арки, фотозоны, композиции на столы.", "от 12 000 ₽", "gift"],
    ["Подписка на цветы", "Свежий букет каждую неделю или раз в месяц — для дома, офиса или салона.", "от 1 900 ₽ / месяц", "flower"],
    ["Мастер-классы", "Собираем букет за два часа: цветы, инструменты и упаковка включены.", "2 400 ₽ / человек", "palette"],
    ["Фотозона и съёмка", "Собираем композиции под свет и палитру съёмки, работаем с фотографами.", "от 7 500 ₽", "camera"],
    ["Корпоративным клиентам", "Договор, закрывающие документы, регулярные поставки в офис.", "по запросу", "card"],
    ["Сезонное оформление", "Витрины, рестораны и холлы к праздникам: новогодние и весенние инсталляции.", "от 4 800 ₽", "leaf"]
  ];
  services.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const card = figma.createFrame();
    f.appendChild(card);
    card.name = "Услуга / " + s[0];
    card.resize(397, 236);
    card.x = M + col * 421;
    card.y = 310 + row * 276;
    card.cornerRadius = 18;
    card.fills = [fill(C.white)];
    card.strokes = [fill(C.line)];
    card.strokeWeight = 1;
    card.strokeAlign = "INSIDE";
    rect(card, 26, 26, 48, 48, C.cream, 14);
    icon(card, s[3], 40, 40, 22, C.terra);
    txt(card, s[0], 26, 92, { serif: true, size: 21, w: 345 });
    txt(card, s[1], 26, 126, { size: 14, color: C.muted, w: 345, lh: 145 });
    txt(card, s[2], 26, 192, { size: 16, bold: true });
  });

  /* подписка */
  txt(f, "Цветы дома и в офисе", M, 940, { serif: true, size: 28 });
  txt(f, "Меняем воду и подрезаем стебли при каждом визите — за вами только ваза.", M, 982, { size: 14, color: C.muted, w: 700 });
  tableBlock(f, M, 1020, CW, [
    { title: "ТАРИФ", width: 240 },
    { title: "ПЕРИОДИЧНОСТЬ", width: 280 },
    { title: "СОСТАВ", width: 560 },
    { title: "ЦЕНА", width: 160 }
  ], [
    ["Минимальный", "Раз в месяц", "Монобукет 7–9 стеблей", "1 900 ₽"],
    ["Домашний", "Раз в две недели", "Авторский букет 15 стеблей", "3 400 ₽"],
    ["Офисный", "Каждую неделю", "2 композиции в вазах + замена воды", "6 900 ₽"]
  ]);

  /* форма */
  const form = figma.createFrame();
  f.appendChild(form);
  form.name = "Записаться к флористу";
  form.resize(760, 520);
  form.x = M;
  form.y = 1300;
  form.cornerRadius = 20;
  form.fills = [fill(C.white)];
  form.strokes = [fill(C.line)];
  form.strokeWeight = 1;
  form.strokeAlign = "INSIDE";
  txt(form, "Записаться к флористу", 30, 24, { serif: true, size: 22 });
  txt(form, "Перезвоним в течение часа в рабочее время и уточним детали.", 30, 58, { size: 13.5, color: C.muted, w: 700 });
  [["ИМЯ", "Как к вам обращаться", 30, 96, 340], ["ТЕЛЕФОН", "+7 (___) ___-__-__", 390, 96, 340],
   ["УСЛУГА", "Оформление мероприятия", 30, 168, 700], ["ДАТА", "28.11.2026", 30, 240, 340],
   ["ГОСТЕЙ / БУКЕТОВ", "например, 12", 390, 240, 340]]
    .forEach((fl) => {
      txt(form, fl[0], fl[2], fl[3], { size: 11, color: C.muted, bold: true, ls: 1.2 });
      rect(form, fl[2], fl[3] + 18, fl[4], 44, C.white, 10, { stroke: C.line });
      txt(form, fl[1], fl[2] + 14, fl[3] + 30, { size: 14, color: C.muted });
    });
  txt(form, "КОММЕНТАРИЙ", 30, 312, { size: 11, color: C.muted, bold: true, ls: 1.2 });
  rect(form, 30, 330, 700, 90, C.white, 10, { stroke: C.line });
  txt(form, "Повод, место, пожелания по цветам", 44, 344, { size: 14, color: C.muted });
  button(form, 30, 440, 700, 48, "Отправить заявку", "primary", { size: 15 });

  /* сбоку */
  const fl = figma.createFrame();
  f.appendChild(fl);
  fl.name = "Флорист недели";
  fl.resize(440, 200);
  fl.x = 900;
  fl.y = 1300;
  fl.cornerRadius = 18;
  fl.fills = [fill(C.white)];
  fl.strokes = [fill(C.line)];
  fl.strokeWeight = 1;
  fl.strokeAlign = "INSIDE";
  txt(fl, "Флорист недели", 24, 20, { serif: true, size: 19 });
  circle(fl, 24, 60, 56, C.blush);
  txt(fl, "Н", 43, 76, { serif: true, size: 20, color: C.terra });
  txt(fl, "Наталья Ким", 94, 64, { size: 15, bold: true });
  txt(fl, "8 лет практики, свадебная флористика", 94, 88, { size: 12.5, color: C.muted, w: 320 });
  txt(fl, "«Сначала спрашиваю про повод и человека, а потом — про цветы».", 24, 136, { size: 12.5, color: C.muted, w: 390 });

  const steps = figma.createFrame();
  f.appendChild(steps);
  steps.name = "Как проходит запись";
  steps.resize(440, 280);
  steps.x = 900;
  steps.y = 1520;
  steps.cornerRadius = 18;
  steps.fills = [fill(C.white)];
  steps.strokes = [fill(C.line)];
  steps.strokeWeight = 1;
  steps.strokeAlign = "INSIDE";
  txt(steps, "Как проходит запись", 24, 20, { serif: true, size: 19 });
  ["Оставляете заявку или звоните.", "Обсуждаем повод, бюджет и дату.", "Присылаем смету и эскиз в течение дня.", "Встречаемся в мастерской или на площадке."]
    .forEach((s, i) => {
      txt(steps, String(i + 1) + ".", 24, 60 + i * 46, { size: 13, bold: true, color: C.terra });
      txt(steps, s, 46, 60 + i * 46, { size: 13.5, color: C.muted, w: 360 });
    });

  /* FAQ */
  txt(f, "Частые вопросы", M, 1880, { serif: true, size: 22 });
  const faq = [
    ["За сколько дней заказывать оформление свадьбы?", "Оптимально за 3–4 недели: успеваем показать эскизы и провести примерку букета.", true],
    ["Можно ли приехать на мастер-класс одному?", "Да, группы по 4–8 человек. Индивидуально — доплата 800 ₽.", false],
    ["Что если цветы в подписке не понравились?", "Заменим букет в следующий визит или пересчитаем стоимость.", false]
  ];
  let faqY = 1920;
  faq.forEach((q) => {
    const h = q[2] ? 100 : 66;
    rect(f, M, faqY, CW, h, C.white, 14, { stroke: C.line });
    txt(f, q[0], M + 22, faqY + 22, { size: 15, bold: true });
    txt(f, q[2] ? "×" : "+", W - M - 46, faqY + 18, { size: 20, color: C.terra });
    if (q[2]) txt(f, q[1], M + 22, faqY + 52, { size: 13.5, color: C.muted, w: 1100 });
    faqY += h + 10;
  });

  buildFooter(f, 2200);
  return f;
}
