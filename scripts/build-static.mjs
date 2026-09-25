import { cp, mkdir, rm } from "node:fs/promises";

const files = ["index.html", "styles.css", "app.js"];

await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });

for (const file of files) {
  await cp(file, `dist/${file}`);
}
