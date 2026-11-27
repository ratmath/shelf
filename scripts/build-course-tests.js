// Build the Course Test pages: docs/course-test/.
//
// Each course in course-test/<nn>-<slug>.js has twenty exercises. Every
// exercise carries an answer worked out independently (by hand, never with
// RatMath) and the RatMath code that answers it with only Core and the Shelf
// libraries. This script runs that code, compares what it prints with the
// independent answer, and writes four kinds of page:
//
//   docs/course-test/index.html           the Course Test page: every course, with tallies
//   docs/course-test/<slug>.html           the test itself (questions only)
//   docs/course-test/<slug>-answers.html   the independent answers, with working
//   docs/course-test/<slug>-ratmath.html   the RatMath code, its output, and the verdict
//   docs/course-test/findings.html         every disagreement, error, partial answer and gap
//
// The libraries are not on npm yet, so the code runs against a checkout that
// has all of them installed together with one Core: by default the umbrella
// repository ratmath/ratmath, where this repository sits at shelf/ratmath
// (so the root is ../..). Point elsewhere with --root <dir> or RATMATH_ROOT.
//
//   bun run course-tests [--root <dir>] [--only <slug>] [--report] [--no-write]
//
// --report prints every exercise's output and verdict to the terminal.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { renderMath, escapeHtml, KATEX_LINK } from "./docs-kit.js";
import { runCode } from "../docs/assets/runbox.js";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const ROOT = resolve(opt("--root") ?? process.env.RATMATH_ROOT ?? "../..");
const ONLY = opt("--only");
const REPORT = args.includes("--report");
const WRITE = !args.includes("--no-write");

export const LIBRARIES = ["core", "algebraic", "analytic", "linalg", "graphics", "structures", "symbolic", "complex", "discrete", "stats", "numtheory", "logic", "chaos", "geo", "finance"];

async function loadScope() {
  const scope = {};
  const versions = {};
  for (const name of LIBRARIES) {
    const dir = join(ROOT, "node_modules", "@ratmath", name);
    if (!existsSync(join(dir, "package.json"))) throw new Error(`@ratmath/${name} not found under ${ROOT}/node_modules (use --root <dir>)`);
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    versions[name] = pkg.version;
    const main = pkg.exports?.["."]?.default ?? pkg.exports?.["."] ?? pkg.main ?? "index.js";
    scope[name] = await import(pathToFileURL(join(dir, typeof main === "string" ? main : "index.js")).href);
  }
  // Core's subpaths: units (Q, units) and refine.
  scope.units = await import(pathToFileURL(join(ROOT, "node_modules", "@ratmath", "core", "src", "units.js")).href);
  // Core's everyday names at the top, as in the ratmath package.
  for (const [k, v] of Object.entries(scope.core)) if (k !== "default") scope[k] = v;
  return { scope, versions };
}

// ------------------------------------------------------------------ verdicts

// A BigInt prints as 7n; the suffix is a JavaScript type marker, not part of the value.
const norm = (s) => String(s).replace(/\s+/g, " ").replace(/(\d)n\b/g, "$1").trim();

/** Compare a run with an exercise's independent answer. */
function judge(ex, res) {
  const out = res.hasValue ? res.text : res.prints.map((p) => p.text).join("\n");
  if (ex.status === "gap" && !ex.code) return { verdict: "gap", out: "" };
  if (res.error) return { verdict: ex.status === "gap" ? "gap" : "error", out: `${res.error.name}: ${res.error.message}` };
  let agree;
  if (typeof ex.check === "function") {
    try {
      agree = !!ex.check(res.value, out);
    } catch (e) {
      agree = false;
    }
  } else if (ex.expect instanceof RegExp) agree = ex.expect.test(out);
  else if (Array.isArray(ex.expect)) agree = ex.expect.some((e) => norm(e) === norm(out));
  else if (ex.expect !== undefined) agree = norm(ex.expect) === norm(out);
  else agree = false;
  if (!agree) return { verdict: ex.status === "gap" ? "gap" : "disagrees", out };
  return { verdict: ex.status === "partial" ? "partial" : ex.status === "gap" ? "gap" : "agrees", out };
}

