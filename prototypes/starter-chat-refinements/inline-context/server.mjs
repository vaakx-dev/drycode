import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const types = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const file = normalize(join(root, relative));
  if (!file.startsWith(root)) return response.writeHead(404).end();
  const stream = createReadStream(file);
  stream.on("open", () => {
    response.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
    stream.pipe(response);
  });
  stream.on("error", () => response.writeHead(404).end("Not found"));
}).listen(4174, "127.0.0.1", () => {
  console.log("Drycode inline context: http://127.0.0.1:4174/");
});
