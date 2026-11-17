/* ===========================================================================
   Доски: графическая разметка (wireframes), карта сайта, дизайн-система.
   =========================================================================== */

function boardFrame(page, name, x, y, w, h) {
  const f = pageFrame(page, name, x, y, w, h, C.cream);
  return f;
}

function boardHead(f, kicker, title, meta1, meta2) {
  txt(f, kicker, M, 40, { size: 11, color: C.terra, bold: true, ls: 2 });
  txt(f, title, M, 62, { serif: true, size: 30 });
  rect(f, M, 108, CW, 2, C.ink);
  txtRight(f, meta1, W - M, 44, { size: 12, color: C.muted, w: 360 });
  if (meta2) txtRight(f, meta2, W - M, 64, { size: 12, color: C.muted, w: 360 });
}

function gridOverlay(f, x, y, w, h) {
  const colW = (w - 11 * 24) / 12;
  for (let i = 0; i < 12; i++) {
    rect(f, x + i * (colW + 24), y, colW, h, C.terra, 0, { opacity: 0.05 });
  }
}

function legendRows(f, x, y, items, cols) {
  cols = cols || 4;
  const colW = CW / cols;
  items.forEach((it, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lx = x + col * colW;
    const ly = y + row * 30;
    txt(f, String(i + 1), lx, ly, { size: 11, bold: true, color: C.terra });
    txt(f, it, lx + 20, ly, { size: 11.5, color: C.ink, w: colW - 30 });
  });
}

/* ------------------------------------------------------- РАЗМЕТКА: ГЛАВНАЯ */
function buildWireHome(page) {
  const f = boardFrame(page, "Разметка / Главная", 0, 0, W, 1010);
  boardHead(f, "ГРАФИЧЕСКАЯ РАЗМЕТКА · ПРАКТИЧЕСКАЯ РАБОТА № 4", "Главная страница: сетка и зоны",
    "Десктоп 1440 px · контейнер 1240 px", "12 колонок, межколонник 24 px");
  txt(f, "Блоки пронумерованы в порядке чтения. Слева — зона контента, справа — изображение или виджет.", M, 122, { size: 12.5, color: C.muted, w: 1000 });

  const wx = M, wy = 150, ww = CW;
  gridOverlay(f, wx, wy, ww, 660);

  dashed(f, wx, wy, ww, 26, "Верхняя полоса: доставка, режим работы, вход");
  zoneBadge(f, wx, wy, 1);
  dashed(f, wx, wy + 36, ww, 46, "Логотип · меню · телефон · избранное · корзина");
  zoneBadge(f, wx, wy + 36, 2);

  dashed(f, wx, wy + 92, 700, 190, "H1 58 px, подзаголовок, две кнопки, три факта");
  zoneBadge(f, wx, wy + 92, 3);
  dashed(f, wx + 724, wy + 92, ww - 724, 190, "Слайдер 3 слайда · 520 px");
  zoneBadge(f, wx + 724, wy + 92, 4);

  const catW = (ww - 3 * 24) / 4;
  for (let i = 0; i < 4; i++) {
    dashed(f, wx + i * (catW + 24), wy + 292, catW, 64, "Категория");
  }
  zoneBadge(f, wx, wy + 292, 5);

  for (let i = 0; i < 4; i++) {
    dashed(f, wx + i * (catW + 24), wy + 366, catW, 150, "Карточка букета");
  }
  zoneBadge(f, wx, wy + 366, 6);

  for (let i = 0; i < 4; i++) {
    dashed(f, wx + i * (catW + 24), wy + 526, catW, 46, "Преимущество");
  }
  zoneBadge(f, wx, wy + 526, 7);

  dashed(f, wx, wy + 582, ww, 76, "Футер: 4 колонки, подписка, документы");
  zoneBadge(f, wx, wy + 582, 8);

  txt(f, "Легенда", M, 872, { serif: true, size: 16 });
  legendRows(f, M, 900, [
    "Верхняя полоса 40 px: доставка, часы, вход",
    "Хедер 84 px: логотип, меню, телефон, корзина",
    "Герой: 7 колонок, H1 58 px, две кнопки",
    "Слайдер: 5 колонок, 520 px, 3 слайда",
    "Категории: 4 × 3 колонки",
    "Хиты недели: 4 карточки по 3 колонки",
    "Преимущества: 4 иконки в строку",
    "Футер: навигация, контакты, подписка"
  ]);
  return f;
}