/**
 * Pull requests that fix what the Course Test found, by "repo#number". An
 * exercise names the one that fixes it with `fix`. The first eight were merged
 * on 2026-11-27; the rest come from the roadmap batches (course-test/ROADMAP.md)
 * and the pages are built against their branches until they merge.
 */
export const FIX_PRS = {
  "stats#7": "textbook quartiles (<code>method: \"halves\"</code>, <code>\"tukey\"</code>); finite distributions accept Core's <code>Integer</code>",
  "algebraic#9": "the arithmetic reads plain numbers, so <code>sqrt(48)</code> works",
  "geo#10": "<code>dot</code> and <code>cross</code> exported",
  "symbolic#8": "improper integrals: <code>\"inf\"</code> ends and integrands unbounded at an end",
  "analytic#18": "exact starting values, <code>pointwise</code> limits, <code>sec</code>/<code>csc</code>/<code>cot</code>, integrating factors with \\(1/|x|\\), <code>ODESolution</code> exported",
  "numtheory#9": "<code>egcd</code>, <code>gcd</code>, <code>isqrt</code> and friends read any whole number",
  "chaos#8": "the escape test compares sizes, so long bounded orbits are not refused",
  "finance#6": "<code>parity</code> takes enclosed prices",
  "numtheory#10": "<code>factorialValuation</code> (Legendre's formula)",
  "structures#6": "<code>sign</code>/<code>isEven</code> of a permutation; Gauss–Wantzel inside <code>constructible</code>",
  "complex#7": "<code>cauchyRiemann(u, v)</code>",
  "stats#8": "summaries in <code>meanInterval</code>/<code>varianceInterval</code>; closed-form <code>power</code> and <code>sampleSize</code>",
  "geo#11": "measurement helpers, 3D <code>vector</code> and <code>plane</code>, <code>conicProperties</code>",
  "analytic#19": "<code>termsForError</code>, <code>newton(..., { exact: true })</code>, <code>darboux</code>, <code>pde.classify</code>",
  "algebraic#10": "<code>toFixed(k, mode)</code> on algebraic numbers",
  "core#15": "<code>roundInteger</code> and friends, <code>digits</code>/<code>placeValue</code>, US coins, <code>toClock</code>",
};
const fixLink = (id) => {
  const [repo, n] = id.split("#");
  return `<a href="https://github.com/ratmath/${repo}/pull/${n}">ratmath/${repo}#${n}</a>`;
};
const fixHtml = (ex) => (ex.fix ? [ex.fix].flat().map((id) => `<div class="fix">Fix: ${fixLink(id)}, ${FIX_PRS[id] ?? ""}</div>`).join("") : "");

export const VERDICTS = {
  agrees: { label: "Agrees", cls: "v-ok", blurb: "RatMath's answer is the independent answer." },
  partial: { label: "Partly", cls: "v-part", blurb: "RatMath gets the answer, but not all of what the question asks (a form, a step, a proof, or only a numeric check)." },
  gap: { label: "Can't yet", cls: "v-gap", blurb: "The libraries have no tool for this yet." },
  disagrees: { label: "Disagrees", cls: "v-bad", blurb: "RatMath's answer differs from the independent answer." },
  error: { label: "Error", cls: "v-bad", blurb: "The RatMath code threw an error." },
};

// ------------------------------------------------------------------ pages

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap">`;

