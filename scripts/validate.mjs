import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "architecture.html"];
const failures = [];

for (const page of pages) {
  const path = resolve(root, page);
  const source = await readFile(path, "utf8");

  if (!/<html lang="en">/.test(source)) failures.push(`${page}: missing English language declaration`);
  if (!/<meta name="description"/.test(source)) failures.push(`${page}: missing meta description`);
  if (!/<link rel="canonical"/.test(source)) failures.push(`${page}: missing canonical URL`);
  if (!/<h1[\s>]/.test(source)) failures.push(`${page}: missing H1`);
  if (!/data-menu-button/.test(source)) failures.push(`${page}: missing mobile navigation control`);

  const references = [...source.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#)/.test(reference)) continue;
    const localReference = reference.split("#")[0].split("?")[0];
    if (!localReference) continue;
    try {
      await access(resolve(root, localReference));
    } catch {
      failures.push(`${page}: missing local reference ${localReference}`);
    }
  }
}

const index = await readFile(resolve(root, "index.html"), "utf8");
const architecture = await readFile(resolve(root, "architecture.html"), "utf8");
const combined = `${index}\n${architecture}`;

for (const phrase of ["Demander une", "Fonctionnement", "Sécurité", "Belgique", "Conçue", "Une technologie"] ) {
  if (combined.includes(phrase)) failures.push(`French copy remains: ${phrase}`);
}

const bentoCount = (combined.match(/data-bento/g) || []).length;
if (bentoCount < 30) failures.push(`expected at least 30 interactive cards, found ${bentoCount}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} English pages, local references and ${bentoCount} bento surfaces.`);
}
