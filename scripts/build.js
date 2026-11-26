// Build dist/ratmath.global.js: one file for a plain <script> tag (from a CDN
// such as jsDelivr or unpkg) that sets a global `Ratmath`.
//
//   bun run build
const out = await Bun.build({
  entrypoints: ["./scripts/global-entry.js"],
  outdir: "./dist",
  naming: "ratmath.global.js",
  target: "browser",
  format: "iife",
  minify: { whitespace: true, syntax: true, identifiers: true, keepNames: true },
});
if (!out.success) {
  for (const m of out.logs) console.error(m);
  process.exit(1);
}
console.log(`dist/ratmath.global.js written (${(out.outputs[0].size / 1024).toFixed(0)} KB)`);