/* --------------------------------------------------- РАЗМЕТКА: КОНСТРУКТОР */
function buildWireConstructor(page) {
  const f = boardFrame(page, "Разметка / Конструктор", 0, 1100, W, 1010);
  boardHead(f, "ГРАФИЧЕСКАЯ РАЗМЕТКА · ПРАКТИЧЕСКАЯ РАБОТА № 4", "Конструктор букета: рабочая область",
    "Две колонки 1,35 : 1", "Правая колонка закреплена (sticky)");
  txt(f, "Страница повторяет логику сборки: цветы → упаковка → дополнения, итог всегда на виду.", M, 122, { size: 12.5, color: C.muted, w: 1000 });

  const wx = M, wy = 150, ww = CW;
  gridOverlay(f, wx, wy, ww, 640);

  dashed(f, wx, wy, ww, 26, "Верхняя полоса и хедер — как на всех страницах");
  zoneBadge(f, wx, wy, 1);
  dashed(f, wx, wy + 36, 700, 30, "Хлебные крошки");
  zoneBadge(f, wx, wy + 36, 2);
  dashed(f, wx, wy + 76, ww, 36, "Индикатор шагов: цветы · упаковка · дополнения · доставка");
  zoneBadge(f, wx, wy + 76, 3);

  dashed(f, wx, wy + 124, 700, 200, "Список цветов: 9 позиций, степпер − / +");
  zoneBadge(f, wx, wy + 124, 4);
  dashed(f, wx, wy + 334, 700, 120, "Упаковка и лента: 4 радиокнопки, 5 свотчей");
  zoneBadge(f, wx, wy + 334, 5);
  dashed(f, wx, wy + 464, 700, 110, "Дополнения: открытка, игрушка, доставка");
  zoneBadge(f, wx, wy + 464, 6);

  dashed(f, wx + 724, wy + 124, ww - 724, 220, "Превью букета 600 × 700");
  zoneBadge(f, wx + 724, wy + 124, 7);
  dashed(f, wx + 724, wy + 354, ww - 724, 220, "Итог: строки заказа, цена, CTA — sticky");
  zoneBadge(f, wx + 724, wy + 354, 8);

  dashed(f, wx, wy + 590, ww, 50, "Футер — общий для всех страниц");
  zoneBadge(f, wx, wy + 590, 9);

  txt(f, "Легенда", M, 826, { serif: true, size: 16 });
  legendRows(f, M, 854, [
    "Общая шапка: полоса 40 px + хедер 84 px",
    "Крошки и мини-корзина",
    "Индикатор шагов: 4 этапа",
    "Список цветов: 9 позиций, степпер",
    "Упаковка: 4 варианта, цена",
    "Дополнения: открытка, игрушка, доставка",
    "Превью: живая иллюстрация состава",
    "Итог: строки заказа и CTA",
    "Футер: навигация и контакты"
  ]);
  return f;
}

