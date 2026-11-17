/* Локальный приёмник PNG-кадров от Figma-плагина. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "figma_export");
fs.mkdirSync(out, { recursive: true });

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8765");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "POST" && url.pathname === "/log") {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      fs.appendFileSync(path.join(out, "_log.txt"), text + "\n");
      console.log("LOG " + text);
      res.writeHead(200);
      res.end("ok");
    });
    return;
  }
  if (req.method === "POST" && url.pathname === "/upload") {
    const raw = url.searchParams.get("name") || "shot";
    const safe = raw.replace(/[^\wа-яА-ЯёЁ0-9 _-]+/g, "_").trim();
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const file = path.join(out, safe + ".png");
      fs.writeFileSync(file, Buffer.concat(chunks));
      console.log("SAVED " + file + " (" + fs.statSync(file).size + " байт)");
      res.writeHead(200);
      res.end("ok");
    });
    return;
  }
  res.writeHead(200);
  res.end("fleur export server");
});

server.listen(8765, "127.0.0.1", () => console.log("LISTEN 127.0.0.1:8765 -> " + out));
