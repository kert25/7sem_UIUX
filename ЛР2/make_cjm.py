"""Сборка артефактов CJM по лабораторной работе №2.

Читает cjm_data.json и создаёт:
  * CJM_map.html        - постер карты пути (7 этапов x 7 слоёв + эмоциональная кривая);
  * emotion_curve.html  - отдельный график эмоциональной кривой;
  * CJM_Островок.xlsx   - рабочая карта в виде электронной таблицы.

Запуск (из корня проекта):  py ЛР2\\make_cjm.py
"""

from __future__ import annotations

import html
import json
from pathlib import Path

from xlsxwriter import Workbook

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / "cjm_data.json").read_text(encoding="utf-8"))

STAGES = DATA["stages"]
BARRIERS = []
for stage in STAGES:
    for barrier in stage["barriers"]:
        BARRIERS.append({**barrier, "stage": stage["n"], "stage_name": stage["name"]})

TYPE_LABEL = {"Ф": "функциональный", "К": "когнитивный", "Э": "эмоциональный"}
TYPE_COLOR = {"Ф": "#c0392b", "К": "#b9770e", "Э": "#6c3483"}
TYPE_BG = {"Ф": "#fdecea", "К": "#fef5e7", "Э": "#f4ecf7"}
CRIT_DOT = {"критический": "#c0392b", "значительный": "#d68910", "незначительный": "#95a5a6"}
CRIT_ORDER = {"критический": 0, "значительный": 1, "незначительный": 2}


def score_color(score: int) -> str:
    return {-2: "#e8b4ae", -1: "#f3d3cd", 0: "#f5efe1", 1: "#cfe4cc", 2: "#a9d3a3"}[score]


def esc(text: str) -> str:
    return html.escape(text, quote=False)


def stage_grid_css(columns: int) -> str:
    return f"grid-template-columns: 172px repeat({columns}, 1fr);"


def curve_svg(width: int = 2037, height: int = 270) -> str:
    """SVG эмоциональной кривой, выровненный по колонкам этапов."""
    pad_left = 8
    top, bottom = 62, height - 54
    step = width / len(STAGES)
    x_positions = [pad_left + step * (i + 0.5) for i in range(len(STAGES))]
    y_for = lambda score: top + (2 - score) / 4 * (bottom - top)

    parts = [f'<svg viewBox="0 0 {width} {height}" width="100%" height="{height}" '
             f'preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">']
    # сетка
    for score, label in [(2, "+2 удовольствие"), (1, "+1"), (0, "0 нейтрально"), (-1, "−1"), (-2, "−2 раздражение")]:
        y = y_for(score)
        dash = "4 4" if score else "1 0"
        parts.append(f'<line x1="0" y1="{y:.1f}" x2="{width}" y2="{y:.1f}" stroke="#cfd6d3" '
                     f'stroke-width="{1.2 if score == 0 else 1}" stroke-dasharray="{dash}"/>')
        parts.append(f'<text x="{pad_left + 4}" y="{y - 7:.1f}" font-size="15" fill="#6b7671">{label}</text>')
    # область под кривой
    points = [(x_positions[i], y_for(st["emotion"]["score"])) for i, st in enumerate(STAGES)]
    area = " ".join(f"{x:.1f},{y:.1f}" for x, y in points)
    parts.append(f'<polygon points="{pad_left},{bottom + 12} {area} {width - pad_left},{bottom + 12}" '
                 f'fill="#1f4e46" fill-opacity="0.08"/>')
    parts.append('<polyline points="%s" fill="none" stroke="#1f4e46" stroke-width="4" '
                 'stroke-linejoin="round" stroke-linecap="round"/>' % area)
    for i, (x, y) in enumerate(points):
        score = STAGES[i]["emotion"]["score"]
        color = score_color(score)
        stroke = "#1f4e46"
        parts.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x:.1f}" y2="{bottom + 12}" stroke="{stroke}" '
                     f'stroke-width="1" stroke-opacity="0.25"/>')
        parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="17" fill="{color}" stroke="{stroke}" stroke-width="3"/>')
        parts.append(f'<text x="{x:.1f}" y="{y + 6:.1f}" font-size="17" font-weight="700" text-anchor="middle" '
                     f'fill="#14302c">{score:+d}</text>')
        parts.append(f'<text x="{x:.1f}" y="{bottom + 40:.1f}" font-size="16" text-anchor="middle" '
                     f'fill="#4a5854">{STAGES[i]["n"]}. {esc(STAGES[i]["name"])}</text>')
    parts.append("</svg>")
    return "".join(parts)


