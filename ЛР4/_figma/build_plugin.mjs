/* Собирает code.js: вычисляет SVG букетов через site.js и склеивает части плагина. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const lab = path.resolve(here, "..");

globalThis.window = {};
globalThis.document = {
  addEventListener() {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  body: {}
};

const siteSrc = fs.readFileSync(path.join(lab, "site.js"), "utf8");
(0, eval)(siteSrc);

const Fleur = globalThis.window.Fleur;
if (!Fleur || typeof Fleur.bouquetSVG !== "function") {
  throw new Error("site.js не отдал bouquetSVG");
}

const COMPOSITIONS = {
  rose15: { items: [{ type: "rose", count: 15 }], wrap: "kraft", ribbon: "#bf6a4e", seed: 5 },
  peonyMix: { items: [{ type: "peony", count: 7 }, { type: "hydrangea", count: 2 }, { type: "eucalyptus", count: 5 }], wrap: "film", ribbon: "#d98e86", seed: 31 },
  tulip25: { items: [{ type: "tulip", count: 25 }], wrap: "kraft", ribbon: "#c8a25a", seed: 17 },
  field: { items: [{ type: "chamomile", count: 9 }, { type: "lavender", count: 5 }, { type: "eucalyptus", count: 4 }], wrap: "kraft", ribbon: "#c8a25a", seed: 9 },
  sun: { items: [{ type: "sunflower", count: 5 }, { type: "chamomile", count: 5 }, { type: "eucalyptus", count: 3 }], wrap: "basket", ribbon: "#bf6a4e", seed: 13 },
  hydrangeaMix: { items: [{ type: "hydrangea", count: 7 }, { type: "eucalyptus", count: 3 }], wrap: "film", ribbon: "#e8ddcb", seed: 27 },
  bride: { items: [{ type: "white_rose", count: 9 }, { type: "peony", count: 3 }, { type: "eucalyptus", count: 4 }], wrap: "film", ribbon: "#e8ddcb", seed: 44 },
  classicWhite: { items: [{ type: "white_rose", count: 15 }], wrap: "film", ribbon: "#e8ddcb", seed: 36 },
  terra: { items: [{ type: "rose", count: 9 }, { type: "tulip", count: 5 }, { type: "eucalyptus", count: 3 }], wrap: "kraft", ribbon: "#bf6a4e", seed: 8 },
  construct: { items: [{ type: "rose", count: 9 }, { type: "peony", count: 5 }, { type: "eucalyptus", count: 5 }], wrap: "box", ribbon: "#bf6a4e", seed: 12 }
};

const bouquets = {};
for (const [key, conf] of Object.entries(COMPOSITIONS)) {
  bouquets[key] = Fleur.bouquetSVG(conf);
}

const ORDER = ["00_head.js", "10_pages.js", "20_boards.js", "90_run.js"];
const body = ORDER.map((name) => fs.readFileSync(path.join(here, "plugin", "parts", name), "utf8")).join("\n");

const code =
  "/* Собрано build_plugin.mjs — не редактировать вручную. */\n" +
  "const BOUQUETS = " + JSON.stringify(bouquets) + ";\n" +
  body;

const out = path.join(here, "plugin", "code.js");
fs.writeFileSync(out, code);
console.log("code.js: " + (code.length / 1024).toFixed(0) + " KB, букетов: " + Object.keys(bouquets).length);
