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
const stylesheet = await readFile(resolve(root, "assets/site.css"), "utf8");
const script = await readFile(resolve(root, "assets/site.js"), "utf8");

for (const phrase of ["Demander une", "Fonctionnement", "Sécurité", "Belgique", "Conçue", "Une technologie"] ) {
  if (combined.includes(phrase)) failures.push(`French copy remains: ${phrase}`);
}

const bentoCount = (combined.match(/data-bento/g) || []).length;
if (bentoCount < 30) failures.push(`expected at least 30 interactive cards, found ${bentoCount}`);

const spriteCount = (combined.match(/sprite-(?:outcomes|sectors|flow|layers|technology)/g) || []).length;
if (spriteCount < 50) failures.push(`expected at least 50 supplied visual placements, found ${spriteCount}`);
if (/assets\/icons\//.test(combined)) failures.push("legacy generic icon references remain in HTML");
if (!/assets\/visuals\/hero-architecture\.png/.test(index)) failures.push("latest supplied hero illustration is not integrated");
if (!/\.hero-illustration\s*\{[^}]*width:[^}]*height:\s*auto/.test(stylesheet)) failures.push("hero illustration aspect ratio is not protected");
if (!/scrollStackSelector/.test(script) || !/scroll-stack/.test(script)) failures.push("scroll-stacking bento groups are missing");
if (!/\.scroll-stack[^}]*display:\s*block/.test(stylesheet) || !/position:\s*sticky/.test(stylesheet)) failures.push("mobile sticky bento stacking is incomplete");
if (/bento-stack-layers|stackPalette/.test(`${stylesheet}\n${script}`)) failures.push("deprecated shadow-based stacking remains");
if (!/pointerout/.test(script) || !/prefers-reduced-motion/.test(script)) failures.push("motion-safe bento reset logic is incomplete");
if (!/activeHeroTouch/.test(script) || !/touchstart/.test(script) || !/touchmove/.test(script) || !/touchend/.test(script)) failures.push("finger-driven hero interaction is missing");
if (!/\.hero-diagram[^}]*touch-action:\s*pan-y/.test(stylesheet)) failures.push("hero touch interaction does not preserve vertical scrolling");

for (const spriteClass of ["outcomes", "sectors", "flow", "layers", "technology"]) {
  const pattern = new RegExp(`\\.sprite-${spriteClass}\\s*\\{[^}]*aspect-ratio:`);
  if (!pattern.test(stylesheet)) failures.push(`sprite-${spriteClass}: intrinsic tile ratio is not protected`);
}

for (const match of stylesheet.matchAll(/url\("([^"]+)"\)/g)) {
  const reference = match[1];
  if (/^(?:data:|https?:)/.test(reference)) continue;
  try {
    await access(resolve(root, "assets", reference));
  } catch {
    failures.push(`site.css: missing local reference ${reference}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} English pages, ${bentoCount} bento surfaces and ${spriteCount} supplied visual placements.`);
}