const CSS = `<style>
.ct-tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin: .4rem 0 1.4rem; }
.ct-tabs a { padding: .3rem .7rem; border: 1px solid var(--line); border-radius: 999px; text-decoration: none; font-size: .88rem; color: var(--fg); background: var(--surface); }
.ct-tabs a.on { border-color: var(--accent); color: var(--accent); font-weight: 600; }
ol.ex { padding-left: 0; list-style: none; counter-reset: ex; display: flex; flex-direction: column; gap: 1rem; }
ol.ex > li { max-width: none; border: 1px solid var(--line); background: var(--surface); border-radius: 10px; padding: .8rem 1rem; }
ol.ex > li > .head { display: flex; flex-wrap: wrap; gap: .3rem .7rem; align-items: baseline; margin-bottom: .3rem; }
ol.ex > li > .head .n { font: 600 1rem/1 var(--font-display); }
ol.ex > li > .head .topic { color: var(--muted); font-size: .82rem; }
ol.ex > li > .head .v { margin-left: auto; }
.ex .q { margin: .2rem 0; }
.ex .lbl { font: 600 .7rem/1 var(--font-body); text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin: .8rem 0 .3rem; }
.ex pre { margin: .2rem 0; }
.ex pre.out { background: var(--exact-soft); border-color: transparent; white-space: pre-wrap; overflow-wrap: anywhere; }
.ex pre.out.bad { background: var(--sunk); border-color: var(--bad); }
.ex .note { border-left: 3px solid var(--float); background: var(--float-soft); padding: .45rem .7rem; border-radius: 6px; margin-top: .6rem; font-size: .9rem; }
.ex .fix, .ct .fix { border-left: 3px solid var(--accent, #4a7); padding: .3rem .7rem; margin-top: .4rem; font-size: .88rem; }
.ex .work { color: var(--fg); }
.v { display: inline-block; font: 600 .7rem/1 var(--font-body); text-transform: uppercase; letter-spacing: .06em; padding: .28rem .5rem; border-radius: 999px; white-space: nowrap; }
.v-ok { background: var(--exact-soft); color: var(--exact); }
.v-part { background: var(--float-soft); color: var(--float); }
.v-gap { background: var(--sunk); color: var(--muted); border: 1px dashed var(--line); }
.v-bad { background: var(--bad); color: var(--surface); }
table.ct { border-collapse: collapse; width: 100%; font-size: .9rem; }
table.ct th, table.ct td { text-align: left; vertical-align: top; padding: .45rem .5rem; border-bottom: 1px solid var(--line); }
table.ct th { font: 600 .72rem/1.3 var(--font-body); text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
table.ct td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
table.ct tr.grp th { padding-top: 1.4rem; font: 600 .95rem/1.3 var(--font-display); text-transform: none; letter-spacing: 0; color: var(--fg); }
table.ct td .links { display: flex; gap: .6rem; flex-wrap: wrap; font-size: .85rem; }
.bar { display: flex; height: .55rem; border-radius: 999px; overflow: hidden; background: var(--sunk); min-width: 6rem; margin-top: .35rem; }
.bar span { display: block; }
.bar .b-ok { background: var(--exact); } .bar .b-part { background: var(--float); } .bar .b-gap { background: var(--line); } .bar .b-bad { background: var(--bad); }
.legend { display: flex; flex-wrap: wrap; gap: .5rem 1rem; font-size: .85rem; color: var(--muted); align-items: center; }
</style>`;

