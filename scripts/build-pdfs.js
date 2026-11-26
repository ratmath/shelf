// Print the RatMath Shelf docs to PDF: one PDF per package and one for the
// whole Shelf, written to docs/pdf/, plus the page docs/pdf.html that lists
// them with the version, commit and date each was built from.
//
// Run it locally, typically before an npm publish:
//
//   bun run pdf                       # every package, then the Shelf PDF
//   bun run pdf linalg stats          # just these, then the Shelf PDF again
//   bun run pdf --combine             # only rebuild the Shelf PDF and the page
//   bun run pdf --from ~/ai-repos/ratmath/shelf
//   bun run pdf --live                # print https://ratmath.com/<name>/ instead
//
// Each package is printed from its built docs folder (<from>/<name>/docs), so
// run that package's docs:build first. Without --from, the script looks in
// $RATMATH_SHELF_DIR, ../ratmath/shelf, and .. (sibling checkouts), and falls
// back to the live site for a package it cannot find. It drives your installed
// Chrome through playwright-core (set CHROME_PATH to use another browser).
//
// Every page is opened in the browser so demos mount and every "Try it" box
// runs; the PDF shows their output. Pages are printed one by one with their
// own styles, joined with pdf-lib, and given a cover, a contents page with page
// numbers, bookmarks and page numbers.
import { chromium } from "playwright-core";
import { PDFDocument, PDFName, PDFHexString, PDFNumber, StandardFonts, rgb } from "pdf-lib";
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, extname, resolve } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";

const ALL = [
  "algebraic", "analytic", "discrete", "logic",
  "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
  "symbolic", "graphics", "finance",
];
// Pages that are tools rather than text; they print as an empty form.
const SKIP_PAGES = new Set(["workbench.html"]);
const OUT = "docs/pdf";
const MANIFEST = `${OUT}/manifest.json`;

// ---- arguments ---------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f) => (argv.includes(f) ? argv[argv.indexOf(f) + 1] : undefined);
const tilde = (p) => (p?.startsWith("~") ? join(homedir(), p.slice(1)) : p);
const only = argv.filter((a, i) => !a.startsWith("--") && argv[i - 1] !== "--from");
for (const n of only) if (!ALL.includes(n)) { console.error(`unknown package ${n}; known: ${ALL.join(", ")}`); process.exit(1); }
const names = flag("--combine") ? [] : only.length ? only : ALL;
const roots = [opt("--from"), process.env.RATMATH_SHELF_DIR, "../ratmath/shelf", ".."].filter(Boolean).map((p) => resolve(tilde(p)));

