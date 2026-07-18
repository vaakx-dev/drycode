import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const content_types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

createServer((request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const relative_path = pathname === "/" ? "index.html" : pathname.slice(1);
  const file_path = normalize(join(root, relative_path));

  if (!file_path.startsWith(root)) {
    response.writeHead(404).end();
    return;
  }

  const stream = createReadStream(file_path);
  stream.on("open", () => {
    response.writeHead(200, { "content-type": content_types[extname(file_path)] ?? "application/octet-stream" });
    stream.pipe(response);
  });
  stream.on("error", () => response.writeHead(404).end("Not found"));
}).listen(4173, "127.0.0.1", () => {
  console.log("Drycode chat-first exploration: http://127.0.0.1:4173/?variant=A");
});