function shell({ title, description, eyebrow, body, nav, wide = false }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
${FONTS}
${KATEX_LINK}
<link rel="stylesheet" href="../assets/style.css">
${CSS}
</head>
<body>
<div class="shell">
<aside>
<header class="brand"><a href="../index.html"><div class="mark">RatMath <span>shelf</span></div></a><small>Course Test</small></header>
<nav class="toc" aria-label="Courses">${nav}</nav>
</aside>
<main>
<article${wide ? ' class="wide"' : ""}>
${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}
${body}
<footer class="sitelinks"><a href="index.html">Course Test</a> · <a href="findings.html">Findings</a> · <a href="../index.html">The Shelf</a> · <a href="https://github.com/ratmath/shelf">GitHub</a> · <a href="https://ratmath.com/">ratmath.com</a></footer>
</article>
</main>
</div>
</body>
</html>
`;
}

function navHtml(courses, here) {
  const out = [`<a href="index.html"${here === "index" ? ' class="on"' : ""}>Course Test</a>`, `<a href="findings.html"${here === "findings" ? ' class="on"' : ""}>Findings</a>`];
  let level = null;
  for (const c of courses) {
    if (c.level !== level) {
      level = c.level;
      out.push(`<div class="group">${escapeHtml(level)}</div>`);
    }
    out.push(`<a href="${c.slug}.html"${here === c.slug ? ' class="on"' : ""}>${escapeHtml(c.title)}</a>`);
  }
  return out.join("\n");
}

const badge = (v) => `<span class="v ${VERDICTS[v].cls}">${VERDICTS[v].label}</span>`;

function tabs(c, here) {
  const t = [
    ["test", `${c.slug}.html`, "Test"],
    ["answers", `${c.slug}-answers.html`, "Independent answers"],
    ["ratmath", `${c.slug}-ratmath.html`, "RatMath answers"],
  ];
  return `<nav class="ct-tabs" aria-label="This course">${t.map(([k, href, label]) => `<a href="${href}"${k === here ? ' class="on"' : ""}>${label}</a>`).join("")}</nav>`;
}

function exHead(c, i, ex, verdict) {
  return `<div class="head"><span class="n">${i + 1}.</span>${ex.topic ? `<span class="topic">${escapeHtml(ex.topic)}</span>` : ""}${verdict ? `<span class="v-wrap" style="margin-left:auto">${badge(verdict)}</span>` : ""}</div>`;
}

function testPage(c, courses) {
  const items = c.exercises.map((ex, i) => `<li id="q${i + 1}">${exHead(c, i, ex)}<div class="q">${ex.q}</div></li>`).join("\n");
  const body = `<h1>${escapeHtml(c.title)}: test</h1>
${tabs(c, "test")}
<p class="lede">${c.blurb}</p>
<p class="small muted">Twenty exercises of the kind this course sets. Answers are on the <a href="${c.slug}-answers.html">independent answers</a> page; the same exercises done with RatMath are on the <a href="${c.slug}-ratmath.html">RatMath answers</a> page.</p>
<ol class="ex">
${items}
</ol>`;
  return shell({ title: `${c.title}: test · RatMath Course Test`, description: `Twenty representative exercises from ${c.title}.`, eyebrow: `Course Test · ${escapeHtml(c.level)}`, body, nav: navHtml(courses, c.slug) });
}

function answersPage(c, courses) {
  const items = c.exercises
    .map((ex, i) => `<li id="q${i + 1}">${exHead(c, i, ex)}<div class="q">${ex.q}</div>
<div class="lbl">Answer</div><div class="a">${ex.a}</div>${ex.work ? `\n<div class="lbl">Working</div><div class="work">${ex.work}</div>` : ""}</li>`)
    .join("\n");
  const body = `<h1>${escapeHtml(c.title)}: independent answers</h1>
${tabs(c, "answers")}
<p class="lede">Each answer here was worked out by hand, without RatMath, before the RatMath code was written. Where the arithmetic is long, the working says how it was checked.</p>
<ol class="ex">
${items}
</ol>`;
  return shell({ title: `${c.title}: answers · RatMath Course Test`, description: `Independent answers to the ${c.title} test.`, eyebrow: `Course Test · ${escapeHtml(c.level)}`, body, nav: navHtml(courses, `${c.slug}`) });
}

function ratmathPage(c, courses) {
  const items = c.results
    .map(({ ex, verdict, out }, i) => {
      const bad = verdict === "disagrees" || verdict === "error";
      const code = ex.code ? `<div class="lbl">RatMath code</div><pre><code>${escapeHtml(ex.code.trim())}</code></pre>
<div class="lbl">Output</div><pre class="out${bad ? " bad" : ""}">${escapeHtml(out || "(nothing)")}</pre>` : "";
      const shown = typeof ex.expect === "string" ? ex.expect : ex.check?.text ?? (ex.expect instanceof RegExp ? `matching ${ex.expect}` : undefined);
      const expect = shown !== undefined && ex.code ? `<div class="lbl">Independent answer, in RatMath's notation</div><pre>${escapeHtml(shown)}</pre>` : "";
      return `<li id="q${i + 1}">${exHead(c, i, ex, verdict)}<div class="q">${ex.q}</div>
<div class="lbl">Independent answer</div><div class="a">${ex.a}</div>
${code}${verdict !== "agrees" && verdict !== "partial" ? expect : ""}${ex.note ? `\n<div class="note">${ex.note}</div>` : ""}${fixHtml(ex)}</li>`;
    })
    .join("\n");
  const t = tally(c.results);
  const body = `<h1>${escapeHtml(c.title)}: RatMath answers</h1>
${tabs(c, "ratmath")}
<p class="lede">The same twenty exercises, answered with RatMath Core and the Shelf libraries only. The code below was run when this page was built; its output is shown as printed, and compared with the independent answer.</p>
${tallyLine(t)}
<p class="small muted">Libraries used here: ${c.libs.map((l) => `<code>${l}</code>`).join(", ") || "none"}. In this code each library is in scope under its own name (<code>linalg.det</code>, <code>stats.tTest</code>), and Core's names (<code>R</code>, <code>Rational</code>, …) are in scope directly.</p>
<ol class="ex">
${items}
</ol>`;
  return shell({ title: `${c.title}: RatMath answers · RatMath Course Test`, description: `The ${c.title} test answered with the RatMath libraries, compared with independent answers.`, eyebrow: `Course Test · ${escapeHtml(c.level)}`, body, nav: navHtml(courses, c.slug) });
}