CSS = """
:root { --ink:#14302c; --muted:#5b6b66; --line:#d8e0dc; --accent:#1f4e46; }
* { box-sizing: border-box; }
body { margin:0; background:#ffffff; color:var(--ink);
       font-family: "Segoe UI", "PT Sans", Arial, sans-serif; }
.poster { width: 2300px; padding: 34px 40px 30px; }
.head { display:flex; justify-content:space-between; align-items:flex-start; gap:26px; margin-bottom:20px; }
.title { font-size:38px; font-weight:800; letter-spacing:-0.5px; line-height:1.1; }
.title small { display:block; font-size:18px; font-weight:600; color:var(--muted); letter-spacing:0; margin-top:8px; }
.card { border:2px solid var(--line); border-radius:14px; padding:16px 20px; }
.persona { width: 980px; background:#f6f8f6; }
.persona h3 { margin:0 0 8px; font-size:19px; color:var(--accent); }
.persona p { margin:0 0 6px; font-size:16px; line-height:1.35; }
.persona b { color:var(--accent); }
.meta { width: 640px; background:#ffffff; }
.meta p { margin:0 0 6px; font-size:15px; line-height:1.35; }
.grid { display:grid; gap:8px; }
.cell { border:1px solid var(--line); border-radius:10px; padding:11px 13px; background:#fff; }
.label { background:#eef3f1; font-size:15px; font-weight:700; color:var(--accent);
         display:flex; align-items:center; text-transform:uppercase; letter-spacing:0.4px; }
.stagehead { background:var(--accent); color:#fff; border-color:var(--accent); }
.stagehead .n { font-size:13px; opacity:.8; letter-spacing:1px; }
.stagehead .nm { font-size:18px; font-weight:700; line-height:1.2; }
.cell.tp { background:#f4f8f7; font-size:14px; }
.cell.act { font-size:14.5px; }
.cell.th { font-style:italic; font-size:14px; color:#3f4b47; background:#fbf7ef; }
.cell.em { display:flex; flex-direction:column; gap:6px; align-items:flex-start; }
.em .badge { font-size:20px; font-weight:800; border-radius:9px; padding:3px 11px; }
.em .lbl { font-size:14px; font-weight:600; }
.ul { margin:0; padding-left:16px; }
.ul li { margin:0 0 3px; font-size:14px; line-height:1.3; }
.barlist { margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:6px; }
.barlist li { display:flex; gap:7px; align-items:flex-start; font-size:13.5px; line-height:1.28; }
.t { flex:0 0 auto; font-size:11px; font-weight:800; color:#fff; border-radius:5px; padding:2px 5px; margin-top:1px; }
.dot { flex:0 0 auto; width:10px; height:10px; border-radius:50%; margin-top:5px; }
.ideas { background:#f3f8f2; }
.ideas li { font-size:13.5px; }
.curvecell { padding:6px 10px 0; background:#fff; }
.legend { display:flex; gap:26px; align-items:center; margin-top:18px; flex-wrap:wrap; font-size:14px; color:#3f4b47; }
.chips { display:flex; gap:10px; flex:0 0 auto; }
.chips span { background:#1f4e46; color:#fff; border-radius:999px; padding:8px 16px; font-size:15px; font-weight:600; }
.legend .item { display:flex; gap:8px; align-items:center; }
.legend .sw { width:22px; height:14px; border-radius:4px; border:1px solid #c9d2cf; }
.notes { margin-top:14px; font-size:13px; color:var(--muted); line-height:1.4; }
"""


