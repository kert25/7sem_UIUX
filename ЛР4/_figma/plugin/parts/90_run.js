/* ===========================================================================
   Сборка файла: страницы, экраны, доски, стили.
   =========================================================================== */

let servicePage = null;

/* журнал выполнения на локальный приёмник: видно, на каком шаге плагин упал */
async function log(msg) {
  try {
    await fetch("http://localhost:8765/log", { method: "POST", body: String(msg) });
  } catch (e) { /* приёмник не поднят — не мешаем сборке */ }
}

/* Figma всё чаще открывает плагины в режиме динамической загрузки страниц:
   там присваивание figma.currentPage запрещено, нужен setCurrentPageAsync,
   а children чужой страницы доступны только после page.loadAsync(). */
async function usePage(p) {
  if (typeof figma.setCurrentPageAsync === "function") {
    await figma.setCurrentPageAsync(p);
  } else {
    figma.currentPage = p;
  }
}

async function loadPage(p) {
  if (p && typeof p.loadAsync === "function") {
    await p.loadAsync();
  }
  return p;
}

async function newPage(name) {
  const p = figma.createPage();
  p.name = name;
  await usePage(p);
  return p;
}

(async () => {
  try {
    await log("0 start");
    servicePage = figma.currentPage;
    servicePage.name = "00 Служебное";
    await loadPage(servicePage);
    for (const child of servicePage.children.slice()) child.remove();
    await log("1 service page ready");

    /* повторный запуск не должен плодить копии страниц */
    const ownNames = ["01 Макет", "02 Разметка", "03 Карта сайта", "04 Дизайн-система"];
    for (const p of figma.root.children.slice()) {
      if (p !== servicePage && ownNames.indexOf(p.name) >= 0) p.remove();
    }

    await resolveFonts();
    await log("2 fonts ready " + JSON.stringify(FONTS));
    await log("2b styles removed " + (await clearStyles()));
    buildStyles();
    await log("3 styles ready");

    let board = await newPage("01 Макет");
    await log("4 page 01 created");
    buildHome(board);
    await log("5 home built");
    buildCatalog(board);
    buildConstructor(board);
    await log("6 catalog + constructor built");
    buildDelivery(board);
    buildWedding(board);
    buildFlorist(board);
    await log("7 screens built");

    board = await newPage("02 Разметка");
    buildWireHome(board);
    buildWireConstructor(board);
    buildWireMobile(board);
    await log("8 wireframes built");

    board = await newPage("03 Карта сайта");
    buildSitemap(board);
    await log("9 sitemap built");

    board = await newPage("04 Дизайн-система");
    buildDesignSystem(board);
    await log("10 design system built");

    for (const key of Object.keys(MASTERS)) MASTERS[key].remove();
    await log("11 masters removed");

    /* выгрузка кадров для отчёта на локальный приёмник */
    try {
      let sent = 0;
      for (const name of ["01 Макет", "02 Разметка", "03 Карта сайта", "04 Дизайн-система"]) {
        const board = figma.root.children.find((p) => p.name === name);
        if (!board) continue;
        await loadPage(board);
        for (const frame of board.children) {
          if (frame.type !== "FRAME") continue;
          const bytes = await frame.exportAsync({
            format: "PNG",
            constraint: { type: "SCALE", value: 1 }
          });
          await fetch("http://localhost:8765/upload?name=" + encodeURIComponent(frame.name), {
            method: "POST",
            body: bytes
          });
          sent++;
        }
      }
      console.log("экспортировано кадров: " + sent);
      await log("12 exported " + sent);
    } catch (err) {
      console.log("экспорт не выполнен: " + (err && err.message ? err.message : err));
      await log("12 export failed: " + (err && err.message ? err.message : err));
      figma.notify("Экспорт PNG не выполнен: " + (err && err.message ? err.message : err), { error: true });
    }

    const first = await loadPage(figma.root.children[1]);
    await usePage(first);
    await loadPage(figma.currentPage);
    const frames = figma.currentPage.children.filter((n) => n.type === "FRAME");
    if (frames.length) figma.viewport.scrollAndZoomIntoView(frames.slice(0, 2));

    figma.notify("Готово: 6 экранов, 3 разметки, карта сайта и дизайн-система");
    figma.closePlugin();
  } catch (e) {
    console.error(e);
    await log("ERROR message=" + describeErr(e));
    await log("ERROR stack=" + (e && e.stack ? e.stack : "нет стека"));
    figma.notify("Ошибка плагина: " + (e && e.message ? e.message : e), { error: true });
    figma.closePlugin("Ошибка: " + (e && e.message ? e.message : e));
  }
})();