function tally(results) {
  const t = { agrees: 0, partial: 0, gap: 0, disagrees: 0, error: 0 };
  for (const r of results) t[r.verdict]++;
  return t;
}

function tallyLine(t) {
  return `<p class="legend">${Object.keys(VERDICTS)
    .filter((k) => t[k])
    .map((k) => `${badge(k)} ${t[k]}`)
    .join(" ")}</p>`;
}

function bar(t, n) {
  const seg = (k, cls) => (t[k] ? `<span class="${cls}" style="width:${(100 * t[k]) / n}%"></span>` : "");
  return `<div class="bar" aria-hidden="true">${seg("agrees", "b-ok")}${seg("partial", "b-part")}${seg("gap", "b-gap")}${seg("disagrees", "b-bad")}${seg("error", "b-bad")}</div>`;
}

function indexPage(courses, versions, intro) {
  let rows = "";
  let level = null;
  const all = { agrees: 0, partial: 0, gap: 0, disagrees: 0, error: 0 };
  for (const c of courses) {
    if (c.level !== level) {
      level = c.level;
      rows += `<tr class="grp"><th colspan="6">${escapeHtml(level)}</th></tr>\n`;
    }
    const t = tally(c.results);
    for (const k in t) all[k] += t[k];
    rows += `<tr><td><strong><a href="${c.slug}.html">${escapeHtml(c.title)}</a></strong><div class="small muted">${c.short ?? ""}</div><div class="links"><a href="${c.slug}.html">Test</a><a href="${c.slug}-answers.html">Answers</a><a href="${c.slug}-ratmath.html">RatMath</a></div></td>
<td class="num">${t.agrees}</td><td class="num">${t.partial}</td><td class="num">${t.gap}</td><td class="num">${t.disagrees + t.error}</td><td>${bar(t, c.results.length)}</td></tr>\n`;
  }
  const n = Object.values(all).reduce((a, b) => a + b, 0);
  const body = `<h1>Course Test</h1>
<p class="lede">How far do the RatMath libraries reach across school and university mathematics? For each course, a twenty-question test of the kind the course sets; answers worked out independently, by hand; and the same test answered with RatMath Core and the Shelf libraries alone. Every question where the two disagree, or the libraries fall short, is listed under <a href="findings.html">Findings</a>.</p>
${intro}
<h2>Overall</h2>
<p>${courses.length} courses, ${n} exercises.</p>
${tallyLine(all)}
${bar(all, n)}
<ul class="small" style="list-style:none;padding:0">${Object.entries(VERDICTS)
    .map(([k, v]) => `<li>${badge(k)} ${v.blurb}</li>`)
    .join("")}</ul>
<h2>Courses</h2>
<div class="tablewrap"><table class="ct">
<thead><tr><th>Course</th><th class="num">Agrees</th><th class="num">Partly</th><th class="num">Can't yet</th><th class="num">Wrong</th><th></th></tr></thead>
<tbody>
${rows}</tbody></table></div>
<h2>Versions tested</h2>
<p class="small">${Object.entries(versions)
    .map(([k, v]) => `<code>@ratmath/${k}</code> ${v}`)
    .join(", ")}.</p>`;
  return shell({ title: "Course Test · RatMath Shelf", description: "Twenty-question tests from school and university mathematics courses, answered by hand and with the RatMath libraries, side by side.", eyebrow: "RatMath Shelf", body, nav: navHtml(courses, "index"), wide: true });
}