def build_poster() -> str:
    persona = DATA["persona"]
    product = DATA["product"]
    rows = []
    rows.append('<div class="cell label">Этап пути</div>')
    for stage in STAGES:
        rows.append(f'<div class="cell stagehead"><div class="n">ЭТАП {stage["n"]}</div>'
                    f'<div class="nm">{esc(stage["name"])}</div></div>')

    layers = [
        ("Точки контакта", "tp", lambda s: "<ul class='ul'>%s</ul>" % "".join(f"<li>{esc(t)}</li>" for t in s["touchpoints"])),
        ("Действия", "act", lambda s: "<ul class='ul'>%s</ul>" % "".join(f"<li>{esc(a)}</li>" for a in s["actions"])),
        ("Мысли и вопросы", "th", lambda s: "<ul class='ul'>%s</ul>" % "".join(f"<li>{esc(t)}</li>" for t in s["thoughts"])),
    ]
    for title, cls, render in layers:
        rows.append(f'<div class="cell label">{title}</div>')
        for stage in STAGES:
            rows.append(f'<div class="cell {cls}">{render(stage)}</div>')

    rows.append('<div class="cell label">Эмоции</div>')
    for stage in STAGES:
        score = stage["emotion"]["score"]
        rows.append(
            f'<div class="cell em" style="background:{score_color(score)}">'
            f'<span class="badge" style="background:#ffffffaa">{score:+d}</span>'
            f'<span class="lbl">{esc(stage["emotion"]["label"])}</span></div>')

    rows.append('<div class="cell label">Эмоциональная кривая</div>')
    rows.append(f'<div class="cell curvecell" style="grid-column: 2 / span {len(STAGES)}">{curve_svg()}</div>')

    rows.append('<div class="cell label">Барьеры</div>')
    for stage in STAGES:
        items = []
        for barrier in sorted(stage["barriers"], key=lambda b: CRIT_ORDER[b["crit"]]):
            items.append(
                f'<li><span class="t" style="background:{TYPE_COLOR[barrier["type"]]}">{barrier["type"]}</span>'
                f'<span class="dot" style="background:{CRIT_DOT[barrier["crit"]]}" title="{barrier["crit"]}"></span>'
                f'<span><b>{barrier["id"]}.</b> {esc(barrier["short"])}</span></li>')
        rows.append(f'<div class="cell" style="background:#fffdfa"><ul class="barlist">{"".join(items)}</ul></div>')

    rows.append('<div class="cell label">Идеи и рекомендации</div>')
    for stage in STAGES:
        rows.append(f'<div class="cell ideas"><ul class="ul">%s</ul></div>'
                    % "".join(f"<li>{esc(i)}</li>" for i in stage["ideas"]))

    legend = (
        '<div class="legend">'
        '<span class="item">Тип барьера:</span>'
        f'<span class="item"><span class="sw" style="background:{TYPE_COLOR["Ф"]}"></span>Ф — функциональный</span>'
        f'<span class="item"><span class="sw" style="background:{TYPE_COLOR["К"]}"></span>К — когнитивный</span>'
        f'<span class="item"><span class="sw" style="background:{TYPE_COLOR["Э"]}"></span>Э — эмоциональный</span>'
        '<span class="item">Критичность:</span>'
        f'<span class="item"><span class="dot" style="background:{CRIT_DOT["критический"]}"></span>критический</span>'
        f'<span class="item"><span class="dot" style="background:{CRIT_DOT["значительный"]}"></span>значительный</span>'
        f'<span class="item"><span class="dot" style="background:{CRIT_DOT["незначительный"]}"></span>незначительный</span>'
        '</div>'
    )

    notes = "".join(f"<div>• {esc(n)}</div>" for n in DATA["notes"])

    return f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>CJM — {esc(product['name'])}</title>
<style>{CSS}
.grid {{ {stage_grid_css(len(STAGES))} }}
</style></head>
<body><div class="poster">
  <div class="head">
    <div class="title">Customer Journey Map: {esc(product['name'])}
      <small>{esc(product['scenario'])}</small>
    </div>
    <div class="chips">
      <span>{len(STAGES)} этапов пути</span>
      <span>{len(BARRIERS)} барьера</span>
      <span>{len(DATA['recommendations'])} рекомендаций</span>
    </div>
  </div>
  <div class="head">
    <div class="card persona">
      <h3>Персона — {esc(persona['name'])}, {esc(persona['age'])}</h3>
      <p><b>Кто:</b> {esc(persona['role'])}, {esc(persona['income'])}, {esc(persona['digital'])}</p>
      <p><b>Контекст:</b> {esc(persona['context'])}</p>
      <p><b>Цель:</b> {esc(persona['goal'])}</p>
      <p><b>Опасения:</b> {esc(persona['fears'])}</p>
      <p><b>Ожидания:</b> {esc(persona['expectations'])}</p>
    </div>
    <div class="card meta">
      <p><b>Продукт:</b> {esc(product['name'])} — {esc(product['kind'])}, {esc(product['url'])}</p>
      <p><b>Запрос:</b> {esc(product['query'])}</p>
      <p><b>Объект:</b> {esc(product['object'])}</p>
      <p><b>Наблюдение:</b> {esc(product['observed'])}, {esc(product['browser'])}</p>
      <p><b>Тип карты:</b> as-is (текущий опыт), без гипотез о будущем интерфейсе</p>
    </div>
  </div>
  <div class="grid">
    {''.join(rows)}
  </div>
  {legend}
  <div class="notes">{notes}</div>
</div></body></html>"""


def build_curve_html() -> str:
    svg = curve_svg(width=1600, height=300)
    return f"""<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>Эмоциональная кривая</title>
