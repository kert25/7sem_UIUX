"""Построение иллюстраций к лабораторной работе 3.

Скрипт читает metrics.json (замеры прогона и оценки эвристик) и собирает три
самостоятельные HTML-страницы с инлайновым SVG: дерево задач, тепловую карту
нарушений эвристик и диаграмму узких мест. Каждая страница рассчитана на снимок
фиксированной ширины 1000 px, поэтому в отчёт рисунки попадают без обрезки.

Запуск:  py ЛР3/make_charts.py
Результат: ЛР3/task_tree.html, ЛР3/heatmap.html, ЛР3/bottlenecks.html
"""

import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE = Path(__file__).resolve().parent
WIDTH = 1000

INK = "#1b1b1f"
MUTED = "#5c5f66"
LINE = "#b9bcc4"
BG_A = "#4f46e5"
BG_B = "#c62828"

SCORE_COLORS = {
    0: ("#1f7a4d", "#ffffff", "нет проблемы"),
    1: ("#f2c94c", "#1b1b1f", "незначительная"),
    2: ("#f2994a", "#1b1b1f", "значительная"),
    3: ("#c62828", "#ffffff", "критическая"),
}

HEURISTIC_ROWS = [
    "1. Видимость состояния системы",
    "2. Соответствие реальному миру",
    "3. Контроль и свобода пользователя",
    "4. Согласованность и стандарты",
    "5. Предотвращение ошибок",
    "6. Узнавание вместо запоминания",
    "7. Гибкость и эффективность",
    "8. Эстетичный и минималистичный дизайн",
    "9. Помощь в распознавании ошибок",
    "10. Справка и документация",
]

STEP_LABELS = {
    "S1": "Задать\nпараметры",
    "S2": "Выбрать\nпоезд",
    "S3": "Класс\nи вагон",
    "S4": "Выбрать\nместо",
    "S5": "Данные\nпассажира",
}


def load_metrics():
    with (BASE / "metrics.json").open(encoding="utf-8") as stream:
        return json.load(stream)


def step_time(step, key):
    """Время шага по модели KLM: клики, ввод, умственные операции, отклик."""
    data = step[key]
    return round(
        1.1 * data["clicks"]
        + 0.2 * data["chars"]
        + 1.35 * data["mental"]
        + data["response_s"],
        1,
    )


def totals(data):
    out = {}
    for key in ("A", "B"):
        clicks = sum(s[key]["clicks"] for s in data["steps"])
        chars = sum(s[key]["chars"] for s in data["steps"])
        mental = sum(s[key]["mental"] for s in data["steps"])
        errors = sum(s[key]["errors"] for s in data["steps"])
        seconds = round(sum(step_time(s, key) for s in data["steps"]), 1)
        scores = sum(h[key]["score"] for h in data["heuristics"])
        out[key] = {
            "clicks": clicks,
            "chars": chars,
            "mental": mental,
            "errors": errors,
            "seconds": seconds,
            "scores": scores,
            "completed": all(s[key]["completed"] for s in data["steps"]),
        }
    return out