function findingsPage(courses) {
  const groups = { disagrees: [], error: [], partial: [], gap: [] };
  for (const c of courses)
    c.results.forEach((r, i) => {
      const k = r.verdict === "agrees" ? null : r.verdict;
      if (k) groups[k].push({ c, r, i });
    });
  const titles = { disagrees: "Disagreements", error: "Errors", partial: "Partial answers", gap: "Gaps: what the libraries can't do yet" };
  const sections = Object.entries(groups)
    .map(([k, list]) => {
      const lis = list.length
        ? list.map(({ c, r, i }) => `<tr><td>${badge(r.verdict)}</td><td><a href="${c.slug}-ratmath.html#q${i + 1}">${escapeHtml(c.title)} ${i + 1}</a>${r.ex.topic ? `<div class="small muted">${escapeHtml(r.ex.topic)}</div>` : ""}</td><td>${r.ex.note ?? (r.verdict === "error" ? `<code>${escapeHtml(r.out)}</code>` : "")}${fixHtml(r.ex)}</td></tr>`).join("\n")
        : `<tr><td colspan="3" class="muted">None.</td></tr>`;
      return `<h2>${titles[k]} (${list.length})</h2>\n<div class="tablewrap"><table class="ct"><tbody>\n${lis}\n</tbody></table></div>`;
    })
    .join("\n");
  const fixedBy = {};
  for (const c of courses) c.exercises.forEach((ex, i) => [ex.fix ?? []].flat().forEach((id) => (fixedBy[id] ??= []).push(`<a href="${c.slug}-ratmath.html#q${i + 1}">${escapeHtml(c.title)} ${i + 1}</a>`)));
  const fixes = Object.entries(FIX_PRS)
    .map(([id, what]) => `<tr><td>${fixLink(id)}</td><td>${what}</td><td>${(fixedBy[id] ?? []).join(", ")}</td></tr>`)
    .join("\n");
  const body = `<h1>Findings</h1>
<p class="lede">Every exercise in the <a href="index.html">Course Test</a> where RatMath's answer is not simply the independent answer: disagreements and errors first, then partial answers, then the gaps.</p>
<h2>Fixes</h2>
<p>The bugs the test found, and the helpers it showed were missing, are fixed in these pull requests. The first eight are merged; the rest come from the follow-up roadmap and the pages are built against their branches until they merge. The exercises below show the fixed behaviour.</p>
<div class="tablewrap"><table class="ct"><thead><tr><th>Pull request</th><th>What it fixes</th><th>Exercises</th></tr></thead><tbody>
${fixes}
</tbody></table></div>
<p>Packaging, not mathematics: <code>@ratmath/chaos</code> asks for <code>@ratmath/complex</code> <code>^0.2.0</code> while complex is at 0.3.0, and <code>@ratmath/symbolic</code> asks for <code>@ratmath/structures</code> <code>^0.1.0</code> while structures is at 0.5.0. Both ranges are being raised in <a href="https://github.com/ratmath/chaos/pull/7">ratmath/chaos#7</a> and <a href="https://github.com/ratmath/symbolic/pull/7">ratmath/symbolic#7</a>.</p>
${sections}`;
  return shell({ title: "Findings · RatMath Course Test", description: "Where the RatMath libraries disagree with independent answers, fail, or cannot yet answer course exercises.", eyebrow: "Course Test", body, nav: navHtml(courses, "findings"), wide: true });
}