/* ----------------------------------------------------- РАЗМЕТКА: МОБИЛЬНАЯ */
function buildWireMobile(page) {
  const f = boardFrame(page, "Разметка / Мобильная", 0, 2210, W, 900);
  boardHead(f, "ГРАФИЧЕСКАЯ РАЗМЕТКА · ПРАКТИЧЕСКАЯ РАБОТА № 4", "Адаптив: мобильная версия главной",
    "Экран 375 px · поля 18 px", "Брейкпоинты 1080 / 640 px");
  txt(f, "На мобильном сетка складывается в одну колонку, меню уходит в бургер, второстепенные блоки — в аккордеон.", M, 122, { size: 12.5, color: C.muted, w: 900 });

  const mx = M, my = 160;
  rect(f, mx - 10, my - 10, 395, 720, C.white, 24, { stroke: C.ink, sw: 2 });

  const bw = 375;
  dashed(f, mx, my, bw, 22, "Доставка 2 ч");
  zoneBadge(f, mx, my, 1);
  dashed(f, mx, my + 32, bw, 36, "меню · Флёр · избранное · корзина");
  zoneBadge(f, mx, my + 32, 2);
  dashed(f, mx, my + 78, bw, 120, "Слайдер 300 px");
  zoneBadge(f, mx, my + 78, 3);
  dashed(f, mx, my + 208, bw, 84, "H1 34 px · CTA на всю ширину");
  zoneBadge(f, mx, my + 208, 4);
  dashed(f, mx, my + 302, 176, 44, "Категория");
  dashed(f, mx + 187, my + 302, 176, 44, "Категория");
  zoneBadge(f, mx, my + 302, 5);
  dashed(f, mx, my + 356, bw, 96, "Карточка букета — на всю ширину");
  zoneBadge(f, mx, my + 356, 6);
  dashed(f, mx, my + 462, bw, 40, "Преимущества — списком");
  zoneBadge(f, mx, my + 462, 7);
  dashed(f, mx, my + 512, bw, 56, "Футер — колонки в аккордеон");
  zoneBadge(f, mx, my + 512, 8);

  /* правая колонка с правилами */
  const rx = 600;
  txt(f, "Что меняется на мобильном", rx, 160, { serif: true, size: 20 });
  const rows = [
    ["Хедер", "Меню скрывается, остаётся бургер 44 × 44"],
    ["Герой", "Две колонки → одна: текст, под ним слайдер"],
    ["Категории", "4 → 2 × 2, иконка над подписью"],
    ["Каталог", "Карточки 1 в ряд, фильтры — в шторке"],
    ["Конструктор", "Превью и итог — под списком цветов"],
    ["Футер", "Колонки → аккордеон, контакты сверху"]
  ];
  rows.forEach((r, i) => {
    const ry = 200 + i * 46;
    txt(f, r[0], rx, ry, { size: 13, bold: true, w: 150 });
    txt(f, r[1], rx + 160, ry, { size: 13, color: C.muted, w: 560 });
    rect(f, rx, ry + 34, 736, 1, C.line);
  });

  txt(f, "Правила адаптива", rx, 500, { serif: true, size: 20 });
  ["Минимальная зона касания — 44 × 44 px.", "Шрифт тела не меньше 16 px.",
    "Горизонтальной прокрутки нет.", "Пагинация заменяется кнопкой «Показать ещё».",
    "Порядок блоков не меняется — меняется раскладка."]
    .forEach((rule, i) => {
      circle(f, rx, 542 + i * 32, 6, C.terra);
      txt(f, rule, rx + 18, 534 + i * 32, { size: 13, color: C.muted, w: 700 });
    });
  return f;
}