def svg_page(body, width, height, title):
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  html, body {{ margin: 0; padding: 0; background: #ffffff; }}
  #fig {{ width: {width}px; height: {height}px; background: #ffffff; }}
  text {{ font-family: "Segoe UI", Arial, sans-serif; }}
</style>
</head>
<body>
<div id="fig">
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
{body}
</svg>
</div>
</body>
</html>
"""


def esc(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def box(x, y, w, h, fill, stroke, rx=8, sw=1.5):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')


def text_lines(cx, cy, lines, size, fill, weight="600", gap=None):
    gap = gap or int(size * 1.25)
    total = gap * (len(lines) - 1)
    start = cy - total / 2 + size * 0.36
    out = []
    for i, line in enumerate(lines):
        out.append(f'<text x="{cx}" y="{round(start + i * gap)}" font-size="{size}" '
                   f'font-weight="{weight}" fill="{fill}" text-anchor="middle">{esc(line)}</text>')
    return "\n".join(out)


# ---------------------------------------------------------------- дерево задач

TREE = [
    ("Задать параметры поездки", ["станция отправления", "станция прибытия", "дата", "число пассажиров"]),
    ("Выбрать поезд", ["отфильтровать список", "сравнить время и цену", "открыть карточку"]),
    ("Выбрать класс и вагон", ["класс обслуживания", "найти вагон", "сравнить цену вагона"]),
    ("Выбрать место", ["найти место в схеме", "учесть тип места", "подтвердить выбор"]),
    ("Ввести данные пассажира", ["ФИО", "документ", "контакты для билета"]),
]


def wrap(text, width_chars):
    words = text.split()
    lines, current = [], ""
    for word in words:
        candidate = (current + " " + word).strip()
        if len(candidate) <= width_chars:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def build_tree():
    col_w = 186
    gap = 14
    left = (WIDTH - (col_w * 5 + gap * 4)) / 2
    top = 64
    out = []
    out.append(f'<rect x="0" y="0" width="{WIDTH}" height="500" fill="#ffffff"/>')
    out.append(f'<text x="{WIDTH/2}" y="30" font-size="20" font-weight="700" fill="{INK}" '
               f'text-anchor="middle">Дерево задачи «купить билет на поезд Тула — Москва»</text>')
    out.append(f'<text x="{WIDTH/2}" y="52" font-size="14" fill="{MUTED}" text-anchor="middle">'
               f'уровень 0 — задача, уровень 1 — этапы, уровень 2 — микродействия</text>')

    # level 0
    root_w, root_h = 470, 74
    rx = (WIDTH - root_w) / 2
    out.append(box(rx, top, root_w, root_h, "#eef0ff", "#4f46e5", rx=10, sw=2))
    out.append(text_lines(WIDTH / 2, top + root_h / 2,
                          ["Купить билет Тула — Москва на 6 ноября,", "поезд 07:53, сидячее место, 1 пассажир"],
                          15, INK))

    bus_y = top + root_h + 38
    l1_y = bus_y + 34
    out.append(f'<line x1="{WIDTH/2}" y1="{top+root_h}" x2="{WIDTH/2}" y2="{bus_y}" stroke="{LINE}" stroke-width="2"/>')

    first_cx = left + col_w / 2
    last_cx = left + (col_w + gap) * 4 + col_w / 2
    out.append(f'<line x1="{first_cx}" y1="{bus_y}" x2="{last_cx}" y2="{bus_y}" stroke="{LINE}" stroke-width="2"/>')

    bottom = l1_y
    for i, (name, kids) in enumerate(TREE):
        cx = left + (col_w + gap) * i + col_w / 2
        x = left + (col_w + gap) * i
        out.append(f'<line x1="{cx}" y1="{bus_y}" x2="{cx}" y2="{l1_y}" stroke="{LINE}" stroke-width="2"/>')
        h1 = 64
        out.append(box(x, l1_y, col_w, h1, "#f3f4f6", "#6b7280", rx=8, sw=1.5))
        out.append(text_lines(cx, l1_y + h1 / 2, wrap(name, 21), 13, INK))
        ch_top = l1_y + h1 + 26
        step = 44
        spine_end = ch_top + (len(kids) - 1) * step + 15
        out.append(f'<line x1="{cx}" y1="{l1_y+h1}" x2="{cx}" y2="{spine_end}" stroke="{LINE}" stroke-width="1.5"/>')
        for j, kid in enumerate(kids):
            y = ch_top + j * step
            out.append(box(x + 8, y, col_w - 16, 30, "#ffffff", "#9aa0a6", rx=6, sw=1))
            out.append(text_lines(cx, y + 15, [kid], 12, "#33363d", weight="400"))
        bottom = max(bottom, spine_end)
    total_h = int(bottom + 34)
    out[0] = f'<rect x="0" y="0" width="{WIDTH}" height="{total_h}" fill="#ffffff"/>'
    return svg_page("\n".join(out), WIDTH, total_h, "Дерево задач")


# ------------------------------------------------------------------- теплокарта

def build_heatmap(data):
    name_w = 372
    cell_w = 232
    cell_h = 54
    head_h = 62
    top = 86
    left = (WIDTH - (name_w + cell_w * 2 + 18)) / 2
    rows = len(data["heuristics"])
    total_h = int(top + head_h + rows * (cell_h + 8) + 96)
    out = [f'<rect x="0" y="0" width="{WIDTH}" height="{total_h}" fill="#ffffff"/>']
    out.append(f'<text x="{WIDTH/2}" y="34" font-size="20" font-weight="700" fill="{INK}" text-anchor="middle">'
               f'Тепловая карта нарушений эвристик Нильсена</text>')
    out.append(f'<text x="{WIDTH/2}" y="56" font-size="14" fill="{MUTED}" text-anchor="middle">'
               f'0 — нет проблемы, 1 — незначительная, 2 — значительная, 3 — критическая</text>')
    out.append(f'<text x="{left + name_w + cell_w/2}" y="{top + 22}" font-size="15" font-weight="700" '
               f'fill="{BG_A}" text-anchor="middle">Туту.ру</text>')
    out.append(f'<text x="{left + name_w + cell_w*1.5 + 18}" y="{top + 22}" font-size="15" font-weight="700" '
               f'fill="{BG_B}" text-anchor="middle">РЖД (rzd.ru)</text>')
    out.append(f'<text x="{left + 6}" y="{top + 22}" font-size="14" font-weight="600" fill="{MUTED}">'
               f'Эвристика</text>')

    y = top + head_h
    for h in data["heuristics"]:
        out.append(f'<text x="{left + 4}" y="{y + cell_h/2 + 5}" font-size="13.5" fill="{INK}">'
                   f'{esc(HEURISTIC_ROWS[h["n"]-1])}</text>')
        for idx, key in enumerate(("A", "B")):
            score = h[key]["score"]
            fill, ink, _ = SCORE_COLORS[score]
            cx = left + name_w + idx * (cell_w + 18)
            out.append(f'<rect x="{cx}" y="{y}" width="{cell_w}" height="{cell_h}" rx="7" fill="{fill}"/>')
            out.append(f'<text x="{cx + 20}" y="{y + cell_h/2 + 8}" font-size="20" font-weight="700" '
                       f'fill="{ink}">{score}</text>')
            cap = SCORE_COLORS[score][2]
            out.append(f'<text x="{cx + 48}" y="{y + cell_h/2 + 6}" font-size="13" fill="{ink}">{cap}</text>')
        y += cell_h + 8

    # legend
    ly = y + 24
    out.append(f'<text x="{left}" y="{ly + 14}" font-size="13" fill="{MUTED}">Оценка:</text>')
    for i, score in enumerate((0, 1, 2, 3)):
        fill, ink, cap = SCORE_COLORS[score]
        bx = left + 70 + i * 178
        out.append(f'<rect x="{bx}" y="{ly}" width="24" height="20" rx="4" fill="{fill}"/>')
        out.append(f'<text x="{bx + 32}" y="{ly + 15}" font-size="13" fill="{INK}">{score} — {cap}</text>')
    return svg_page("\n".join(out), WIDTH, total_h, "Тепловая карта")


# --------------------------------------------------------------- узкие места

def build_bottlenecks(data):
    times = {"A": [step_time(s, "A") for s in data["steps"]],
             "B": [step_time(s, "B") for s in data["steps"]]}
    loads = {"A": [s["A"]["load"] for s in data["steps"]],
             "B": [s["B"]["load"] for s in data["steps"]]}

    left, right = 74, 24
    plot_w = WIDTH - left - right
    p1_top, p1_h = 92, 236
    p2_top, p2_h = 452, 140
    total_h = int(p2_top + p2_h + 78)

    out = [f'<rect x="0" y="0" width="{WIDTH}" height="{total_h}" fill="#ffffff"/>']
    out.append(f'<text x="{WIDTH/2}" y="34" font-size="20" font-weight="700" fill="{INK}" text-anchor="middle">'
               f'Диаграмма узких мест: время шага и когнитивная нагрузка</text>')
    out.append(f'<text x="{WIDTH/2}" y="56" font-size="13.5" fill="{MUTED}" text-anchor="middle">'
               f'время по модели KLM с учётом измеренного отклика интерфейса, секунды</text>')

    vmax = max(max(times["A"]), max(times["B"]))
    vmax = 8 * int(vmax / 8 + 1)
    ticks = [round(vmax * i / 4) for i in range(5)]

    out.append(f'<line x1="{left}" y1="{p1_top}" x2="{left}" y2="{p1_top + p1_h}" stroke="{LINE}" stroke-width="1.5"/>')
    for t in ticks:
        y = p1_top + p1_h - p1_h * t / vmax
        out.append(f'<line x1="{left}" y1="{y}" x2="{left + plot_w}" y2="{y}" stroke="#e6e7ea" stroke-width="1"/>')
        out.append(f'<text x="{left - 10}" y="{y + 4}" font-size="12" fill="{MUTED}" text-anchor="end">{t}</text>')

    group_w = plot_w / 5
    bar_w = 46
    for i, step in enumerate(data["steps"]):
        base_x = left + group_w * i + group_w / 2
        for j, key in enumerate(("A", "B")):
            value = times[key][i]
            h = p1_h * value / vmax
            x = base_x - bar_w - 4 + j * (bar_w + 8)
            fill = BG_A if key == "A" else BG_B
            out.append(f'<rect x="{round(x)}" y="{round(p1_top + p1_h - h)}" width="{bar_w}" height="{round(h)}" '
                       f'rx="3" fill="{fill}"/>')
            out.append(f'<text x="{round(x + bar_w/2)}" y="{round(p1_top + p1_h - h - 7)}" font-size="12.5" '
                       f'font-weight="700" fill="{INK}" text-anchor="middle">{value}</text>')
        lines = STEP_LABELS[step["id"]].split("\n")
        out.append(text_lines(base_x, p1_top + p1_h + 24, lines, 12.5, INK, weight="400", gap=15))

    # cognitive load panel
    out.append(f'<text x="{left}" y="{p2_top - 22}" font-size="14" font-weight="600" fill="{INK}">'
               f'Субъективная когнитивная нагрузка шага (1–5)</text>')
    out.append(f'<line x1="{left}" y1="{p2_top}" x2="{left}" y2="{p2_top + p2_h}" stroke="{LINE}" stroke-width="1.5"/>')
    for v in (1, 3, 5):
        y = p2_top + p2_h - p2_h * v / 5
        out.append(f'<line x1="{left}" y1="{y}" x2="{left + plot_w}" y2="{y}" stroke="#e6e7ea" stroke-width="1"/>')
        out.append(f'<text x="{left - 10}" y="{y + 4}" font-size="12" fill="{MUTED}" text-anchor="end">{v}</text>')
    for i, step in enumerate(data["steps"]):
        base_x = left + group_w * i + group_w / 2
        for j, key in enumerate(("A", "B")):
            value = loads[key][i]
            h = p2_h * value / 5
            x = base_x - bar_w - 4 + j * (bar_w + 8)
            fill = BG_A if key == "A" else BG_B
            out.append(f'<rect x="{round(x)}" y="{round(p2_top + p2_h - h)}" width="{bar_w}" height="{round(h)}" '
                       f'rx="3" fill="{fill}" opacity="0.85"/>')
            out.append(f'<text x="{round(x + bar_w/2)}" y="{round(p2_top + p2_h - h - 7)}" font-size="12.5" '
                       f'font-weight="700" fill="{INK}" text-anchor="middle">{value}</text>')

    # legend
    ly = total_h - 40
    out.append(f'<rect x="{left}" y="{ly}" width="18" height="14" rx="3" fill="{BG_A}"/>')
    out.append(f'<text x="{left + 26}" y="{ly + 12}" font-size="13" fill="{INK}">Туту.ру</text>')
    out.append(f'<rect x="{left + 116}" y="{ly}" width="18" height="14" rx="3" fill="{BG_B}"/>')
    out.append(f'<text x="{left + 142}" y="{ly + 12}" font-size="13" fill="{INK}">РЖД (rzd.ru)</text>')
    out.append(f'<text x="{left + 300}" y="{ly + 12}" font-size="12.5" fill="{MUTED}">'
               f'шаг 3 у РЖД включает ожидание около 25 с; шаг 5 у РЖД не завершён (вход в кабинет)</text>')
    return svg_page("\n".join(out), WIDTH, total_h, "Узкие места")


def main():
    data = load_metrics()
    pages = {
        "task_tree.html": build_tree(),
        "heatmap.html": build_heatmap(data),
        "bottlenecks.html": build_bottlenecks(data),
    }
    for name, html in pages.items():
        path = BASE / name
        path.write_text(html, encoding="utf-8", newline="\n")
        print("FIG %-18s %6d байт" % (name, path.stat().st_size))

    print("\nВремя шагов по модели KLM, с:")
    print("  %-4s %-26s %8s %8s" % ("шаг", "этап", "Туту", "РЖД"))
    for step in data["steps"]:
        print("  %-4s %-26s %8.1f %8.1f" % (step["id"], step["name"], step_time(step, "A"), step_time(step, "B")))

    total = totals(data)
    print("\nИтого по сценарию:")
    for key in ("A", "B"):
        t = total[key]
        print("  %-6s время %5.1f с | кликов %2d | символов %2d | ошибок %d | сумма оценок эвристик %2d | завершено: %s"
              % (key, t["seconds"], t["clicks"], t["chars"], t["errors"], t["scores"],
                 "да" if t["completed"] else "нет"))
    print("\nРазница во времени: %+.1f с (РЖД дольше в %.1f раза)"
          % (total["B"]["seconds"] - total["A"]["seconds"],
             total["B"]["seconds"] / total["A"]["seconds"]))


if __name__ == "__main__":
    main()