// ------------------------------------------------------------------ main

const SRC = "course-test";
const OUT = "docs/course-test";
const { scope, versions } = await loadScope();
// Bun's transpiler writes non-ASCII characters inside String.raw templates as
// \uXXXX escapes, which String.raw then keeps literally (Node does not). Turn
// such escapes of non-ASCII characters back into the characters. TeX has no
// command spelled \u followed by four hex digits, so this cannot eat one.
function fixRaw(v) {
  if (typeof v === "string") return v.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => (parseInt(h, 16) >= 0x80 ? String.fromCharCode(parseInt(h, 16)) : m));
  if (Array.isArray(v)) return v.map(fixRaw);
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "check" ? x : fixRaw(x)]));
  return v;
}
const files = readdirSync(SRC).filter((f) => /^\d+-[\w-]+\.js$/.test(f)).sort();
const courses = [];
let problems = 0;
for (const f of files) {
  const mod = (await import(pathToFileURL(resolve(SRC, f)).href)).default;
  const slug = f.replace(/^\d+-/, "").replace(/\.js$/, "");
  const c = fixRaw({ slug, ...mod });
  if (ONLY && slug !== ONLY) {
    if (!WRITE) continue;
  }
  if (c.exercises.length !== 20) console.warn(`⚠ ${slug}: ${c.exercises.length} exercises (want 20)`);
  c.results = [];
  const used = new Set();
  for (const [i, ex] of c.exercises.entries()) {
    let res = { hasValue: false, prints: [], error: null };
    if (ex.code) {
      res = await runCode(ex.code, scope);
      for (const l of LIBRARIES) if (new RegExp(`\\b${l}\\.`).test(ex.code)) used.add(l);
    }
    const j = judge(ex, res);
    c.results.push({ ex, ...j });
    if (j.verdict === "disagrees" || j.verdict === "error") problems++;
    if (REPORT && (!ONLY || slug === ONLY)) {
      console.log(`${slug} ${i + 1} [${j.verdict}] ${ex.topic ?? ""}`);
      for (const p of res.prints ?? []) console.log(`   print: ${p.text}`);
      console.log(`   out:    ${j.out}`);
      if (j.verdict !== "agrees") console.log(`   expect: ${ex.expect ?? ex.expectText ?? ex.check?.text}`);
    }
  }
  if (!used.has("core") && c.exercises.some((ex) => ex.code)) used.add("core");
  c.libs = LIBRARIES.filter((l) => used.has(l));
  courses.push(c);
}
const LEVEL_ORDER = ["School: elementary and middle", "School: high school", "University: first two years", "University: upper level"];
courses.sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level));

if (WRITE) {
  mkdirSync(OUT, { recursive: true });
  const intro = existsSync(`${SRC}/intro.html`) ? readFileSync(`${SRC}/intro.html`, "utf8") : "";
  const pages = [["index.html", indexPage(courses, versions, intro)], ["findings.html", findingsPage(courses)]];
  for (const c of courses) pages.push([`${c.slug}.html`, testPage(c, courses)], [`${c.slug}-answers.html`, answersPage(c, courses)], [`${c.slug}-ratmath.html`, ratmathPage(c, courses)]);
  let formulas = 0;
  for (const [name, html] of pages) {
    const m = renderMath(html);
    formulas += m.count;
    writeFileSync(join(OUT, name), m.html);
  }
  console.log(`${pages.length} pages written to ${OUT}/ (${formulas} formulas typeset)`);
}
const all = tally(courses.flatMap((c) => c.results));
console.log(`${courses.length} courses: ${Object.entries(all).map(([k, v]) => `${v} ${k}`).join(", ")}`);
if (problems) console.log(`${problems} exercise(s) disagree or fail: see docs/course-test/findings.html`);