/* ------------------------------------------------------------ КАРТА САЙТА */
function buildSitemap(page) {
  const f = boardFrame(page, "Карта сайта и сценарии", 0, 0, W, 1010);
  boardHead(f, "СТРУКТУРА МАКЕТА · ПРАКТИЧЕСКАЯ РАБОТА № 4", "«Флёр» — структура сайта и сценарии",
    "6 страниц · 3 сценария", "Вариант 9");

  /* корень */
  const rootW = 300;
  rect(f, W / 2 - rootW / 2, 140, rootW, 66, C.white, 12, { stroke: C.green, sw: 2 });
  txt(f, "Главная", W / 2 - 100, 152, { serif: true, size: 18, w: 200, align: "CENTER" });
  txt(f, "index.html — витрина и хиты", W / 2 - 130, 180, { size: 10.5, color: C.muted, w: 260, align: "CENTER" });

  rect(f, W / 2, 206, 1, 26, C.line);

  const branches = [
    ["Каталог", "catalog.html", ["Готовые букеты", "Цветы в коробке", "Монобукеты", "Сухоцветы", "Подарки и открытки"]],
    ["Конструктор", "constructor.html", ["Шаг 1. Цветы поштучно", "Шаг 2. Упаковка и лента", "Шаг 3. Открытка, игрушка", "Шаг 4. Доставка", "Итоговая цена"]],
    ["Свадебные", "wedding.html", ["Коллекции букетов", "Комплекты и цены", "Подбор букета (форма)", "Примерка за 3 дня"]],
    ["Флорист", "florist.html", ["Услуги и цены", "Подписка на цветы", "Запись к флористу", "Вопросы об услугах"]],
    ["Доставка", "delivery.html", ["Диапазон дат и интервал", "Адрес и получатель", "Зоны и тарифы", "Вопросы и ответы"]]
  ];
  const bw = 220, gap = 20;
  const totalW = branches.length * bw + (branches.length - 1) * gap;
  const startX = W / 2 - totalW / 2;
  rect(f, startX + bw / 2, 232, totalW - bw, 1, C.line);
  branches.forEach((b, i) => {
    const bx = startX + i * (bw + gap);
    rect(f, bx + bw / 2, 232, 1, 24, C.line);
    rect(f, bx, 256, bw, 210, C.white, 12, { stroke: C.line });
    txt(f, "УРОВЕНЬ 1", bx + 14, 268, { size: 9.5, color: C.terra, bold: true, ls: 1.4 });
    txt(f, b[0], bx + 14, 284, { serif: true, size: 16 });
    txt(f, b[1], bx + 14, 308, { size: 10, color: C.muted });
    rect(f, bx + 14, 326, bw - 28, 1, C.line);
    b[2].forEach((item, k) => {
      circle(f, bx + 16, 340 + k * 24, 5, "#DCD0BD");
      txt(f, item, bx + 28, 336 + k * 24, { size: 10.5, w: bw - 40 });
    });
  });

  /* общие блоки */
  rect(f, M, 492, CW, 44, C.white, 10, { stroke: C.line, dash: true });
  txt(f, "ОБЩИЕ БЛОКИ НА ВСЕХ СТРАНИЦАХ", M + 14, 504, { size: 10, bold: true, color: C.muted, ls: 1.2 });
  txt(f, "Хедер: логотип, меню, телефон, избранное, корзина  ·  Футер: каталог, помощь, контакты, подписка  ·  Хлебные крошки  ·  Корзина и уведомление", M + 280, 504, { size: 11, color: C.ink, w: 930 });

  /* сценарии */
  txt(f, "Пользовательские сценарии", M, 570, { serif: true, size: 18 });
  const flows = [
    ["1. Купить готовый букет", ["Главная", "Каталог", "Фильтры", "Карточка", "Корзина", "Доставка", "Оплата"]],
    ["2. Собрать букет самому", ["Главная", "Конструктор", "Цветы", "Упаковка", "Дополнения", "Доставка", "Корзина"]],
    ["3. Заказать свадебный букет", ["Главная", "Свадебные", "Коллекции", "Комплекты", "Форма", "Звонок флориста", "Примерка"]]
  ];
  flows.forEach((fl, i) => {
    const fy = 606 + i * 42;
    txt(f, fl[0], M, fy + 6, { size: 12.5, bold: true, w: 240 });
    let fx = M + 250;
    fl[1].forEach((step, k) => {
      const t = txt(f, step, 0, 0, { size: 11.5 });
      const w = t.width + 20;
      rect(f, fx, fy, w, 30, C.white, 8, { stroke: C.line });
      f.appendChild(t);
      t.x = fx + 10;
      t.y = fy + 8;
      fx += w;
      if (k < fl[1].length - 1) {
        txt(f, "→", fx + 4, fy + 6, { size: 12, color: C.terra });
        fx += 22;
      }
    });
  });

  rect(f, M, 752, CW, 60, C.white, 10, { stroke: C.line, dash: true });
  txt(f, "ПРИНЦИП СТРУКТУРЫ", M + 14, 764, { size: 10, bold: true, color: C.muted, ls: 1.2 });
  txt(f, "Каждая страница отвечает на один вопрос покупателя: «что купить» — каталог, «из чего собрать» — конструктор, «когда и куда привезти» — доставка, «кто соберёт» — флорист. Хедер и футер одинаковы на всех страницах, поэтому переход между разделами не требует нового обучения.", M + 200, 762, { size: 11.5, color: C.ink, w: 1010 });
  return f;
}