mkdirSync(OUT, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { packages: {} };
const today = () => new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

// ---- where each package's docs come from ----------------------------------------
function locate(name) {
  if (!flag("--live")) {
    for (const root of roots) {
      const dir = join(root, name);
      if (existsSync(join(dir, "docs/index.html")) && existsSync(join(dir, "package.json"))) {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        let commit = null, dirty = false;
        try {
          commit = execFileSync("git", ["-C", dir, "rev-parse", "--short", "HEAD"]).toString().trim();
          dirty = execFileSync("git", ["-C", dir, "status", "--porcelain", "--", "docs", "src", "package.json"]).toString().trim() !== "";
        } catch { /* not a git checkout */ }
        return { name, pkg, commit, dirty, source: dir, docsDir: join(dir, "docs") };
      }
    }
    console.warn(`  ${name}: no local checkout with built docs in ${roots.join(", ")}; using the live site`);
  }
  return { name, live: `https://ratmath.com/${name}/`, source: `https://ratmath.com/${name}/` };
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".woff2": "font/woff2" };
function serve(dir) {
  const server = createServer((req, res) => {
    const path = join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    try {
      const file = statSync(path).isDirectory() ? join(path, "index.html") : path;
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end();
    }
  }).listen(0);
  return { server, base: `http://localhost:${server.address().port}/` };
}

// ---- printing ------------------------------------------------------------------
const PRINT_CSS = `
@media print {
  html, body { background: #fff !important; }
  aside, .topbar, .topnav, .pager, nav.toc, #toc-select, .theme-switch, [data-theme-switch], .rb-try, .runbox-bar button, .sitelinks, footer.sitelinks { display: none !important; }
  .shell { display: block !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
  main, article { max-width: none !important; margin: 0 !important; padding: 0 !important; }
  h1, h2, h3, h4 { break-after: avoid; }
  pre, figure, table, svg, canvas, .runbox-out, [data-demo] > * { break-inside: avoid; }
  pre, code { white-space: pre-wrap !important; overflow-wrap: anywhere; }
  main *, article * { max-width: 100% !important; }
  .katex, .katex * { max-width: none !important; }
  table { table-layout: fixed; width: 100% !important; }
  td, th { white-space: normal !important; overflow-wrap: anywhere; }
  td:first-child, th:first-child { width: 38%; }
  pre.rb-code { margin: 0; padding: .6rem .8rem; font: 12px/1.45 "JetBrains Mono", ui-monospace, monospace; background: transparent; border: 0; }
}`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const footer = (left) => `<div style="font:8px sans-serif;width:100%;padding:0 14mm;color:#777;display:flex;justify-content:space-between"><span>${esc(left)}</span><span></span></div>`;
const PDF_OPTS = { format: "A4", printBackground: true, margin: { top: "16mm", bottom: "18mm", left: "14mm", right: "14mm" }, displayHeaderFooter: true, headerTemplate: "<span></span>" };

async function pagesOf(page, base) {
  await page.goto(base + "index.html", { waitUntil: "networkidle" });
  const links = await page.evaluate(() => {
    const seen = new Set(), out = [];
    for (const a of document.querySelectorAll("aside a[href], nav.toc a[href]")) {
      const href = a.getAttribute("href").split("#")[0].split("?")[0];
      if (!/^[\w./-]+\.html$/.test(href) || href.startsWith("http") || href.startsWith("/") || href.startsWith("..") || seen.has(href)) continue;
      seen.add(href);
      out.push({ href, title: a.textContent.replace(/\s+/g, " ").trim() });
    }
    return out;
  });
  if (!links.some((l) => l.href === "index.html")) links.unshift({ href: "index.html", title: "Introduction" });
  return links.filter((l) => !SKIP_PAGES.has(l.href));
}

async function printPage(page, url, label) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: PRINT_CSS });
  // Run every code box and wait for its output (or 20 s).
  await page.evaluate(() => { for (const b of document.querySelectorAll(".runbox [data-run]")) b.click(); });
  await page.waitForFunction(() => [...document.querySelectorAll(".runbox [data-run]")].every((b) => !b.disabled), null, { timeout: 20000 }).catch(() => console.warn(`    a code box on ${url} was still running after 20 s`));
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const i of document.querySelectorAll("input")) i.setAttribute("value", i.value);
    for (const t of document.querySelectorAll(".runbox textarea")) {
      const pre = document.createElement("pre");
      pre.className = "rb-code";
      pre.textContent = t.value;
      t.replaceWith(pre);
    }
  });
  await page.waitForTimeout(150);
  return page.pdf({ ...PDF_OPTS, footerTemplate: footer(label) });
}

async function printHtml(page, html, label) {
  await page.setContent(html, { waitUntil: "networkidle" });
  return page.pdf({ ...PDF_OPTS, footerTemplate: footer(label) });
}

// ---- assembling ----------------------------------------------------------------
async function append(doc, bytes) {
  const src = await PDFDocument.load(bytes);
  const pages = await doc.copyPages(src, src.getPageIndices());
  for (const p of pages) doc.addPage(p);
  return pages.length;
}

