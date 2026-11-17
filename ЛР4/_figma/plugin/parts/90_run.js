/* ===========================================================================
   Сборка файла: страницы, экраны, доски, стили.
   =========================================================================== */

let servicePage = null;

function newPage(name) {
  const p = figma.createPage();
  p.name = name;
  figma.currentPage = p;
  return p;
}

(async () => {
  try {
    servicePage = figma.currentPage;
    servicePage.name = "00 Служебное";
    for (const child of servicePage.children.slice()) child.remove();

    /* повторный запуск не должен плодить копии страниц */
    const ownNames = ["01 Макет", "02 Разметка", "03 Карта сайта", "04 Дизайн-система"];
    for (const p of figma.root.children.slice()) {
      if (p !== servicePage && ownNames.indexOf(p.name) >= 0) p.remove();
    }

    await resolveFonts();
    buildStyles();

    let board = newPage("01 Макет");
    buildHome(board);
    buildCatalog(board);
    buildConstructor(board);
    buildDelivery(board);
    buildWedding(board);
    buildFlorist(board);

    board = newPage("02 Разметка");
    buildWireHome(board);
    buildWireConstructor(board);
    buildWireMobile(board);

    board = newPage("03 Карта сайта");
    buildSitemap(board);

    board = newPage("04 Дизайн-система");
    buildDesignSystem(board);

    for (const key of Object.keys(MASTERS)) MASTERS[key].remove();

    /* выгрузка кадров для отчёта на локальный приёмник */
    try {
      if (typeof figma.exportAsync !== "function") throw new Error("exportAsync недоступен");
      let sent = 0;
      for (const name of ["01 Макет", "02 Разметка", "03 Карта сайта", "04 Дизайн-система"]) {
        const board = figma.root.children.find((p) => p.name === name);
        if (!board) continue;
        for (const frame of board.children) {
          if (frame.type !== "FRAME") continue;
          const bytes = await figma.exportAsync(frame, {
            format: "PNG",
            constraint: { type: "SCALE", value: 1 }
          });
          await fetch("http://127.0.0.1:8765/upload?name=" + encodeURIComponent(frame.name), {
            method: "POST",
            body: bytes
          });
          sent++;
        }
      }
      console.log("экспортировано кадров: " + sent);
    } catch (err) {
      console.log("экспорт не выполнен: " + (err && err.message ? err.message : err));
    }

    figma.currentPage = figma.root.children[1];
    const frames = figma.currentPage.children.filter((n) => n.type === "FRAME");
    if (frames.length) figma.viewport.scrollAndZoomIntoView(frames.slice(0, 2));

    figma.notify("Готово: 6 экранов, 3 разметки, карта сайта и дизайн-система");
    figma.closePlugin();
  } catch (e) {
    console.error(e);
    figma.notify("Ошибка плагина: " + (e && e.message ? e.message : e), { error: true });
    figma.closePlugin("Ошибка: " + (e && e.message ? e.message : e));
  }
})();
