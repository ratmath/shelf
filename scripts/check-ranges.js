// Checks that the RatMath Shelf packages can be installed together from npm.
//
//   bun scripts/check-ranges.js              reads each library's package.json on GitHub main
//   bun scripts/check-ranges.js --dir DIR    reads DIR/<library>/package.json (local clones)
//
// For every library: each @ratmath/<sibling> range in `dependencies` must accept
// that sibling's current version (under 0.x, ^0.2.0 rejects 0.3.0, and npm then
// stops with "No matching version found"); Core must be a peer dependency, never
// a dependency; no workspace: ranges. For this package (ratmath): each library
// range must accept that library's version, and every library's Core peer range
// must accept the Core version ratmath asks for. Exits 1 on any problem.
import { readFileSync } from "node:fs";
import { join } from "node:path";
const dirAt = process.argv.indexOf("--dir");
const dir = dirAt > 0 ? process.argv[dirAt + 1] : null;

async function manifest(name) {
  if (dir) return JSON.parse(readFileSync(join(dir, name, "package.json"), "utf8"));
  const url = `https://raw.githubusercontent.com/ratmath/${name}/main/package.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

const LIBS = [
  "algebraic", "analytic", "discrete", "logic",
  "structures", "linalg", "numtheory", "geo", "complex", "chaos", "stats",
  "symbolic", "graphics", "finance",
];
const pkgs = Object.fromEntries(await Promise.all(LIBS.map(async (n) => [n, await manifest(n)])));
const self = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const coreWanted = self.dependencies["@ratmath/core"].replace(/^[\^~]/, "");
const problems = [];
const short = (name) => name.replace(/^@ratmath\//, "");

for (const n of LIBS) {
  const p = pkgs[n];
  for (const [dep, range] of Object.entries(p.dependencies ?? {})) {
    if (!dep.startsWith("@ratmath/")) continue;
    if (range.startsWith("workspace:")) { problems.push(`${n}: ${dep} is "${range}", which npm cannot resolve`); continue; }
    if (dep === "@ratmath/core") { problems.push(`${n}: Core is in dependencies; it belongs in peerDependencies`); continue; }
    const sib = pkgs[short(dep)];
    if (!sib) { problems.push(`${n}: depends on ${dep}, which is not a Shelf library`); continue; }
    if (!Bun.semver.satisfies(sib.version, range)) problems.push(`${n}: ${dep} "${range}" rejects ${short(dep)} ${sib.version}`);
  }
  const peer = p.peerDependencies?.["@ratmath/core"];
  if (!peer) problems.push(`${n}: no @ratmath/core peer dependency`);
  else if (!Bun.semver.satisfies(coreWanted, peer)) problems.push(`${n}: Core peer "${peer}" rejects Core ${coreWanted}, which ratmath uses`);
}
for (const n of LIBS) {
  const range = self.dependencies[`@ratmath/${n}`];
  if (!range) { problems.push(`ratmath: no dependency on @ratmath/${n}`); continue; }
  if (!Bun.semver.satisfies(pkgs[n].version, range)) problems.push(`ratmath: @ratmath/${n} "${range}" rejects ${n} ${pkgs[n].version}`);
}

for (const n of LIBS) console.log(`${n.padEnd(11)} ${pkgs[n].version}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n  ` + problems.join("\n  "));
  process.exit(1);
}
console.log(`\nAll ranges fit (${dir ? `from ${dir}` : "from GitHub main"}).`);