// Bookmarks: items are { title, page, children? }; packages start closed.
function addOutline(doc, items) {
  const ctx = doc.context;
  const pages = doc.getPages();
  const rootRef = ctx.nextRef();
  const build = (list, parent, open) => {
    const refs = list.map(() => ctx.nextRef());
    list.forEach((it, i) => {
      const d = { Title: PDFHexString.fromText(it.title), Parent: parent, Dest: [pages[it.page].ref, PDFName.of("Fit")] };
      if (i > 0) d.Prev = refs[i - 1];
      if (i < list.length - 1) d.Next = refs[i + 1];
      if (it.children?.length) {
        const kids = build(it.children, refs[i], false);
        Object.assign(d, { First: kids.first, Last: kids.last, Count: PDFNumber.of(open ? kids.count : -kids.count) });
      }
      ctx.assign(refs[i], ctx.obj(d));
    });
    return { first: refs[0], last: refs[refs.length - 1], count: list.length };
  };
  const top = build(items, rootRef, false);
  ctx.assign(rootRef, ctx.obj({ Type: "Outlines", First: top.first, Last: top.last, Count: top.count }));
  doc.catalog.set(PDFName.of("Outlines"), rootRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

async function numberPages(doc) {
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    if (i === 0) return; // the cover
    const text = `${i + 1} / ${pages.length}`;
    p.drawText(text, { x: p.getWidth() - 14 * 2.835 - font.widthOfTextAtSize(text, 8), y: 9 * 2.835, size: 8, font, color: rgb(0.47, 0.47, 0.47) });
  });
}

const STYLE = `
  @page { size: A4; margin: 16mm 14mm 18mm; }
  body { font: 11pt/1.5 "Public Sans", system-ui, sans-serif; color: #15262e; margin: 0; }
  .cover { height: 240mm; display: flex; flex-direction: column; justify-content: center; }
  .eyebrow { font-size: 9pt; letter-spacing: .16em; text-transform: uppercase; color: #b8730f; }
  h1 { font: 400 34pt/1.1 "Young Serif", Georgia, serif; margin: .2em 0 .3em; }
  h2 { font: 400 18pt/1.2 "Young Serif", Georgia, serif; margin: 0 0 .8em; }
  .lede { font-size: 13pt; color: #4a5e66; max-width: 34em; }
  .meta { color: #4a5e66; font-size: 9.5pt; margin-top: 2em; }
  .toc { break-before: page; }
  .toc ol { list-style: none; padding: 0; margin: 0; }
  .toc li { display: flex; gap: .5em; padding: .22em 0; border-bottom: 1px dotted #d5dee1; }
  .toc li span:first-child { flex: 1; }
  .toc li small { color: #4a5e66; }
  code { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: .92em; }`;
const FONTS = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Public+Sans:wght@400;600&family=JetBrains+Mono&display=swap">`;
const frontMatter = ({ eyebrow, title, lede, meta, tocTitle, rows }) => `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${STYLE}</style></head><body>
<section class="cover"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p class="lede">${esc(lede)}</p><p class="meta">${meta}</p></section>
<section class="toc"><h2>${esc(tocTitle)}</h2><ol>${rows.map((r) => `<li><span>${esc(r.title)}${r.note ? ` <small>${esc(r.note)}</small>` : ""}</span><span>${r.page}</span></li>`).join("")}</ol></section>
</body></html>`;

// Two passes: the contents pages shift every page number by their own length.
async function withFrontMatter(page, spec, chunks, label) {
  let front = 2, bytes;
  for (let pass = 0; pass < 2; pass++) {
    let at = front + 1;
    const rows = chunks.map((c) => { const r = { title: c.title, note: c.note, page: at }; at += c.pages; return r; });
    bytes = await printHtml(page, frontMatter({ ...spec, rows }), label);
    const n = (await PDFDocument.load(bytes)).getPageCount();
    if (n === front) break;
    front = n;
  }
  return { bytes, front };
}

