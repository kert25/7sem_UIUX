/* Рендер дерева узлов из мока в SVG/HTML — визуальная проверка вёрстки без Figma. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "preview");
fs.mkdirSync(outDir, { recursive: true });

/* ---- мок Figma API (как в mock_figma.mjs, но с сохранением дерева) ---- */
let idSeq = 1;
class Node {
  constructor(type) {
    this.type = type;
    this.id = "n" + idSeq++;
    this.name = type;
    this.children = [];
    this.parent = null;
    this._width = 100;
    this._height = 100;
    this.x = 0;
    this.y = 0;
    this.visible = true;
    this.fills = [];
    this.strokes = [];
    this.cornerRadius = 0;
    this.strokeWeight = 1;
    this.strokeAlign = "INSIDE";
    this.dashPattern = [];
    this.clipsContent = false;
    this.layoutMode = "NONE";
  }
  get width() { return this._width; }
  set width(v) { this._width = v; }
  get height() { return this._height; }
  set height(v) { this._height = v; }
  resize(w, h) { this._width = w; this._height = h; }
  rescale(k) { this._width *= k; this._height *= k; this.children.forEach((c) => c.rescale(k)); }
  appendChild(child) {
    if (child.parent) child.parent.children = child.parent.children.filter((c) => c !== child);
    child.parent = this;
    this.children.push(child);
    return child;
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  clone() {
    const copy = new Node(this.type);
    for (const key of Object.keys(this)) {
      if (["children", "parent", "id"].includes(key)) continue;
      copy[key] = this[key];
    }
    copy.children = [];
    for (const child of this.children) copy.appendChild(child.clone());
    return copy;
  }
}

class TextNode extends Node {
  constructor() {
    super("TEXT");
    this.characters = "";
    this.fontSize = 16;
    this.fontName = { family: "Segoe UI", style: "Regular" };
    this.textAutoResize = "WIDTH_AND_HEIGHT";
    this.lineHeight = { unit: "PERCENT", value: 145 };
    this.letterSpacing = { unit: "PIXELS", value: 0 };
    this.textAlignHorizontal = "LEFT";
    this.textStyleId = "";
  }
  get width() {
    if (this.textAutoResize === "HEIGHT") return this._width;
    const lines = String(this.characters).split("\n");
    const longest = Math.max(...lines.map((l) => l.length), 1);
    return Math.max(12, longest * this.fontSize * 0.52);
  }
  set width(v) { this._width = v; }
  get height() {
    if (this.textAutoResize === "WIDTH_AND_HEIGHT") {
      return String(this.characters).split("\n").length * this.fontSize * (this.lineHeight.value / 100);
    }
    return 40;
  }
  set height(v) { this._height = v; }
}

const root = new Node("DOCUMENT");
let currentPage = null;
const figma = {
  root,
  get currentPage() { return currentPage; },
  set currentPage(p) { currentPage = p; },
  createPage() { const p = new Node("PAGE"); root.appendChild(p); return p; },
  createFrame() { return new Node("FRAME"); },
  createRectangle() { return new Node("RECTANGLE"); },
  createEllipse() { return new Node("ELLIPSE"); },
  createText() { return new TextNode(); },
  createNodeFromSvg(svg) {
    const m = /viewBox="([\d.\s-]+)"/.exec(svg);
    const n = new Node("FRAME");
    if (m) {
      const parts = m[1].trim().split(/\s+/).map(Number);
      n._width = parts[2] || 100;
      n._height = parts[3] || 100;
    }
    return n;
  },
  createPaintStyle() { return { id: "ps" + idSeq++, name: "", paints: [] }; },
  createTextStyle() { return { id: "ts" + idSeq++, name: "", fontName: null, fontSize: 0, lineHeight: null, fills: [] }; },
  listAvailableFontsAsync() {
    return Promise.resolve(["Georgia", "Segoe UI", "Inter"].flatMap((family) =>
      ["Regular", "Bold", "Book", "Semibold"].map((style) => ({ fontName: { family, style } }))));
  },
  loadFontAsync() { return Promise.resolve(); },
  notify(m) { console.log("NOTIFY:", m); },
  closePlugin(m) { console.log("CLOSE:", m || ""); },
  viewport: { scrollAndZoomIntoView() {} }
};
globalThis.figma = figma;
root.appendChild(figma.createPage());
currentPage = root.children[0];

const code = fs.readFileSync(path.join(here, "plugin", "code.js"), "utf8");
(0, eval)(code);

/* ---- отрисовка ---- */
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function colorOf(p) {
  if (!p || !p.color) return null;
  const c = p.color;
  const h = (v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b);
}
function wrapWords(text, maxW, size) {
  const lines = [];
  for (const para of String(text).split("\n")) {
    const words = para.split(" ");
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (test.length * size * 0.52 > maxW && line) {
        lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    lines.push(line);
  }
  return lines;
}

function renderNode(node, dx, dy, out) {
  if (node.visible === false) return;
  const x = dx + (node.x || 0);
  const y = dy + (node.y || 0);
  const w = node.width || 0;
  const h = node.height || 0;

  if (node.type === "RECTANGLE") {
    const fill = node.fills && node.fills[0];
    const stroke = node.strokes && node.strokes[0];
    out.push(
      '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) +
      '" rx="' + (node.cornerRadius || 0) + '" fill="' + (colorOf(fill) || "none") + '"' +
      (fill && fill.opacity !== undefined ? ' fill-opacity="' + fill.opacity + '"' : "") +
      (stroke ? ' stroke="' + colorOf(stroke) + '" stroke-width="' + (node.strokeWeight || 1) + '"' +
        (node.dashPattern && node.dashPattern.length ? ' stroke-dasharray="' + node.dashPattern.join(" ") + '"' : "") : "") +
      "/>"
    );
    return;
  }
  if (node.type === "ELLIPSE") {
    const fill = node.fills && node.fills[0];
    const stroke = node.strokes && node.strokes[0];
    out.push(
      '<ellipse cx="' + (x + w / 2).toFixed(1) + '" cy="' + (y + h / 2).toFixed(1) + '" rx="' + (w / 2).toFixed(1) +
      '" ry="' + (h / 2).toFixed(1) + '" fill="' + (colorOf(fill) || "none") + '"' +
      (fill && fill.opacity !== undefined ? ' fill-opacity="' + fill.opacity + '"' : "") +
      (stroke ? ' stroke="' + colorOf(stroke) + '" stroke-width="' + (node.strokeWeight || 1) + '"' : "") +
      "/>"
    );
    return;
  }
  if (node.type === "TEXT") {
    const fill = node.fills && node.fills[0];
    const color = colorOf(fill) || "#000000";
    const size = node.fontSize || 16;
    const lh = size * ((node.lineHeight && node.lineHeight.value ? node.lineHeight.value : 145) / 100);
    const lines = node.textAutoResize === "HEIGHT" ? wrapWords(node.characters, node.width, size) : String(node.characters).split("\n");
    const anchor = node.textAlignHorizontal === "RIGHT" ? "end" : node.textAlignHorizontal === "CENTER" ? "middle" : "start";
    const tx = anchor === "end" ? x + w : anchor === "middle" ? x + w / 2 : x;
    const family = node.fontName && node.fontName.family === "Georgia" ? "Georgia, serif" : "Segoe UI, sans-serif";
    const weight = node.fontName && /Bold|Semibold/.test(node.fontName.style) ? 700 : 400;
    let s = '<text x="' + tx.toFixed(1) + '" y="' + (y + size * 0.82).toFixed(1) + '" font-family="' + family +
      '" font-size="' + size + '" font-weight="' + weight + '" fill="' + color + '" text-anchor="' + anchor + '">';
    lines.forEach((line, i) => {
      s += '<tspan x="' + tx.toFixed(1) + '" dy="' + (i === 0 ? 0 : lh).toFixed(1) + '">' + esc(line) + "</tspan>";
    });
    out.push(s + "</text>");
    return;
  }
  if (node.type === "FRAME") {
    const isBouquet = /^bouquet\//.test(node.name || "");
    if (isBouquet) {
      out.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) +
        '" fill="#F3DCD8" opacity=".55" rx="8"/>');
      out.push('<text x="' + (x + w / 2).toFixed(1) + '" y="' + (y + h / 2).toFixed(1) +
        '" font-family="Georgia" font-size="' + Math.max(10, w * 0.05) + '" fill="#B76A78" text-anchor="middle">букет ' +
        node.name.replace("bouquet/", "") + "</text>");
      return;
    }
    const fill = node.fills && node.fills[0];
    if (fill) {
      const stroke = node.strokes && node.strokes[0];
      out.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) +
        '" rx="' + (node.cornerRadius || 0) + '" fill="' + (colorOf(fill) || "none") + '"' +
        (fill.opacity !== undefined ? ' fill-opacity="' + fill.opacity + '"' : "") +
        (stroke ? ' stroke="' + colorOf(stroke) + '" stroke-width="' + (node.strokeWeight || 1) + '"' : "") + "/>");
    }
    for (const child of node.children) renderNode(child, x, y, out);
  }
}

setTimeout(() => {
  const pages = root.children.filter((c) => c.type === "PAGE");
  let count = 0;
  for (const page of pages) {
    for (const frame of page.children) {
      if (frame.type !== "FRAME") continue;
      const out = [];
      for (const child of frame.children) renderNode(child, 0, 0, out);
      const w = Math.round(frame.width);
      const h = Math.round(frame.height);
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h +
        '" viewBox="0 0 ' + w + " " + h + '"><rect width="' + w + '" height="' + h + '" fill="#FBF7F0"/>' + out.join("") + "</svg>";
      const safe = frame.name.replace(/[^a-zA-Zа-яА-Я0-9]+/g, "_");
      fs.writeFileSync(path.join(outDir, safe + ".svg"), svg);
      fs.writeFileSync(path.join(outDir, safe + ".html"),
        '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fbf7f0">' +
        '<img src="' + safe + '.svg" width="' + w + '" height="' + h + '" style="display:block"></body>');
      count++;
      console.log("SVG:", safe, w + "x" + h);
    }
  }
  console.log("готово превью:", count);
}, 1200);