/* --------------------------------------------------------- ДИЗАЙН-СИСТЕМА */
function buildDesignSystem(page) {
  const f = boardFrame(page, "Дизайн-система", 0, 0, W, 1180);
  boardHead(f, "ГРАФИЧЕСКАЯ РАЗМЕТКА · ПРАКТИЧЕСКАЯ РАБОТА № 4", "Дизайн-система: сетка, цвет, шрифт, компоненты",
    "Контейнер 1240 px · 12 колонок", "Брейкпоинты 1080 / 640 px");

  txt(f, "Модульная сетка", M, 138, { serif: true, size: 20 });
  txt(f, "Контейнер 1240, 12 колонок по 80, межколонник 24. На 1080 сетка становится 2-колоночной, на 640 — одноколоночной.", M, 168, { size: 12, color: C.muted, w: 1160 });
  gridOverlay(f, M, 196, CW, 74);
  const colW = (CW - 11 * 24) / 12;
  for (let i = 0; i < 12; i++) {
    rect(f, M + i * (colW + 24), 196, colW, 74, C.white, 4, { stroke: C.line });
    txt(f, String(i + 1), M + i * (colW + 24) + colW / 2 - 6, 226, { size: 11, color: C.muted });
  }
  txt(f, "поле 32 px", M, 280, { size: 11.5, color: C.muted });
  txtRight(f, "поле 32 px", W - M, 280, { size: 11.5, color: C.muted, w: 100 });
  txt(f, "колонка 80 px · межколонник 24 px", M + 400, 280, { size: 11.5, color: C.muted, w: 500, align: "CENTER" });

  txt(f, "Палитра", M, 322, { serif: true, size: 20 });
  const palette = [
    ["Тёмная зелень", C.green, "текст, кнопки, подвал"],
    ["Сливочный", C.cream, "фон страниц"],
    ["Пудровый", C.blush, "акцентные блоки"],
    ["Терракота", C.terra, "CTA, подписи"],
    ["Золото", C.gold, "рейтинг, декор"],
    ["Тёплый серый", C.muted, "второстепенный текст"]
  ];
  const swW = (CW - 5 * 20) / 6;
  palette.forEach((p, i) => {
    const x = M + i * (swW + 20);
    rect(f, x, 356, swW, 74, p[1], 10, { stroke: C.line });
    txt(f, p[0], x, 442, { size: 12, bold: true });
    txt(f, p[1].toUpperCase(), x, 462, { size: 11, color: C.muted });
    txt(f, p[2], x, 480, { size: 11, color: C.muted, w: swW });
  });
  txt(f, "Контраст текста к фону: 12,6 : 1 для основного и 5,4 : 1 для второстепенного — выше порога WCAG AA (4,5 : 1).", M, 514, { size: 11.5, color: C.muted, w: 1100 });

  txt(f, "Типографика", M, 552, { serif: true, size: 20 });
  const types = [
    ["H1 · Georgia 58 / 1.05", "Букеты, которые говорят за вас", 58, 76, FONTS.serif, C.ink],
    ["H2 · Georgia 36 / 1.15", "Хиты недели", 36, 62, FONTS.serif, C.ink],
    ["H3 · Georgia 22 / 1.3", "Пудровый рассвет", 22, 46, FONTS.serif, C.ink],
    ["Текст · Segoe UI 16 / 1.55", "Срезаем свежие цветы каждое утро и привозим по Туле за два часа.", 16, 44, FONTS.sans, C.ink],
    ["Подпись · Segoe UI 13", "Цена и вид букета обновляются на каждом шаге", 13, 38, FONTS.sans, C.muted]
  ];
  let ty = 586;
  types.forEach((t) => {
    rect(f, M, ty + t[3] - 2, CW, 1, C.line);
    txt(f, t[0], M, ty + 8, { size: 10.5, color: C.muted });
    const s = figma.createText();
    f.appendChild(s);
    s.fontName = t[4];
    s.characters = t[1];
    s.fontSize = t[2];
    s.fills = [fill(t[5])];
    s.x = M + 240;
    s.y = ty + 2;
    ty += t[3] + 6;
  });

  txt(f, "Компоненты", M, 912, { serif: true, size: 20 });
  const comps = [
    ["Кнопки", () => {
      button(f, M, 964, 140, 44, "В корзину", "primary", { size: 13 });
      button(f, M + 156, 964, 140, 44, "Собрать свой", "outline", { size: 13 });
    }],
    ["Чекбокс и радиокнопка", () => {
      checkLine(f, M + 330, 966, "Пионы", true);
      checkLine(f, M + 330, 996, "Гортензия", false);
      radioLine(f, M + 330, 1026, "День рождения", true);
    }],
    ["Поле ввода", () => {
      rect(f, M + 640, 968, 220, 40, C.white, 10, { stroke: C.line });
      txt(f, "+7 (4872) 55-08-14", M + 654, 979, { size: 13, color: C.muted });
    }],
    ["Метка и цена", () => {
      tag(f, M + 900, 966, "ХИТ", "terra");
      txt(f, "3 450 ₽", M + 900, 1002, { size: 17, bold: true });
    }]
  ];
  comps.forEach((c) => {
    txt(f, c[0].toUpperCase(), M + [0, 330, 640, 900][comps.indexOf(c)], 940, { size: 9.5, color: C.muted, bold: true, ls: 1.2 });
    c[1]();
  });
  return f;
}