// ---- one package -----------------------------------------------------------------
async function buildPackage(browser, name) {
  const loc = locate(name);
  let pkg = loc.pkg, server, base = loc.live;
  if (!pkg) pkg = await fetch(`https://raw.githubusercontent.com/ratmath/${name}/main/package.json`).then((r) => r.json());
  if (loc.docsDir) ({ server, base } = serve(loc.docsDir));
  const page = await browser.newPage({ colorScheme: "light", viewport: { width: 1000, height: 1300 } });
  try {
    const label = `${pkg.name} ${pkg.version}`;
    const list = await pagesOf(page, base);
    const chunks = [];
    for (const p of list) {
      const bytes = await printPage(page, base + p.href, `${label} · ${p.title}`);
      chunks.push({ ...p, bytes, pages: (await PDFDocument.load(bytes)).getPageCount() });
      process.stdout.write(".");
    }
    const built = today();
    const commit = loc.commit ? `${loc.commit}${loc.dirty ? " with uncommitted changes" : ""}` : "live site";
    const { bytes: frontBytes, front } = await withFrontMatter(page, {
      eyebrow: "RatMath Shelf", title: pkg.name, lede: pkg.description,
      meta: `Version ${esc(pkg.version)} · ${esc(commit)} · built ${esc(built)}<br>https://ratmath.com/${name}/`,
      tocTitle: "Contents",
    }, chunks, label);
    const doc = await PDFDocument.create();
    doc.setTitle(`${pkg.name} ${pkg.version}`);
    doc.setAuthor("RatMath");
    doc.setSubject(pkg.description ?? "");
    await append(doc, frontBytes);
    const outline = [];
    let at = front;
    for (const c of chunks) {
      outline.push({ title: c.title, page: at });
      at += await append(doc, c.bytes);
    }
    addOutline(doc, outline);
    const plain = await doc.save(); // unnumbered copy, for the Shelf PDF
    await numberPages(doc);
    const file = `${OUT}/${name}.pdf`;
    writeFileSync(file, await doc.save());
    writeFileSync(`${OUT}/.${name}.plain.pdf`, plain); // gitignored; kept for --combine
    manifest.packages[name] = {
      package: pkg.name, version: pkg.version, description: pkg.description ?? "", commit: loc.commit ?? null, dirty: !!loc.dirty,
      source: loc.docsDir ? "local" : "live", built, pages: doc.getPageCount(), bytes: statSync(file).size,
      outline: outline.map((o) => ({ title: o.title, page: o.page })),
    };
    console.log(`\n  ${file}: ${doc.getPageCount()} pages, ${(statSync(file).size / 1e6).toFixed(1)} MB (${pkg.version}, ${commit})`);
  } finally {
    await page.close();
    server?.close();
  }
}

// ---- the whole Shelf ---------------------------------------------------------------
async function buildShelf(browser) {
  // An unnumbered copy of each package PDF is kept beside it (gitignored);
  // rebuild a package whose copy is missing, e.g. in a fresh clone.
  for (const n of ALL) if (manifest.packages[n] && !existsSync(`${OUT}/.${n}.plain.pdf`)) {
    process.stdout.write(`${n} (for the Shelf PDF) `);
    await buildPackage(browser, n);
  }
  const have = ALL.filter((n) => manifest.packages[n]);
  if (!have.length) return console.log("no package PDFs yet, so no Shelf PDF");
  const page = await browser.newPage({ colorScheme: "light" });
  try {
    const shelfPkg = JSON.parse(readFileSync("package.json", "utf8"));
    const chunks = have.map((n) => ({ title: manifest.packages[n].package, note: `${manifest.packages[n].version} · ${manifest.packages[n].description}`, pages: manifest.packages[n].pages, n }));
    const built = today();
    const { bytes, front } = await withFrontMatter(page, {
      eyebrow: "RatMath", title: "The RatMath Shelf",
      lede: "Subject libraries for JavaScript built on RatMath Core, each with a fast preview first and then an answer that is exact or proven to contain the truth.",
      meta: `ratmath ${esc(shelfPkg.version)} · built ${esc(built)} · ${have.length} of ${ALL.length} packages<br>https://ratmath.com/shelf/`,
      tocTitle: "Packages",
    }, chunks, "The RatMath Shelf");
    const doc = await PDFDocument.create();
    doc.setTitle("The RatMath Shelf");
    doc.setAuthor("RatMath");
    await append(doc, bytes);
    const outline = [];
    let at = front;
    for (const c of chunks) {
      const m = manifest.packages[c.n];
      outline.push({ title: `${m.package} ${m.version}`, page: at, children: m.outline.map((o) => ({ title: o.title, page: at + o.page })) });
      at += await append(doc, readFileSync(`${OUT}/.${c.n}.plain.pdf`));
    }
    addOutline(doc, outline);
    await numberPages(doc);
    writeFileSync(`${OUT}/ratmath-shelf.pdf`, await doc.save());
    manifest.shelf = { version: shelfPkg.version, built, pages: doc.getPageCount(), bytes: statSync(`${OUT}/ratmath-shelf.pdf`).size, packages: have };
    console.log(`  ${OUT}/ratmath-shelf.pdf: ${doc.getPageCount()} pages, ${(manifest.shelf.bytes / 1e6).toFixed(1)} MB`);
  } finally {
    await page.close();
  }
}

