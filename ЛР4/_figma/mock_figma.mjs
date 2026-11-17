/* Мини-мок Figma Plugin API: прогоняет code.js в Node и ловит ошибки времени выполнения. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

let idSeq = 1;
const stats = { frames: 0, texts: 0, rects: 0, ellipses: 0, svg: 0, pages: 0 };

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
    this.effects = [];
    this.cornerRadius = 0;
    this.strokeWeight = 1;
    this.strokeAlign = "INSIDE";
    this.dashPattern = [];
    this.clipsContent = false;
    this.layoutMode = "NONE";
    this.primaryAxisAlignItems = "MIN";
    this.counterAxisAlignItems = "MIN";
    this.paddingLeft = 0;
    this.paddingRight = 0;
    this.layoutSizingHorizontal = "FIXED";
  }
  get width() { return this._width; }
  set width(v) { this._width = v; }
  get height() { return this._height; }
  set height(v) { this._height = v; }
  resize(w, h) {
    if (!(w > 0) || !(h > 0)) throw new Error("resize: неположительный размер " + w + "x" + h + " у " + this.type);
    this._width = w;
    this._height = h;
  }
  rescale(k) {
    if (!(k > 0)) throw new Error("rescale: неположительный коэффициент " + k);
    this._width *= k;
    this._height *= k;
    this.children.forEach((c) => c.rescale(k));
  }
  appendChild(child) {
    if (!child) throw new Error("appendChild: null");
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
    this.fontName = { family: "Inter", style: "Regular" };
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
      const lines = String(this.characters).split("\n").length;
      return lines * this.fontSize * (this.lineHeight.value / 100);
    }
    const lh = this.fontSize * (this.lineHeight.value / 100);
    const perLine = Math.max(1, Math.floor(this._width / (this.fontSize * 0.52)));
    const lines = String(this.characters).split("\n").reduce((acc, l) => acc + Math.max(1, Math.ceil(l.length / perLine)), 0);
    return Math.max(8, lines * lh);
  }
  set height(v) { this._height = v; }
}

const root = new Node("DOCUMENT");
let currentPage = null;

function createPage() {
  const p = new Node("PAGE");
  stats.pages++;
  root.appendChild(p);
  return p;
}

const figma = {
  root,
  get currentPage() { return currentPage; },
  set currentPage(p) { currentPage = p; },
  createPage,
  createFrame() { stats.frames++; return new Node("FRAME"); },
  createRectangle() { stats.rects++; return new Node("RECTANGLE"); },
  createEllipse() { stats.ellipses++; return new Node("ELLIPSE"); },
  createText() { stats.texts++; const t = new TextNode(); return t; },
  createNodeFromSvg(svg) {
    stats.svg++;
    if (typeof svg !== "string" || !svg.includes("<svg")) throw new Error("createNodeFromSvg: не SVG");
    const m = /viewBox="([\d.\s-]+)"/.exec(svg);
    const n = new Node("FRAME");
    if (m) {
      const parts = m[1].trim().split(/\s+/).map(Number);
      n._width = parts[2] || 100;
      n._height = parts[3] || 100;
    }
    return n;
  },
  createPaintStyle() { return { id: "ps" + idSeq++, name: "", paints: [], type: "PAINT" }; },
  createTextStyle() {
    return { id: "ts" + idSeq++, name: "", fontName: null, fontSize: 0, lineHeight: null, fills: [], type: "TEXT" };
  },
  listAvailableFontsAsync() {
    const fonts = [];
    for (const family of ["Georgia", "Segoe UI", "Inter"]) {
      for (const style of ["Regular", "Bold", "Book", "Semibold"]) {
        fonts.push({ fontName: { family, style } });
      }
    }
    return Promise.resolve(fonts);
  },
  loadFontAsync(font) {
    if (!font || !font.family) return Promise.reject(new Error("loadFontAsync: нет шрифта"));
    return Promise.resolve();
  },
  notify(msg) { console.log("FIGMA NOTIFY:", msg); },
  closePlugin(msg) { console.log("FIGMA CLOSE:", msg || ""); },
  viewport: { scrollAndZoomIntoView() {} }
};

globalThis.figma = figma;
root.appendChild(createPage());
currentPage = root.children[0];

const code = fs.readFileSync(path.join(here, "plugin", "code.js"), "utf8");

try {
  (0, eval)(code);
} catch (e) {
  console.error("LOAD ERROR:", e && e.stack ? e.stack : e);
  process.exit(1);
}

setTimeout(() => {
  console.log("--- ИТОГ ---");
  console.log("страниц:", root.children.filter((c) => c.type === "PAGE").length);
  console.log("фреймов:", stats.frames, "текстов:", stats.texts, "прямоугольников:", stats.rects,
    "эллипсов:", stats.ellipses, "svg:", stats.svg);
  for (const p of root.children.filter((c) => c.type === "PAGE")) {
    const frames = p.children.filter((c) => c.type === "FRAME");
    console.log("PAGE «" + p.name + "»: фреймов", frames.length,
      frames.map((f) => f.name + " " + Math.round(f.width) + "x" + Math.round(f.height)).join(" | "));
  }
}, 1500);
