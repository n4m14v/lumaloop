import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.resolve(process.cwd(), "dist");

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["kB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const resolvedPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectFiles(resolvedPath);
      }

      return [resolvedPath];
    }),
  );

  return files.flat();
}

function getAssetType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".js") {
    return "js";
  }

  if (extension === ".css") {
    return "css";
  }

  if (extension === ".html") {
    return "html";
  }

  return "other";
}

async function main() {
  const files = await collectFiles(DIST_DIR);
  const rows = await Promise.all(
    files.map(async (filePath) => {
      const fileStat = await stat(filePath);

      return {
        path: path.relative(DIST_DIR, filePath),
        size: fileStat.size,
        type: getAssetType(filePath),
      };
    }),
  );

  rows.sort((left, right) => right.size - left.size);

  const totals = rows.reduce(
    (accumulator, row) => {
      accumulator.total += row.size;
      accumulator[row.type] += row.size;
      return accumulator;
    },
    { total: 0, js: 0, css: 0, html: 0, other: 0 },
  );

  const indexHtmlPath = path.join(DIST_DIR, "index.html");
  const indexHtml = await readFile(indexHtmlPath, "utf8");
  const referencedJsFiles = [...indexHtml.matchAll(/assets\/[^"' )>]+\.js/g)].map((match) => match[0]);
  const referencedCssFiles = [...indexHtml.matchAll(/assets\/[^"' )>]+\.css/g)].map((match) => match[0]);

  console.log("Build Output Summary");
  console.log("====================");
  console.log(`Total files: ${rows.length}`);
  console.log(`Total size: ${formatBytes(totals.total)}`);
  console.log(`JavaScript: ${formatBytes(totals.js)}`);
  console.log(`CSS: ${formatBytes(totals.css)}`);
  console.log(`HTML: ${formatBytes(totals.html)}`);
  console.log(`Other assets: ${formatBytes(totals.other)}`);
  console.log("");
  console.log(`Initial JS files referenced by index.html: ${referencedJsFiles.length}`);
  console.log(`Initial CSS files referenced by index.html: ${referencedCssFiles.length}`);
  console.log("");
  console.log("Largest files");
  console.log("-------------");

  for (const row of rows.slice(0, 12)) {
    console.log(`${row.type.padEnd(5)} ${formatBytes(row.size).padStart(10)}  ${row.path}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