// ---- docs/pdf.html ---------------------------------------------------------------------
function writePage() {
  const mb = (b) => `${(b / 1e6).toFixed(1)} MB`;
  const s = manifest.shelf;
  const rows = ALL.map((n) => {
    const m = manifest.packages[n];
    if (!m) return `<tr><td><a href="https://ratmath.com/${n}/">@ratmath/${n}</a></td><td colspan="4" class="muted">not built yet</td></tr>`;
    const commit = m.commit ? `<a href="https://github.com/ratmath/${n}/tree/${m.commit}"><code>${m.commit}</code></a>${m.dirty ? " *" : ""}` : "live site";
    return `<tr><td><a href="pdf/${n}.pdf">${esc(m.package)}</a><br><small class="muted">${esc(m.description)}</small></td><td>${esc(m.version)}</td><td>${commit}</td><td title="${esc(m.built)}">${esc(m.built.slice(0, 10))}</td><td>${m.pages} pages<br><small class="muted">${mb(m.bytes)}</small></td></tr>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>PDFs of the RatMath Shelf docs</title>
<meta name="description" content="Every RatMath Shelf library's documentation as a PDF, and all of them in one.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap">
<link rel="stylesheet" href="assets/style.css">
<script type="module" src="assets/site.js"></script>
<style>
.pdf-table { width: 100%; border-collapse: collapse; font-size: .93rem; }
.pdf-table th, .pdf-table td { text-align: left; vertical-align: top; padding: .55rem .6rem; border-bottom: 1px solid var(--line, #d9dee7); }
.pdf-table th { font-weight: 600; font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; }
.pdf-table .muted { opacity: .75; }
.pdf-wrap { overflow-x: auto; }
@media (max-width: 640px) { .pdf-table th:nth-child(3), .pdf-table td:nth-child(3) { display: none; } }
</style>
</head>
<body>
<div class="shell">
<aside></aside>
<main>
<article>
<div class="eyebrow">ratmath</div>
<h1>The docs as PDFs</h1>
<p class="lede">Each library's documentation, printed from its docs site with every demo shown and every code box run, so the output is on the page. Each PDF has a contents page and bookmarks.</p>
${s ? `<p><a href="pdf/ratmath-shelf.pdf"><strong>The whole Shelf in one PDF</strong></a>: ${s.packages.length} libraries, ${s.pages} pages, ${mb(s.bytes)}. Built ${esc(s.built)} with <code>ratmath</code> ${esc(s.version)}.</p>` : ""}
<h2>One library at a time</h2>
<div class="pdf-wrap"><table class="pdf-table">
<thead><tr><th>Library</th><th>Version</th><th>Commit</th><th>Built</th><th>Size</th></tr></thead>
<tbody>
${rows}
</tbody>
</table></div>
<p class="muted"><small>A * after a commit means the docs were printed from a checkout with uncommitted changes. The PDFs are rebuilt by hand with <code>bun run pdf</code> in <a href="https://github.com/ratmath/shelf">ratmath/shelf</a>, usually before a release, so a library's web docs can be newer than its PDF.</small></p>
</article>
</main>
</div>
</body>
</html>
`;
  // Reuse the asset hash the docs build stamped on the other pages.
  const v = /assets\/style\.css\?v=(\w+)/.exec(existsSync("docs/using.html") ? readFileSync("docs/using.html", "utf8") : "")?.[1];
  writeFileSync("docs/pdf.html", v ? html.replace(/assets\/(style\.css|site\.js)"/g, `assets/$1?v=${v}"`) : html);
  console.log("  docs/pdf.html written");
}

// ---- run ----------------------------------------------------------------------------------
const browser = process.env.CHROME_PATH
  ? await chromium.launch({ executablePath: process.env.CHROME_PATH })
  : await chromium.launch({ channel: "chrome" });
try {
  for (const name of names) {
    process.stdout.write(`${name} `);
    await buildPackage(browser, name);
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  }
  await buildShelf(browser);
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  writePage();
} finally {
  await browser.close();
}