<style>
 body {{ margin:0; background:#fff; font-family:"Segoe UI",Arial,sans-serif; }}
 .wrap {{ padding:18px 22px 8px; width:1600px; }}
 h2 {{ margin:0 0 4px; font-size:24px; color:#14302c; }}
 p {{ margin:0; color:#5b6b66; font-size:15px; }}
</style></head><body><div class="wrap">
 <h2>Эмоциональная кривая пути: Островок, бронирование отеля</h2>
 <p>Шкала: −2 — раздражение, 0 — нейтрально, +2 — удовольствие. Точки — этапы 1–7.</p>
 {svg}
</div></body></html>"""


def build_xlsx() -> None:
    path = ROOT / "CJM_Островок.xlsx"
    workbook = Workbook(str(path))
    fmt = {
        "head": workbook.add_format({"bold": True, "bg_color": "#1f4e46", "font_color": "#ffffff",
                                     "text_wrap": True, "valign": "vcenter", "align": "center",
                                     "border": 1, "border_color": "#c9d2cf", "font_size": 11}),
        "label": workbook.add_format({"bold": True, "bg_color": "#eef3f1", "text_wrap": True,
                                      "valign": "top", "border": 1, "border_color": "#c9d2cf", "font_size": 10}),
        "text": workbook.add_format({"text_wrap": True, "valign": "top", "border": 1,
                                     "border_color": "#c9d2cf", "font_size": 10}),
        "thought": workbook.add_format({"text_wrap": True, "valign": "top", "border": 1, "italic": True,
                                        "border_color": "#c9d2cf", "font_size": 10, "bg_color": "#fbf7ef"}),
        "ideas": workbook.add_format({"text_wrap": True, "valign": "top", "border": 1,
                                      "border_color": "#c9d2cf", "font_size": 10, "bg_color": "#f3f8f2"}),
        "tp": workbook.add_format({"text_wrap": True, "valign": "top", "border": 1,
                                   "border_color": "#c9d2cf", "font_size": 10, "bg_color": "#f4f8f7"}),
    }
    sheet = workbook.add_worksheet("Карта")
    sheet.set_landscape()
    sheet.set_paper(9)  # A4
    sheet.fit_to_pages(1, 0)
    sheet.set_column(0, 0, 26)
    sheet.set_column(1, len(STAGES), 33)
    sheet.set_zoom(80)

    sheet.write(0, 0, "Слой / этап", fmt["head"])
    for i, stage in enumerate(STAGES):
        sheet.write(0, i + 1, f"Этап {stage['n']}. {stage['name']}", fmt["head"])

    def bullet(lines):
        return "\n".join("• " + line for line in lines)

    row_defs = [
        ("Цель этапа", [s["goal"] for s in STAGES], "text", None),
        ("Точки контакта", [bullet(s["touchpoints"]) for s in STAGES], "tp", None),
        ("Действия пользователя", [bullet(s["actions"]) for s in STAGES], "text", None),
        ("Мысли и вопросы", [bullet(s["thoughts"]) for s in STAGES], "thought", None),
        ("Эмоции", [f"{s['emotion']['score']:+d} — {s['emotion']['label']}" for s in STAGES], "text",
         [score_color(s["emotion"]["score"]) for s in STAGES]),
        ("Барьеры", ["\n".join(f"{b['type']} {b['id']}. {b['short']}" for b in s["barriers"]) for s in STAGES], "text", None),
        ("Идеи и рекомендации", [bullet(s["ideas"]) for s in STAGES], "ideas", None),
    ]
    for r, (title, values, style, colors) in enumerate(row_defs, start=1):
        sheet.write(r, 0, title, fmt["label"])
        for i, value in enumerate(values):
            if colors and colors[i]:
                f = workbook.add_format({"text_wrap": True, "valign": "vcenter", "border": 1,
                                         "border_color": "#c9d2cf", "font_size": 11, "bold": True,
                                         "bg_color": colors[i], "align": "center"})
            else:
                f = fmt[style]
            sheet.write(r, i + 1, value, f)

    sheet.freeze_panes(1, 1)

    # Лист барьеров с цветовой кодировкой
    bsheet = workbook.add_worksheet("Барьеры")
    bsheet.set_landscape()
    bsheet.set_paper(9)
    bsheet.fit_to_pages(1, 0)
    bsheet.set_column(0, 0, 8)
    bsheet.set_column(1, 1, 24)
    bsheet.set_column(2, 2, 66)
    bsheet.set_column(3, 3, 16)
    bsheet.set_column(4, 4, 16)
    bsheet.set_column(5, 5, 46)
    headers = ["№", "Этап", "Барьер (наблюдение в интерфейсе)", "Тип", "Критичность", "Влияние на опыт и метрики"]
    for c, h in enumerate(headers):
        bsheet.write(0, c, h, fmt["head"])
    bsheet.freeze_panes(1, 0)
    bsheet.autofilter(0, 0, len(BARRIERS), len(headers) - 1)
    for r, barrier in enumerate(BARRIERS, start=1):
        detail = DATA["barrier_details"][barrier["id"]]
        type_fmt = workbook.add_format({"text_wrap": True, "valign": "top", "border": 1, "border_color": "#c9d2cf",
                                        "font_size": 10, "bg_color": TYPE_BG[barrier["type"]],
                                        "font_color": TYPE_COLOR[barrier["type"]], "bold": True, "align": "center"})
        crit_fmt = workbook.add_format({"text_wrap": True, "valign": "top", "border": 1, "border_color": "#c9d2cf",
                                        "font_size": 10, "bg_color": TYPE_BG[barrier["type"]], "align": "center"})
        bsheet.write(r, 0, barrier["id"], fmt["text"])
        bsheet.write(r, 1, f"{barrier['stage']}. {barrier['stage_name']}", fmt["text"])
        bsheet.write(r, 2, detail["text"], fmt["text"])
        bsheet.write(r, 3, f"{barrier['type']} — {TYPE_LABEL[barrier['type']]}", type_fmt)
        bsheet.write(r, 4, barrier["crit"], crit_fmt)
        bsheet.write(r, 5, detail["impact"], fmt["text"])
        bsheet.set_row(r, 58)

    # Лист легенды
    lsheet = workbook.add_worksheet("Легенда")
    lsheet.set_column(0, 0, 34)
    lsheet.set_column(1, 1, 86)
    legend_rows = [
        ("Слой", "Что фиксирует"),
        ("Этап пути", "5–7 крупных смысловых переходов от потребности до результата"),
        ("Точки контакта", "экраны, блоки, письма и каналы, где гость встречается с продуктом"),
        ("Действия", "конкретные операции пользователя на каждом экране"),
        ("Мысли и вопросы", "формулировки «словами клиента»: сомнения и страхи"),
        ("Эмоции", "оценка от −2 (раздражение) до +2 (удовольствие) и эмоциональная кривая"),
        ("Барьеры", "Ф — функциональный, К — когнитивный, Э — эмоциональный; критичность отмечена цветом"),
        ("Идеи", "гипотезы UI/UX-решений, реализуемые текстами, компоновкой и подсказками"),
    ]
    for r, (a, b) in enumerate(legend_rows):
        lsheet.write(r, 0, a, fmt["head"] if r == 0 else fmt["label"])
        lsheet.write(r, 1, b, fmt["head"] if r == 0 else fmt["text"])

    # Лист эмоциональной кривой с графиком
    cs = workbook.add_worksheet("Эмоциональная кривая")
    cs.set_column(0, 0, 34)
    cs.set_column(1, 1, 12)
    cs.write(0, 0, "Этап", fmt["head"])
    cs.write(0, 1, "Оценка", fmt["head"])
    for r, stage in enumerate(STAGES, start=1):
        cs.write(r, 0, f"{stage['n']}. {stage['name']}", fmt["text"])
        cs.write(r, 1, stage["emotion"]["score"], fmt["text"])
    chart = workbook.add_chart({"type": "line"})
    chart.add_series({
        "name": "Эмоциональная оценка",
        "categories": ["Эмоциональная кривая", 1, 0, len(STAGES), 0],
        "values": ["Эмоциональная кривая", 1, 1, len(STAGES), 1],
        "marker": {"type": "circle", "size": 9, "fill": {"color": "#1f4e46"}, "border": {"color": "#1f4e46"}},
        "line": {"color": "#1f4e46", "width": 2.5},
    })
    chart.set_title({"name": "Эмоциональная кривая: Островок, бронирование отеля"})
    chart.set_y_axis({"min": -2.5, "max": 2.5, "major_gridlines": {"visible": True}})
    chart.set_size({"width": 900, "height": 400})
    chart.set_legend({"none": True})
    cs.insert_chart("D2", chart)

    workbook.close()


if __name__ == "__main__":
    (ROOT / "CJM_map.html").write_text(build_poster(), encoding="utf-8")
    (ROOT / "emotion_curve.html").write_text(build_curve_html(), encoding="utf-8")
    build_xlsx()
    print("OK: CJM_map.html, emotion_curve.html, CJM_Островок.xlsx")
